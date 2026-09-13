#!/usr/bin/env node
/**
 * Generates the offline place-name data from Wikidata.
 *
 * Why: city and country names differ per language (Constanța is "Köstence" in Turkish,
 * "コンスタンツァ" in Japanese). Maintaining that by hand does not scale, and calling an API
 * while rendering a post card is too slow, so the exonyms are baked into the bundle here.
 * Anything missing falls back to the live resolver in lib/place-names.ts.
 *
 * Size trick: most names are identical across languages ("Madrid" everywhere), so a
 * language is only stored when its label differs from the English one. What remains is the
 * set of names that actually need translating - the exonyms.
 *
 * Query shape matters: the public SPARQL endpoint times out on anything that walks the
 * subclass tree (`wdt:P31/wdt:P279* wd:Q486972`), so places are selected by "has a
 * population and a country" and the administrative divisions that sneak in are dropped by
 * their English label. Population bands keep each query well under the time limit.
 *
 * Run: npm run i18n:places [-- --min-population=100000]
 * Responses are cached under .place-data-cache/ so re-runs are cheap and resumable.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/** Languages shown in the app */
const LANGS = ['en', 'tr', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'ja', 'ko', 'zh', 'ar'];
const SOURCE_LANG = 'en';

/**
 * Wikidata often labels in European Portuguese and Traditional Chinese, while the app's own
 * translations are Brazilian Portuguese and Simplified Chinese. Ask for the regional
 * variants too and prefer them, so generated names match the rest of the UI.
 */
const LABEL_PREFERENCE = {
    pt: ['pt-br', 'pt'],
    zh: ['zh-hans', 'zh-cn', 'zh'],
};
const DISPLAY_LANGS = [...new Set(LANGS.flatMap((lang) => LABEL_PREFERENCE[lang] || [lang]))];

/**
 * Labels fetched only to build match aliases, never displayed. A device geocoder answers in
 * the device locale, so a post can easily be stored as "Bucuresti", "Praha" or "Wien" -
 * spellings none of the twelve app languages use.
 *
 * The API caps the `languages` filter at 50 values, so this list is sized to fit alongside
 * the display languages.
 */
const ALIAS_LANGS = [
    'ro', 'pl', 'cs', 'sk', 'hu', 'hr', 'sl', 'sr', 'bg', 'uk', 'el', 'nl', 'sv', 'da',
    'nb', 'fi', 'et', 'lv', 'lt', 'is', 'sq', 'ca', 'eu', 'gl', 'he', 'fa', 'hi', 'th',
    'vi', 'id', 'ms', 'tl', 'af', 'az', 'ka',
];
const REQUESTED_LANGS = [...DISPLAY_LANGS, ...ALIAS_LANGS];

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'lib', 'i18n', 'place-data');
const CACHE_DIR = path.join(ROOT, '.place-data-cache');
const USER_AGENT = 'odyssey-journal-place-data/1.0 (https://github.com/arifgultas/odyssey-journal)';

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
    const hit = args.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.split('=')[1] : fallback;
};
const MIN_POPULATION = Number(argValue('min-population', 100000));
const LIMIT_PLACES = Number(argValue('limit', 0));
const MAX_ALIASES = 3;

/**
 * Administrative divisions also carry a population and a country, so they come back from
 * the same query. They are recognisable from their English label and are not somewhere a
 * traveller checks in to.
 */
const ADMIN_LABEL =
    /\b(county|province|prefecture|governorate|district|subdistrict|region|department|canton|oblast|raion|rayon|voivodeship|okrug|municipality|metropolitan area|metropolitan region|metropolitan city|urban area|agglomeration|conurbation|regency|arrondissement|comune|commune of|ward of|borough of|parish of)\b/i;

// --------------------------------------------------------------------------- //
// HTTP with an on-disk cache
// --------------------------------------------------------------------------- //

function cachePath(key) {
    return path.join(CACHE_DIR, crypto.createHash('sha1').update(key).digest('hex') + '.json');
}

