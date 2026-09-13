/**
 * Live place-name resolver.
 *
 * The generated data in lib/i18n/place-data covers well-known places offline. Everything
 * else - a small town, a village, a place that only recently got a Wikidata entry - is
 * resolved here on first sight and then cached three times over:
 *
 *   1. in memory, for the rest of the session
 *   2. in AsyncStorage, so the device never asks twice
 *   3. in the `place_names` table, so the first viewer resolves it for everybody
 *
 * Wikidata is the source because one request returns the name in all twelve languages at
 * once, it needs no API key, and its labels are the exonyms people actually use
 * ("Köstence" for Constanța, "コンスタンツァ" in Japanese).
 *
 * Nothing here blocks rendering: a card shows the stored name immediately and upgrades if
 * and when a better one arrives.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SUPPORTED_LANGUAGES, type LanguageCode } from './i18n';
import {
    findCityEntry,
    findCountryEntry,
    getCountryCode,
    normalizeLocationString,
} from './location-formatter';
import { captureError } from './sentry';
import { supabase } from './supabase';

const STORAGE_PREFIX = '@odyssey_place:';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const LANGUAGES = Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];

/** Wikidata answers in European Portuguese and Traditional Chinese unless asked otherwise */
const LABEL_PREFERENCE: Partial<Record<LanguageCode, string[]>> = {
    pt: ['pt-br', 'pt'],
    zh: ['zh-hans', 'zh-cn', 'zh'],
};

export interface LocalizedPlace {
    /** Stable key this place is cached under */
    key: string;
    /** Wikidata entity id, when the name was resolved from Wikidata */
    wikidataId?: string;
    /** City name per language; a language is absent when Wikidata has no label for it */
    names: Partial<Record<LanguageCode, string>>;
    /** ISO 3166-1 alpha-2 country code, when known */
    countryCode?: string;
}

export interface PlaceQuery {
    city?: string | null;
    country?: string | null;
}

const memoryCache = new Map<string, LocalizedPlace | null>();
/** In-flight lookups, so a list of ten cards from one city makes one request */
const pending = new Map<string, Promise<LocalizedPlace | null>>();

/**
 * Cache key for a place: the folded city name plus the ISO country code, so "Springfield, US"
 * and "Springfield, GB" stay apart.
 *
 * When the post did not record a country, the bundled data supplies it: otherwise one city
 * would key two ways ('madrid' and 'madrid|ES') depending on what the geocoder happened to
 * store, splitting the cache in half.
 */
export function placeKeyFor(query: PlaceQuery): string {
    const city = normalizeLocationString(query.city || '');
    if (!city) return '';

    const code =
        (query.country ? getCountryCode(query.country) : '') || findCityEntry(query.city || '')?.cc || '';

    return code ? `${city}|${code}` : city;
}

/** The offline answer, or null when the generated data does not know this place */
export function resolveFromGeneratedData(query: PlaceQuery): LocalizedPlace | null {
    const key = placeKeyFor(query);
    if (!key) return null;

    const entry = findCityEntry(query.city || '');
    if (!entry) return null;

    return {
        key,
        wikidataId: entry.q,
        names: { ...entry.names, en: entry.base },
        countryCode: entry.cc,
    };
}

// --------------------------------------------------------------------------- //
// Caches
// --------------------------------------------------------------------------- //

async function readFromStorage(key: string): Promise<LocalizedPlace | null> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_PREFIX + key);
        return raw ? (JSON.parse(raw) as LocalizedPlace) : null;
    } catch {
        return null;
    }
}

async function writeToStorage(place: LocalizedPlace): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_PREFIX + place.key, JSON.stringify(place));
    } catch {
        // A full or unavailable store is not worth failing a render over
    }
}

async function readFromSupabase(key: string): Promise<LocalizedPlace | null> {
    try {
        const { data, error } = await supabase
            .from('place_names')
            .select('key, wikidata_id, names, country_code')
            .eq('key', key)
            .maybeSingle();

        if (error || !data) return null;
        return {
            key: data.key,
            wikidataId: data.wikidata_id || undefined,
            names: (data.names || {}) as Partial<Record<LanguageCode, string>>,
            countryCode: data.country_code || undefined,
        };
    } catch {
        return null;
    }
}

async function writeToSupabase(place: LocalizedPlace): Promise<void> {
    try {
        await supabase.from('place_names').upsert(
            {
                key: place.key,
                wikidata_id: place.wikidataId ?? null,
                names: place.names,
                country_code: place.countryCode ?? null,
            },
            // The table has no UPDATE policy: a cached name is written once and never
            // rewritten from a client, so a concurrent insert is simply ignored.
            { onConflict: 'key', ignoreDuplicates: true }
        );
    } catch (error) {
        // Sharing the result is a bonus, not a requirement
        captureError(error as Error, { context: 'PlaceNames.writeToSupabase', key: place.key });
    }
}

