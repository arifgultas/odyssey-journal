#!/usr/bin/env node
/**
 * Backfills the localized place names on posts that were saved before the app resolved them.
 *
 * For every post with a location it works out the canonical place key, the ISO country code
 * and the city name in all twelve languages, writes them onto the post, and fills the shared
 * `place_names` cache so the app never has to look that place up again.
 *
 * Each distinct place is resolved once, no matter how many posts share it.
 *
 * Usage:
 *   node scripts/backfill-place-names.js --preview     # what every place resolves to (anon key)
 *   node scripts/backfill-place-names.js --dry-run     # what would change, post by post
 *   node scripts/backfill-place-names.js               # apply
 *   node scripts/backfill-place-names.js --limit=200   # work through a slice at a time
 *
 * Writing needs a service-role key, because posts belong to their authors:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-place-names.js
 *
 * --preview needs no service key: it lists places through the destination RPCs, which are
 * SECURITY DEFINER, instead of scanning the posts table.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const args = process.argv.slice(2);
const PREVIEW = args.includes('--preview');
const DRY_RUN = args.includes('--dry-run') || PREVIEW;
const argValue = (name, fallback) => {
    const hit = args.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.split('=')[1] : fallback;
};
const LIMIT = Number(argValue('limit', 0));
const PAGE_SIZE = 500;

const LANGS = ['en', 'tr', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'ja', 'ko', 'zh', 'ar'];
const LABEL_PREFERENCE = { pt: ['pt-br', 'pt'], zh: ['zh-hans', 'zh-cn', 'zh'] };
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const USER_AGENT = 'odyssey-journal-backfill/1.0 (https://github.com/arifgultas/odyssey-journal)';

// --------------------------------------------------------------------------- //
// Environment
// --------------------------------------------------------------------------- //

/**
 * Reads the env files without adding a dependency just for this script.
 *
 * .env.local is read first and wins, because .easignore keeps .env in the archive uploaded
 * to Expo's build servers - that is how the EXPO_PUBLIC_* keys reach a build. The service
 * role key bypasses every row-level security policy and has no business going along for
 * that ride, so it belongs in .env.local, which .easignore excludes.
 */
function loadEnv() {
    for (const name of ['.env.local', '.env']) {
        const file = path.join(ROOT, name);
        if (!fs.existsSync(file)) continue;
        for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
            const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
            // First file to define a name wins, and a real environment variable beats both
            if (match && !process.env[match[1]]) {
                process.env[match[1]] = match[2].replace(/^["']|["']$/g, '').trim();
            }
        }
    }
}

loadEnv();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
    console.error('EXPO_PUBLIC_SUPABASE_URL is not set.');
    process.exit(1);
}

// A dry run only reads, so the anon key is enough to preview the work. Writing needs the
// service role key, because posts belong to their authors.
const API_KEY = SERVICE_KEY || (DRY_RUN ? ANON_KEY : null);

if (!API_KEY) {
    console.error(
        'SUPABASE_SERVICE_ROLE_KEY is not set. Posts belong to their authors, so writing to\n' +
            'them needs the service role key (Supabase dashboard > Project settings > API).\n' +
            'Re-run with --dry-run to preview using the anon key instead.'
    );
    process.exit(1);
}

// --------------------------------------------------------------------------- //
// The app's own place logic, reused so the backfill and the app agree
// --------------------------------------------------------------------------- //

/** Mirrors normalizeLocationString in lib/location-formatter.ts */
function normalize(value) {
    return String(value || '')
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .replace(/ı/g, 'i')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim();
}

/** Parses the generated modules, which hold a JSON payload in a template literal */
function loadGenerated(file) {
    const source = fs.readFileSync(path.join(ROOT, 'lib', 'i18n', 'place-data', file), 'utf8');
    const marker = 'const PAYLOAD = `';
    const start = source.indexOf(marker) + marker.length;
    const end = source.indexOf('`;', start);
    const backslash = String.fromCharCode(92);
    const payload = source
        .slice(start, end)
        .split(backslash + '`')
        .join('`')
        .split(backslash + '${')
        .join('${')
        .split(backslash + backslash)
        .join(backslash);
    return JSON.parse(payload);
}

const cities = loadGenerated('cities.generated.ts');
const countries = loadGenerated('countries.generated.ts');

const cityByName = new Map();
for (const place of cities) {
    for (const name of [place.base, ...Object.values(place.names)]) {
        const key = normalize(name);
        if (key && !cityByName.has(key)) cityByName.set(key, place);
    }
    for (const alias of place.aliases) {
        if (alias && !cityByName.has(alias)) cityByName.set(alias, place);
    }
}

const countryByName = new Map();
for (const country of countries) {
    for (const name of [country.code, country.base, ...Object.values(country.names)]) {
        const key = normalize(name);
        if (key && !countryByName.has(key)) countryByName.set(key, country);
    }
    for (const alias of country.aliases) {
        if (alias && !countryByName.has(alias)) countryByName.set(alias, country);
    }
}

function countryCodeOf(value) {
    const match = countryByName.get(normalize(value));
    return match ? match.code : '';
}