async function request(url, options, cacheKey) {
    const file = cachePath(cacheKey);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            fs.mkdirSync(CACHE_DIR, { recursive: true });
            fs.writeFileSync(file, JSON.stringify(json), 'utf8');
            return json;
        } catch (error) {
            if (attempt === 3) throw error;
            await new Promise((r) => setTimeout(r, attempt * 4000));
        }
    }
}

/** SPARQL over POST: the queries are long enough that a GET URL gets rejected */
function sparql(query) {
    return request(
        'https://query.wikidata.org/sparql',
        {
            method: 'POST',
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'application/sparql-results+json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'query=' + encodeURIComponent(query),
        },
        'sparql:' + query
    );
}

function wikidataApi(params) {
    const url = 'https://www.wikidata.org/w/api.php?format=json&' + params;
    return request(url, { headers: { 'User-Agent': USER_AGENT } }, url);
}

// --------------------------------------------------------------------------- //
// Wikidata queries
// --------------------------------------------------------------------------- //

/** ISO 3166-1 alpha-2 code for every country, keyed by entity id */
async function fetchCountries() {
    const json = await sparql(`
        SELECT ?country ?iso WHERE {
            ?country wdt:P297 ?iso .
            FILTER NOT EXISTS { ?country wdt:P576 ?dissolved }
        }`);

    const isoByQid = new Map();
    const qidByIso = new Map();
    for (const row of json.results.bindings) {
        const qid = row.country.value.split('/').pop();
        const iso = row.iso.value.toUpperCase();
        if (!isoByQid.has(qid)) isoByQid.set(qid, iso);
        if (!qidByIso.has(iso)) qidByIso.set(iso, qid);
    }
    return { isoByQid, qidByIso };
}

/**
 * Populated places in one population band, worldwide.
 *
 * A GeoNames id and coordinates are required because "has a population and a country" alone
 * also matches things that are not places at all - Wikidata carries a population figure on
 * some election and census items. Banding keeps each query well under the time limit.
 */
async function fetchPlacesInBand(min, max) {
    const upper = max === Infinity ? '' : `FILTER(?population < ${max})`;
    const json = await sparql(`
        SELECT ?place ?population ?country WHERE {
            ?place wdt:P1082 ?population ;
                   wdt:P17 ?country ;
                   wdt:P1566 ?geonamesId ;
                   wdt:P625 ?coordinates .
            FILTER(?population >= ${min})
            ${upper}
        }`);

    return json.results.bindings.map((row) => ({
        qid: row.place.value.split('/').pop(),
        population: Number(row.population.value),
        countryQid: row.country.value.split('/').pop(),
    }));
}

/** Capital cities, which travellers name regardless of size */
async function fetchCapitals() {
    const json = await sparql(`
        SELECT ?place ?country WHERE {
            ?country wdt:P297 ?iso ;
                     wdt:P36 ?place .
        }`);
    return json.results.bindings.map((row) => ({
        qid: row.place.value.split('/').pop(),
        population: 0,
        countryQid: row.country.value.split('/').pop(),
    }));
}

/**
 * Classes that count as a place someone can post from, so a candidate's `instance of` can be
 * checked locally. Cheap on its own; only joining it against every place is expensive.
 *
 * Both roots are needed: "human settlement" alone misses Madrid, Paris and Rome, which
 * Wikidata classes only as a municipality/commune of their country.
 */
const PLACE_CLASS_ROOTS = [
    'Q486972', // human settlement
    'Q15284', // municipality
];

async function fetchSettlementClasses() {
    const classes = new Set();
    for (const root of PLACE_CLASS_ROOTS) {
        const json = await sparql(`SELECT DISTINCT ?class WHERE { ?class wdt:P279* wd:${root} }`);
        for (const row of json.results.bindings) classes.add(row.class.value.split('/').pop());
    }
    return classes;
}

