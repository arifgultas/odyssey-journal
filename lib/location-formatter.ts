/**
 * Location Formatter
 *
 * Turns whatever a device geocoder wrote into a post ("Constanța", "Bucuresti", "Bükreş")
 * into the name the current viewer should read ("Köstence" in Turkish, "コンスタンツァ" in
 * Japanese) plus the country abbreviation their language uses.
 *
 * The name data is generated from Wikidata into lib/i18n/place-data (see
 * scripts/generate-place-data.js). Only places whose name actually differs between
 * languages are in there, because a name that is spelled the same everywhere needs no
 * translation. Anything the data does not cover is resolved at runtime by
 * lib/place-names.ts and cached, and until that answer arrives the raw name is shown.
 *
 * All lookups are exact (after folding case and accents). The previous version matched
 * loosely on substrings, which made "Atlantis" resolve to Austria.
 */
import type { LanguageCode } from './i18n';
import { generatedCities, type GeneratedPlace } from './i18n/place-data/cities.generated';
import { generatedCountries, type GeneratedCountry } from './i18n/place-data/countries.generated';
import { getAbbreviationsByLanguage, getCountryAbbreviation } from './i18n/place-data/country-abbr';

export interface PostLocationData {
    city?: string;
    country?: string;
    address?: string;
    name?: string;
    /** ISO 3166-1 alpha-2 code, resolved when the post was saved */
    countryCode?: string;
    /** City name per language, resolved when the post was saved */
    localizedNames?: Partial<Record<string, string>>;
}

/** Kept for callers that referenced the old exported shapes */
export type CountryData = GeneratedCountry;
export type CityTranslation = GeneratedPlace;

/**
 * Spellings a geocoder or an older release may have stored that are not a Wikidata label:
 * informal names, abbreviations and the codes this app itself used to write.
 */
const COUNTRY_CODE_ALIASES: Record<string, string> = {
    usa: 'US',
    'united states of america': 'US',
    america: 'US',
    uk: 'GB',
    'great britain': 'GB',
    britain: 'GB',
    england: 'GB',
    scotland: 'GB',
    wales: 'GB',
    'northern ireland': 'GB',
    holland: 'NL',
    // Written by releases before the ISO code was stored
    ing: 'GB',
    abd: 'US',
};

// --------------------------------------------------------------------------- //
// Normalization
// --------------------------------------------------------------------------- //

/**
 * Folds a name for matching: Turkish dotted/dotless i collapse together, accents are
 * stripped, case is dropped. Non-Latin scripts pass through unchanged.
 *
 * Must stay in step with normalize() in scripts/generate-place-data.js, which pre-folds
 * the aliases in the generated data.
 */
export function normalizeLocationString(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .replace(/ı/g, 'i')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim();
}

/**
 * Replaces the letters that exist only in Turkish, for viewers reading another language.
 *
 * Deliberately narrow: ö, ü and ç are shared with German, French and others, so folding
 * them would damage names like "Göttingen". Only ı/İ, ş/Ş and ğ/Ğ are folded.
 */
function foldTurkishOnlyLetters(value: string): string {
    return value
        .replace(/İ/g, 'I')
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 'S')
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'G');
}

function toLang(language: string | LanguageCode | undefined): string {
    return String(language || 'en').toLowerCase().split('-')[0];
}

// --------------------------------------------------------------------------- //
// Lookup indexes, built once on first use
// --------------------------------------------------------------------------- //

interface CityIndexes {
    /** Official names in any of the twelve languages */
    primary: Map<string, GeneratedPlace>;
    /** Local spellings; consulted only when no official name matches */
    alias: Map<string, GeneratedPlace>;
}

let cityIndexes: CityIndexes | null = null;

function getCityIndexes(): CityIndexes {
    if (cityIndexes) return cityIndexes;

    const primary = new Map<string, GeneratedPlace>();
    const alias = new Map<string, GeneratedPlace>();

    for (const place of generatedCities()) {
        for (const name of [place.base, ...Object.values(place.names)]) {
            const key = normalizeLocationString(name as string);
            if (key && !primary.has(key)) primary.set(key, place);
        }
        for (const key of place.aliases) {
            if (key && !alias.has(key)) alias.set(key, place);
        }
    }

    cityIndexes = { primary, alias };
    return cityIndexes;
}

interface CountryIndexes {
    byCode: Map<string, GeneratedCountry>;
    byName: Map<string, GeneratedCountry>;
}

let countryIndexes: CountryIndexes | null = null;

function getCountryIndexes(): CountryIndexes {
    if (countryIndexes) return countryIndexes;

    const byCode = new Map<string, GeneratedCountry>();
    const byName = new Map<string, GeneratedCountry>();

    for (const country of generatedCountries()) {
        byCode.set(country.code, country);
        for (const name of [country.code, country.base, ...Object.values(country.names)]) {
            const key = normalizeLocationString(name as string);
            if (key && !byName.has(key)) byName.set(key, country);
        }
        for (const key of country.aliases) {
            if (key && !byName.has(key)) byName.set(key, country);
        }
    }

    // The abbreviations the app itself prints have to resolve back to their country,
    // otherwise a post saved as "İS" would stop being recognised as Spain.
    for (const table of Object.values(getAbbreviationsByLanguage())) {
        for (const [code, abbreviation] of Object.entries(table || {})) {
            const key = normalizeLocationString(abbreviation);
            const country = byCode.get(code);
            if (key && country && !byName.has(key)) byName.set(key, country);
        }
    }

    for (const [key, code] of Object.entries(COUNTRY_CODE_ALIASES)) {
        const country = byCode.get(code);
        if (country && !byName.has(key)) byName.set(key, country);
    }

    countryIndexes = { byCode, byName };
    return countryIndexes;
}