// --------------------------------------------------------------------------- //
// Wikidata
// --------------------------------------------------------------------------- //

async function searchOnce(term: string): Promise<string | null> {
    const params = new URLSearchParams({
        action: 'wbsearchentities',
        format: 'json',
        origin: '*',
        language: 'en',
        uselang: 'en',
        type: 'item',
        limit: '5',
        search: term,
    });

    const res = await fetch(`${WIKIDATA_API}?${params.toString()}`);
    if (!res.ok) throw new Error(`Wikidata search failed: HTTP ${res.status}`);
    const json = (await res.json()) as { search?: { id: string }[] };
    return json.search?.[0]?.id ?? null;
}

/**
 * The best Wikidata entity id for a place name, or null.
 *
 * The country narrows the search, but it has to be given in English: a post saved on a
 * Turkish device stores "Türkiye", and searching English Wikidata for "Kemer Türkiye" finds
 * nothing at all. So translate the country first, then fall back to the city alone.
 */
async function searchWikidata(city: string, country?: string | null): Promise<string | null> {
    const englishCountry = country ? findCountryEntry(country)?.base : undefined;

    if (englishCountry) {
        const withCountry = await searchOnce(`${city} ${englishCountry}`);
        if (withCountry) return withCountry;
    }

    return searchOnce(city);
}

/** Labels for one entity in every supported language */
async function fetchWikidataLabels(entityId: string): Promise<Partial<Record<LanguageCode, string>>> {
    const requested = [...new Set(LANGUAGES.flatMap((lang) => LABEL_PREFERENCE[lang] || [lang]))];
    const params = new URLSearchParams({
        action: 'wbgetentities',
        format: 'json',
        origin: '*',
        props: 'labels',
        languages: requested.join('|'),
        ids: entityId,
    });

    const res = await fetch(`${WIKIDATA_API}?${params.toString()}`);
    if (!res.ok) throw new Error(`Wikidata labels failed: HTTP ${res.status}`);

    const json = (await res.json()) as {
        entities?: Record<string, { labels?: Record<string, { value: string }> }>;
    };
    const labels = json.entities?.[entityId]?.labels || {};

    const names: Partial<Record<LanguageCode, string>> = {};
    for (const lang of LANGUAGES) {
        for (const candidate of LABEL_PREFERENCE[lang] || [lang]) {
            const label = labels[candidate];
            if (label?.value) {
                names[lang] = label.value;
                break;
            }
        }
    }
    return names;
}

// --------------------------------------------------------------------------- //
// Resolution
// --------------------------------------------------------------------------- //

async function resolveUncached(key: string, query: PlaceQuery): Promise<LocalizedPlace | null> {
    const stored = await readFromStorage(key);
    if (stored) return stored;

    const shared = await readFromSupabase(key);
    if (shared) {
        await writeToStorage(shared);
        return shared;
    }

    try {
        const entityId = await searchWikidata(query.city!, query.country);
        if (!entityId) return null;

        const names = await fetchWikidataLabels(entityId);
        if (Object.keys(names).length === 0) return null;

        const place: LocalizedPlace = {
            key,
            wikidataId: entityId,
            names,
            countryCode: query.country ? getCountryCode(query.country) || undefined : undefined,
        };

        await writeToStorage(place);
        await writeToSupabase(place);
        return place;
    } catch {
        // Offline or rate-limited: the caller keeps showing the stored name
        return null;
    }
}

/**
 * Resolves a place to its names in all twelve languages.
 *
 * Returns the offline answer immediately when the generated data covers the place, so most
 * calls never touch the network.
 */
export async function resolvePlaceNames(query: PlaceQuery): Promise<LocalizedPlace | null> {
    if (!query.city || !query.city.trim()) return null;

    const key = placeKeyFor(query);
    if (!key) return null;

    const offline = resolveFromGeneratedData(query);
    if (offline) return offline;

    if (memoryCache.has(key)) return memoryCache.get(key) ?? null;

    const inFlight = pending.get(key);
    if (inFlight) return inFlight;

    const promise = resolveUncached(key, query)
        .then((place) => {
            memoryCache.set(key, place);
            return place;
        })
        .finally(() => {
            pending.delete(key);
        });

    pending.set(key, promise);
    return promise;
}

/**
 * The name for one language, or undefined when this place has no name in it.
 * Falls back to English, then to whatever name exists.
 */
export function pickName(place: LocalizedPlace | null, language: string): string | undefined {
    if (!place) return undefined;
    const lang = String(language || 'en').toLowerCase().split('-')[0] as LanguageCode;
    return place.names[lang] || place.names.en || Object.values(place.names)[0];
}

/** Clears the in-memory cache. Used by tests. */
export function clearPlaceNameCache(): void {
    memoryCache.clear();
    pending.clear();
}