/** `instance of` values for up to 200 entities at a time */
async function fetchTypes(qids) {
    const values = qids.map((qid) => 'wd:' + qid).join(' ');
    const json = await sparql(`
        SELECT ?place ?type WHERE {
            VALUES ?place { ${values} }
            ?place wdt:P31 ?type .
        }`);

    const out = new Map();
    for (const row of json.results.bindings) {
        const qid = row.place.value.split('/').pop();
        const type = row.type.value.split('/').pop();
        if (!out.has(qid)) out.set(qid, []);
        out.get(qid).push(type);
    }
    return out;
}

/** Labels for up to 50 entities at a time */
async function fetchLabels(qids) {
    const json = await wikidataApi(
        `action=wbgetentities&props=labels&languages=${REQUESTED_LANGS.join('|')}&ids=${qids.join('|')}`
    );

    const out = new Map();
    for (const [qid, entity] of Object.entries(json.entities || {})) {
        const labels = entity.labels || {};

        const names = {};
        for (const lang of LANGS) {
            for (const candidate of LABEL_PREFERENCE[lang] || [lang]) {
                if (labels[candidate] && labels[candidate].value) {
                    names[lang] = labels[candidate].value;
                    break;
                }
            }
        }

        const aliases = [];
        for (const lang of ALIAS_LANGS) {
            if (labels[lang] && labels[lang].value) aliases.push(labels[lang].value);
        }

        if (Object.keys(names).length > 0) out.set(qid, { names, aliases });
    }
    return out;
}

async function fetchLabelsInBatches(qids, onProgress) {
    const result = new Map();
    for (let i = 0; i < qids.length; i += 50) {
        const labels = await fetchLabels(qids.slice(i, i + 50));
        for (const [qid, entry] of labels) result.set(qid, entry);
        if (onProgress) onProgress(Math.min(i + 50, qids.length), qids.length);
    }
    return result;
}

// --------------------------------------------------------------------------- //
// Names and aliases
// --------------------------------------------------------------------------- //

const BACKSLASH = String.fromCharCode(92);

/**
 * Same folding as normalizeLocationString in lib/location-formatter.ts: aliases are stored
 * pre-normalized so the app matches them without transforming anything at runtime.
 */
function normalize(value) {
    return String(value)
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .replace(/ı/g, 'i')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim();
}