// --------------------------------------------------------------------------- //
// Cities
// --------------------------------------------------------------------------- //

/** The generated entry for a city name written in any supported or local language */
export function findCityEntry(cityString: string): GeneratedPlace | null {
    const key = normalizeLocationString(cityString);
    if (!key) return null;
    const { primary, alias } = getCityIndexes();
    return primary.get(key) || alias.get(key) || null;
}

/**
 * The city name to display, e.g. getLocalizedCityName('Constanța', 'tr') -> 'Köstence'.
 * Unknown places keep the name they were saved with.
 */
export function getLocalizedCityName(cityString: string, language: string = 'en'): string {
    if (!cityString || typeof cityString !== 'string') return '';
    const trimmed = cityString.trim();
    if (!trimmed) return '';

    const lang = toLang(language);
    const match = findCityEntry(trimmed);
    const name = match ? match.names[lang] || match.base : trimmed;

    return lang === 'tr' ? name : foldTurkishOnlyLetters(name);
}

// --------------------------------------------------------------------------- //
// Countries
// --------------------------------------------------------------------------- //

/** The generated entry for a country written as a name, an ISO code or an abbreviation */
export function findCountryEntry(countryString: string): GeneratedCountry | null {
    const key = normalizeLocationString(countryString);
    if (!key) return null;
    return getCountryIndexes().byName.get(key) || null;
}

/** The ISO 3166-1 alpha-2 code for a country written in any form, or '' */
export function getCountryCode(countryString?: string | null): string {
    if (!countryString) return '';
    const match = findCountryEntry(countryString);
    return match ? match.code : '';
}

/**
 * The country abbreviation for the viewer's language: 'İS' in Turkish, '西' in Japanese
 * and Chinese, the ISO code everywhere else (see place-data/country-abbr.ts).
 */
export function getLocalizedCountryCode(countryString: string, language: string = 'en'): string {
    if (!countryString || typeof countryString !== 'string') return '';
    const trimmed = countryString.trim();
    if (!trimmed) return '';

    const lang = toLang(language);
    const match = findCountryEntry(trimmed);
    if (match) return getCountryAbbreviation(match.code, lang);

    // Unknown value: if it already looks like a code, keep it, otherwise shorten it.
    if (trimmed.length <= 3 && !trimmed.includes(' ')) return trimmed.toUpperCase();
    return lang === 'tr' ? trimmed.slice(0, 2).toLocaleUpperCase('tr-TR') : trimmed.slice(0, 2).toUpperCase();
}

/** The full country name in the viewer's language, e.g. 'Romania' -> 'Romanya' in Turkish */
export function getLocalizedCountryName(countryString: string, language: string = 'en'): string {
    if (!countryString || typeof countryString !== 'string') return '';
    const trimmed = countryString.trim();
    if (!trimmed) return '';

    const lang = toLang(language);
    const match = findCountryEntry(trimmed);
    if (!match) return trimmed;
    return match.names[lang] || match.base;
}

// --------------------------------------------------------------------------- //
// Post cards
// --------------------------------------------------------------------------- //

/** Splits "Bükreş, Romanya" into its city and country halves */
function splitCityAndCountry(value: string): { city?: string; country?: string } {
    if (!value.includes(',')) return { city: value.trim() };
    const parts = value.split(',');
    return { city: parts[0]?.trim(), country: parts[1]?.trim() };
}

/**
 * The location line on a post card: "Köstence, RO" for a Turkish viewer,
 * "コンスタンツァ, RO" for a Japanese one, "Constanța, RO" in English.
 */
export function formatPostLocation(
    location?: PostLocationData | null,
    language: string = 'en',
    fallbackTitle: string = ''
): string {
    if (!location) return fallbackTitle || '';

    const lang = toLang(language);

    let rawCity = location.city?.trim();
    let rawCountry = location.country?.trim();

    // Older posts only carry a combined name or address
    if (!rawCity && (location.name || location.address)) {
        const parts = splitCityAndCountry((location.name || location.address)!.trim());
        rawCity = parts.city;
        rawCountry = rawCountry || parts.country;
    }
    if (rawCity?.includes(',')) {
        const parts = splitCityAndCountry(rawCity);
        rawCity = parts.city;
        rawCountry = rawCountry || parts.country;
    }

    const cityEntry = rawCity ? findCityEntry(rawCity) : null;

    // Prefer what was resolved when the post was saved, then the generated data
    const localizedCity =
        location.localizedNames?.[lang] ||
        (rawCity ? getLocalizedCityName(rawCity, lang) : '');

    const countryCode = location.countryCode || getCountryCode(rawCountry) || cityEntry?.cc || '';
    const localizedCountryCode = countryCode
        ? getCountryAbbreviation(countryCode, lang)
        : rawCountry
          ? getLocalizedCountryCode(rawCountry, lang)
          : '';

    if (localizedCity && localizedCountryCode) return `${localizedCity}, ${localizedCountryCode}`;
    if (localizedCity) return localizedCity;
    if (localizedCountryCode) return localizedCountryCode;

    return location.name || location.address || fallbackTitle || '';
}

/**
 * The location a post card should display, taking the structured `location` when the post
 * has one and otherwise splitting the denormalized `location_name` column.
 */
export function postLocationOf(post: {
    location?: PostLocationData | null;
    location_name?: string | null;
    title?: string;
}): PostLocationData | undefined {
    if (post.location) return post.location;
    if (!post.location_name) return undefined;

    const { city, country } = splitCityAndCountry(post.location_name);
    return { city, country, name: post.location_name };
}