function placeKeyFor(city, country) {
    const normalizedCity = normalize(city);
    if (!normalizedCity) return '';
    // Same fallback as placeKeyFor in lib/place-names.ts: when the post recorded no country,
    // take it from the bundled data so one city does not key two different ways.
    const bundled = cityByName.get(normalizedCity);
    const code = countryCodeOf(country) || (bundled ? bundled.cc : '');
    return code ? `${normalizedCity}|${code}` : normalizedCity;
}

// --------------------------------------------------------------------------- //
// Supabase REST
// --------------------------------------------------------------------------- //

async function supabaseRequest(method, pathAndQuery, body, extraHeaders) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
        method,
        headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            ...extraHeaders,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw new Error(`${method} ${pathAndQuery} failed: HTTP ${res.status} ${await res.text()}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

/** Every distinct place, via the destination RPCs, which do not need the service key */
async function fetchDestinations(limit) {
    const seen = new Map();

    for (const rpc of ['get_popular_destinations', 'get_trending_locations']) {
        let rows;
        try {
            rows = await supabaseRequest('POST', `rpc/${rpc}`, { p_limit: limit });
        } catch (error) {
            console.log(`  ${rpc} unavailable: ${error.message.split('\n')[0]}`);
            continue;
        }
        for (const row of rows || []) {
            const key = row.place_key || row.location_name;
            if (!key || seen.has(key)) continue;
            seen.set(key, {
                locationName: row.location_name,
                city: row.city,
                countryCode: row.country_code,
                postCount: Number(row.post_count) || 0,
            });
        }
    }

    return [...seen.values()].sort((a, b) => b.postCount - a.postCount);
}

/** place_key only exists once migration 027 has been applied */
let selectColumns = 'id,location,location_name,place_key';

async function fetchPostPage(offset, pageSize) {
    const query = () =>
        `posts?select=${selectColumns}&or=(location_name.not.is.null,location.not.is.null)` +
        `&order=created_at.asc&offset=${offset}&limit=${pageSize}`;

    try {
        return await supabaseRequest('GET', query());
    } catch (error) {
        if (selectColumns.includes('place_key') && /place_key/.test(String(error.message))) {
            console.log('  posts.place_key not found - migration 027 has not been applied yet.');
            selectColumns = 'id,location,location_name';
            return supabaseRequest('GET', query());
        }
        throw error;
    }
}

// --------------------------------------------------------------------------- //
// Wikidata
// --------------------------------------------------------------------------- //

async function wikidata(params) {
    const res = await fetch(`${WIKIDATA_API}?${params}`, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`Wikidata request failed: HTTP ${res.status}`);
    return res.json();
}

async function searchWikidata(term) {
    const search = await wikidata(
        `action=wbsearchentities&format=json&language=en&uselang=en&type=item&limit=1&search=` +
            encodeURIComponent(term)
    );
    return (search.search && search.search[0] && search.search[0].id) || null;
}

/**
 * The country narrows the search but has to be in English: a post saved on a Turkish device
 * stores "Türkiye", and English Wikidata finds nothing for "Kemer Türkiye".
 */
async function resolveFromWikidata(city, country) {
    const countryEntry = countryByName.get(normalize(country));
    const englishCountry = countryEntry ? countryEntry.base : '';

    let entityId = englishCountry ? await searchWikidata(`${city} ${englishCountry}`) : null;
    if (!entityId) entityId = await searchWikidata(city);
    if (!entityId) return null;

    const requested = [...new Set(LANGS.flatMap((lang) => LABEL_PREFERENCE[lang] || [lang]))];
    const entities = await wikidata(
        `action=wbgetentities&format=json&props=labels&languages=${requested.join('|')}&ids=${entityId}`
    );
    const labels = (entities.entities && entities.entities[entityId] && entities.entities[entityId].labels) || {};

    const names = {};
    for (const lang of LANGS) {
        for (const candidate of LABEL_PREFERENCE[lang] || [lang]) {
            if (labels[candidate] && labels[candidate].value) {
                names[lang] = labels[candidate].value;
                break;
            }
        }
    }
    return Object.keys(names).length ? { wikidataId: entityId, names } : null;
}

// --------------------------------------------------------------------------- //
// Resolution, once per distinct place
// --------------------------------------------------------------------------- //

const resolvedPlaces = new Map();

async function resolvePlace(city, country) {
    const key = placeKeyFor(city, country);
    if (!key) return null;
    if (resolvedPlaces.has(key)) return resolvedPlaces.get(key);

    const offline = cityByName.get(normalize(city));
    let place;

    if (offline) {
        place = {
            key,
            wikidataId: offline.q,
            names: { ...offline.names, en: offline.base },
            countryCode: countryCodeOf(country) || offline.cc,
            source: 'bundled',
        };
    } else {
        const live = await resolveFromWikidata(city, country);
        place = live
            ? { key, wikidataId: live.wikidataId, names: live.names, countryCode: countryCodeOf(country), source: 'wikidata' }
            : { key, names: {}, countryCode: countryCodeOf(country), source: 'unresolved' };
    }

    resolvedPlaces.set(key, place);
    return place;
}

/** The city and country a post was saved with, however it was stored */
function locationOf(post) {
    const location = post.location || {};
    let city = (location.city || '').trim();
    let country = (location.country || '').trim();

    if (!city && post.location_name) {
        const parts = String(post.location_name).split(',');
        city = (parts[0] || '').trim();
        if (!country && parts.length > 1) country = (parts[1] || '').trim();
    }
    return { city, country };
}

// --------------------------------------------------------------------------- //

/**
 * Shows what every place in the database would resolve to, without touching the posts table.
 */
async function preview() {
    console.log('Preview: listing places through the destination RPCs, writing nothing.');
    console.log(`Bundled data: ${cities.length} places, ${countries.length} countries.`);

    const destinations = await fetchDestinations(LIMIT || 200);
    if (destinations.length === 0) {
        console.log('No destinations returned - the database has no posts with a location yet.');
        return;
    }

    console.log(`${destinations.length} distinct place(s), most posted first:`);
    console.log('');

    const summary = { bundled: 0, wikidata: 0, unresolved: 0 };

    for (const destination of destinations) {
        const { city, country } = locationOf({ location_name: destination.locationName });
        const place = await resolvePlace(city, country);

        if (!place || place.source === 'unresolved') {
            summary.unresolved++;
            console.log(`  ${destination.locationName}  ->  could not resolve`);
            continue;
        }
        summary[place.source]++;

        const show = (lang) => place.names[lang] || place.names.en || city;
        console.log(`  ${destination.locationName}  (${destination.postCount} post)`);
        console.log(`      key: ${place.key}    country: ${place.countryCode || '-'}    via: ${place.source}`);
        console.log(`      tr: ${show('tr')}    en: ${show('en')}    ja: ${show('ja')}    ru: ${show('ru')}`);
    }

    console.log('');
    console.log(`From the bundled data: ${summary.bundled}`);
    console.log(`Looked up on Wikidata: ${summary.wikidata}`);
    console.log(`Unresolved:            ${summary.unresolved}`);
    console.log('');
    console.log('To write these onto the posts:');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=... npm run i18n:backfill -- --dry-run   # then without --dry-run');
}

async function main() {
    if (PREVIEW) return preview();

    console.log(DRY_RUN ? 'Dry run: nothing will be written.' : 'Applying changes.');
    console.log(`Using the ${SERVICE_KEY ? 'service role' : 'anon'} key.`);
    if (!SERVICE_KEY) {
        console.log('Note: row-level security applies, so only publicly readable posts are counted.');
    }
    console.log(`Bundled data: ${cities.length} places, ${countries.length} countries.`);

    const stats = { scanned: 0, skipped: 0, updated: 0, unresolved: 0, cached: 0 };
    let offset = 0;

    for (;;) {
        const pageSize = LIMIT ? Math.min(PAGE_SIZE, LIMIT - stats.scanned) : PAGE_SIZE;
        if (pageSize <= 0) break;

        const posts = await fetchPostPage(offset, pageSize);
        if (!posts || posts.length === 0) break;

        for (const post of posts) {
            stats.scanned++;
            const { city, country } = locationOf(post);
            if (!city) {
                stats.skipped++;
                continue;
            }

            const place = await resolvePlace(city, country);
            if (!place) {
                stats.skipped++;
                continue;
            }
            if (place.source === 'unresolved') {
                stats.unresolved++;
                console.log(`  unresolved: ${city}${country ? ', ' + country : ''} (post ${post.id})`);
                continue;
            }

            const location = {
                ...(post.location || {}),
                city: post.location && post.location.city ? post.location.city : city,
                country: post.location && post.location.country ? post.location.country : country || undefined,
                countryCode: place.countryCode || undefined,
                wikidataId: place.wikidataId,
                placeKey: place.key,
                localizedNames: place.names,
            };

            if (!DRY_RUN) {
                await supabaseRequest('PATCH', `posts?id=eq.${post.id}`, {
                    location,
                    place_key: place.key,
                });
            }
            stats.updated++;
        }

        offset += posts.length;
        console.log(`  ${stats.scanned} posts scanned, ${stats.updated} to update...`);
        if (posts.length < pageSize) break;
    }

    // Share every place that had to be looked up, so no device repeats the work
    const toCache = [...resolvedPlaces.values()].filter((place) => place.source === 'wikidata');
    if (toCache.length && !DRY_RUN) {
        await supabaseRequest(
            'POST',
            'place_names?on_conflict=key',
            toCache.map((place) => ({
                key: place.key,
                wikidata_id: place.wikidataId || null,
                names: place.names,
                country_code: place.countryCode || null,
            })),
            { Prefer: 'resolution=ignore-duplicates,return=minimal' }
        );
    }
    stats.cached = toCache.length;

    console.log('');
    console.log(`Scanned:            ${stats.scanned}`);
    console.log(`Updated:            ${stats.updated}${DRY_RUN ? ' (would be)' : ''}`);
    console.log(`No usable location: ${stats.skipped}`);
    console.log(`Could not resolve:  ${stats.unresolved}`);
    console.log(`Distinct places:    ${resolvedPlaces.size} (${stats.cached} looked up live and cached)`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