const LATIN_ONLY = /^[a-z0-9 .'-]+$/;

/**
 * Normalized spellings worth indexing for matching. Only Latin-script forms are kept: they
 * are what a geocoder is likely to return that the twelve display languages do not already
 * cover, and anything else would cost bundle size for little gain.
 */
function matchAliases(entry) {
    const covered = new Set(Object.values(entry.names).map(normalize));
    const out = [];
    for (const alias of entry.aliases || []) {
        const key = normalize(alias);
        if (!key || covered.has(key) || !LATIN_ONLY.test(key)) continue;
        covered.add(key);
        out.push(key);
        if (out.length === MAX_ALIASES) break;
    }
    return out;
}

/** Keeps only the languages whose label differs from the English one */
function differingNames(names) {
    const base = names[SOURCE_LANG];
    const out = {};
    for (const lang of LANGS) {
        if (lang === SOURCE_LANG) continue;
        if (names[lang] && names[lang] !== base) out[lang] = names[lang];
    }
    return out;
}

// --------------------------------------------------------------------------- //
// Emitting the TypeScript modules
// --------------------------------------------------------------------------- //

/**
 * Writes one generated module.
 *
 * The payload is a JSON string parsed on first access rather than an object literal:
 * TypeScript cannot type-check an array literal with thousands of entries ("union type too
 * complex to represent"), the string costs less in the bundle, and the parse only happens
 * if something actually looks a place up.
 */
function write(file, header, typeName, typeBody, constName, entries) {
    const payload = JSON.stringify(entries)
        .split(BACKSLASH)
        .join(BACKSLASH + BACKSLASH)
        .split('`')
        .join(BACKSLASH + '`')
        .split('${')
        .join(BACKSLASH + '${');

    const lines = [
        '/**',
        ' * Generated by scripts/generate-place-data.js - do not edit by hand.',
        ...header.map((line) => (line ? ' * ' + line : ' *')),
        ' */',
        '',
        `export interface ${typeName} {`,
        ...typeBody,
        '}',
        '',
        '/** JSON payload, parsed on first access */',
        `const PAYLOAD = \`${payload}\`;`,
        '',
        `let parsed: ${typeName}[] | null = null;`,
        '',
        `export function ${constName}(): ${typeName}[] {`,
        `    if (!parsed) parsed = JSON.parse(PAYLOAD) as ${typeName}[];`,
        '    return parsed;',
        '}',
        '',
    ];
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const target = path.join(OUT_DIR, file);
    fs.writeFileSync(target, lines.join('\n'), 'utf8');
    return target;
}

function writeCities(entries) {
    return write(
        'cities.generated.ts',
        [
            `Source: Wikidata, populated places with population >= ${MIN_POPULATION} plus every capital.`,
            '',
            '`base` is the English name and `names` holds only the languages that differ from it,',
            'so a language missing from `names` uses `base`.',
            '',
            'Ordered by population, largest first: when two places share a name the app takes',
            'the first entry, and that should be the better-known one.',
        ],
        'GeneratedPlace',
        [
            '    /** Wikidata entity id, also the live resolver cache key */',
            '    q: string;',
            '    /** English name */',
            '    base: string;',
            '    /** ISO 3166-1 alpha-2 country code */',
            '    cc: string;',
            '    /** Localized names keyed by language code, only where they differ from `base` */',
            '    names: Record<string, string>;',
            '    /** Pre-normalized local spellings, for matching only */',
            '    aliases: string[];',
        ],
        'generatedCities',
        entries
    );
}

function writeCountries(entries) {
    return write(
        'countries.generated.ts',
        [
            'Source: Wikidata, every country carrying an ISO 3166-1 alpha-2 code.',
            '',
            '`names` holds the country name per supported language, omitting any language',
            'whose name matches the English one.',
        ],
        'GeneratedCountry',
        [
            '    /** ISO 3166-1 alpha-2 code */',
            '    code: string;',
            '    /** Wikidata entity id */',
            '    q: string;',
            '    /** English name */',
            '    base: string;',
            '    /** Localized names keyed by language code, only where they differ from `base` */',
            '    names: Record<string, string>;',
            '    /** Pre-normalized local spellings, for matching only */',
            '    aliases: string[];',
        ],
        'generatedCountries',
        entries
    );
}

// --------------------------------------------------------------------------- //

async function main() {
    console.log(`Minimum population: ${MIN_POPULATION}`);

    console.log('Fetching countries...');
    const { isoByQid, qidByIso } = await fetchCountries();
    console.log(`  ${qidByIso.size} countries`);

    console.log('Fetching country labels...');
    const countryLabels = await fetchLabelsInBatches([...qidByIso.values()]);

    const countryEntries = [];
    for (const [iso, qid] of qidByIso) {
        const entry = countryLabels.get(qid);
        if (!entry || !entry.names[SOURCE_LANG]) continue;
        countryEntries.push({
            code: iso,
            q: qid,
            base: entry.names[SOURCE_LANG],
            names: differingNames(entry.names),
            aliases: matchAliases(entry),
        });
    }
    countryEntries.sort((a, b) => a.code.localeCompare(b.code));

    const bands = [
        [MIN_POPULATION, 150000],
        [150000, 250000],
        [250000, 500000],
        [500000, 1000000],
        [1000000, Infinity],
    ]
        .filter(([, max]) => max > MIN_POPULATION)
        .map(([min, max]) => [Math.max(min, MIN_POPULATION), max]);

    console.log('Fetching places...');
    const places = new Map();
    const remember = (place) => {
        const iso = isoByQid.get(place.countryQid);
        if (!iso) return;
        const existing = places.get(place.qid);
        if (!existing || existing.population < place.population) {
            places.set(place.qid, { qid: place.qid, population: place.population, cc: iso });
        }
    };

    for (const [min, max] of bands) {
        for (const place of await fetchPlacesInBand(min, max)) remember(place);
        console.log(`  population ${min}-${max === Infinity ? 'up' : max}: ${places.size} places so far`);
    }
    for (const place of await fetchCapitals()) remember(place);
    console.log(`  with capitals: ${places.size} places`);

    let qids = [...places.keys()];
    if (LIMIT_PLACES) qids = qids.slice(0, LIMIT_PLACES);

    console.log('Fetching settlement classes...');
    const settlementClasses = await fetchSettlementClasses();
    console.log(`  ${settlementClasses.size} classes count as a human settlement`);

    console.log('Checking what each candidate is an instance of...');
    const settlementQids = [];
    for (let i = 0; i < qids.length; i += 200) {
        const types = await fetchTypes(qids.slice(i, i + 200));
        for (const [qid, list] of types) {
            if (list.some((type) => settlementClasses.has(type))) settlementQids.push(qid);
        }
        process.stdout.write(`  ${Math.min(i + 200, qids.length)}/${qids.length}\n`);
    }
    console.log(`  ${settlementQids.length} of ${qids.length} candidates are settlements`);
    qids = settlementQids;

    console.log('Fetching place labels...');
    const labels = await fetchLabelsInBatches(qids, (done, total) => {
        if (done % 1000 === 0 || done === total) process.stdout.write(`  ${done}/${total}\n`);
    });

    const candidates = [];
    let identical = 0;
    let adminDivisions = 0;
    for (const qid of qids) {
        const entry = labels.get(qid);
        if (!entry || !entry.names[SOURCE_LANG]) continue;
        if (ADMIN_LABEL.test(entry.names[SOURCE_LANG])) {
            adminDivisions++;
            continue;
        }
        const differing = differingNames(entry.names);
        // A place named the same in every language needs no entry: the stored value already
        // reads correctly, and the country code is resolved separately.
        if (Object.keys(differing).length === 0) {
            identical++;
            continue;
        }
        candidates.push({
            q: qid,
            base: entry.names[SOURCE_LANG],
            cc: places.get(qid).cc,
            names: differing,
            aliases: matchAliases(entry),
            population: places.get(qid).population,
        });
    }

    // Wikidata carries several entities for one place - the city, the surrounding commune,
    // the locality. They would all match the same lookup, so keep the largest per name and
    // country.
    const byName = new Map();
    let duplicates = 0;
    for (const entry of candidates) {
        const key = `${entry.cc}|${entry.base.toLowerCase()}`;
        const existing = byName.get(key);
        if (!existing) {
            byName.set(key, entry);
            continue;
        }
        duplicates++;
        if (entry.population > existing.population) byName.set(key, entry);
    }

    // Ordered by population, largest first, because several places share a name: London in
    // England and London in Ontario, Cambridge in England and in Massachusetts. The app
    // indexes the first entry it sees for a name, so the bigger city has to come first.
    const cityEntries = [...byName.values()]
        .sort((a, b) => b.population - a.population || a.base.localeCompare(b.base))
        .map(({ population, ...entry }) => entry);

    const citiesFile = writeCities(cityEntries);
    const countriesFile = writeCountries(countryEntries);

    const kb = (file) => (fs.statSync(file).size / 1024).toFixed(0) + ' KB';
    console.log('');
    console.log(`Countries: ${countryEntries.length} -> ${countriesFile} (${kb(countriesFile)})`);
    console.log(
        `Places:    ${cityEntries.length} with exonyms ` +
            `(${identical} identical in all languages, ${adminDivisions} administrative divisions ` +
            `and ${duplicates} duplicate entities dropped)`
    );
    console.log(`           -> ${citiesFile} (${kb(citiesFile)})`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
