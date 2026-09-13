/**
 * The cases that motivated the place-name work.
 *
 * A post from Constanța, Romania has to read "Köstence" for a Turkish viewer,
 * "コンスタンツァ" for a Japanese one and "Constanța" in English - and the country has to be
 * abbreviated the way each language actually abbreviates it.
 */
import { getCountryAbbreviation } from '../i18n/place-data/country-abbr';
import {
    formatPostLocation,
    getCountryCode,
    getLocalizedCityName,
    getLocalizedCountryCode,
    getLocalizedCountryName,
    postLocationOf,
} from '../location-formatter';
import { pickName, placeKeyFor, resolveFromGeneratedData } from '../place-names';

describe('place names', () => {
    describe('Constanța', () => {
        const location = { city: 'Constanța', country: 'Romania' };

        it('reads as the exonym each language uses', () => {
            expect(getLocalizedCityName('Constanța', 'tr')).toBe('Köstence');
            expect(getLocalizedCityName('Constanța', 'ja')).toBe('コンスタンツァ');
            expect(getLocalizedCityName('Constanța', 'zh')).toBe('康斯坦察');
            expect(getLocalizedCityName('Constanța', 'ko')).toBe('콘스탄차');
            expect(getLocalizedCityName('Constanța', 'ru')).toBe('Констанца');
            expect(getLocalizedCityName('Constanța', 'en')).toBe('Constanța');
        });

        it('is recognised from the Turkish spelling too', () => {
            expect(getLocalizedCityName('Köstence', 'en')).toBe('Constanța');
            expect(getLocalizedCityName('Köstence', 'ja')).toBe('コンスタンツァ');
        });

        it('formats the card line per language', () => {
            expect(formatPostLocation(location, 'tr')).toBe('Köstence, RO');
            expect(formatPostLocation(location, 'ja')).toBe('コンスタンツァ, RO');
            expect(formatPostLocation(location, 'en')).toBe('Constanța, RO');
        });

        it('resolves offline, without touching the network', () => {
            const resolved = resolveFromGeneratedData(location);
            expect(resolved).not.toBeNull();
            expect(resolved!.countryCode).toBe('RO');
            expect(pickName(resolved, 'tr')).toBe('Köstence');
        });
    });

    describe('country abbreviations', () => {
        it('uses the convention each language actually has', () => {
            // Turkish abbreviates the Turkish name
            expect(getLocalizedCountryCode('Spain', 'tr')).toBe('İS');
            expect(getLocalizedCountryCode('Germany', 'tr')).toBe('AL');
            expect(getLocalizedCountryCode('United States', 'tr')).toBe('ABD');

            // Japanese and Chinese use their single-character abbreviations
            expect(getLocalizedCountryCode('Spain', 'ja')).toBe('西');
            expect(getLocalizedCountryCode('Spain', 'zh')).toBe('西');
            expect(getLocalizedCountryCode('Germany', 'ja')).toBe('独');
            expect(getLocalizedCountryCode('Germany', 'zh')).toBe('德');

            // Languages without a convention get the ISO code
            expect(getLocalizedCountryCode('Spain', 'en')).toBe('ES');
            expect(getLocalizedCountryCode('Spain', 'es')).toBe('ES');
            expect(getLocalizedCountryCode('Spain', 'fr')).toBe('ES');
            expect(getLocalizedCountryCode('Spain', 'de')).toBe('ES');
        });

        it('keeps UK readable while storing the ISO code', () => {
            expect(getCountryCode('United Kingdom')).toBe('GB');
            expect(getCountryAbbreviation('GB', 'en')).toBe('UK');
            expect(getCountryAbbreviation('GB', 'tr')).toBe('İNG');
            expect(getCountryAbbreviation('GB', 'ja')).toBe('英');
        });

        it('reads back names and abbreviations it may have stored', () => {
            expect(getCountryCode('ABD')).toBe('US');
            expect(getCountryCode('USA')).toBe('US');
            expect(getCountryCode('England')).toBe('GB');
            expect(getCountryCode('Türkiye')).toBe('TR');
        });

        it('lets the ISO code win an ambiguous abbreviation', () => {
            // Turkish abbreviates İspanya as "İS", which folds to the same letters as
            // Iceland's ISO code. The standard code wins on purpose: abbreviations are only
            // ever displayed, while a stored country is a full name or an ISO code.
            expect(getCountryCode('İS')).toBe('IS');
            expect(getLocalizedCountryName('İspanya', 'en')).toBe('Spain');
        });
    });

    describe('country names', () => {
        it('translates the full name', () => {
            expect(getLocalizedCountryName('Romania', 'tr')).toBe('Romanya');
            expect(getLocalizedCountryName('Romania', 'ja')).toBe('ルーマニア');
            expect(getLocalizedCountryName('Romanya', 'en')).toBe('Romania');
            expect(getLocalizedCountryName('Türkiye', 'it')).toBe('Turchia');
        });
    });

    describe('lookups are exact', () => {
        it('does not guess a country from a partial match', () => {
            // The previous loose matching resolved this to Austria
            expect(getCountryCode('Atlantis')).toBe('');
            expect(getCountryCode('Atlantic City')).toBe('');
        });

        it('prefers the better-known place when a name is shared', () => {
            expect(getLocalizedCityName('London', 'tr')).toBe('Londra');
        });
    });

    describe('place keys', () => {
        it('are stable across spellings of the same city', () => {
            const fromTurkish = placeKeyFor({ city: 'Köstence', country: 'Romanya' });
            const fromRomanian = placeKeyFor({ city: 'Constanța', country: 'Romania' });
            expect(fromTurkish).toBe('kostence|RO');
            expect(fromRomanian).toBe('constanta|RO');
            // Different spellings key differently, but both carry the country, so the
            // resolver can merge them through Wikidata.
            expect(fromTurkish.endsWith('|RO')).toBe(true);
            expect(fromRomanian.endsWith('|RO')).toBe(true);
        });

        it('separates places that share a name in different countries', () => {
            expect(placeKeyFor({ city: 'Springfield', country: 'United States' })).toBe('springfield|US');
            expect(placeKeyFor({ city: 'Springfield', country: 'United Kingdom' })).toBe('springfield|GB');
        });
    });

    describe('postLocationOf', () => {
        it('prefers the structured location', () => {
            const location = { latitude: 1, longitude: 2, city: 'Constanța', country: 'Romania' };
            expect(postLocationOf({ location, location_name: 'ignored' })).toBe(location);
        });

        it('falls back to splitting the denormalized column', () => {
            expect(postLocationOf({ location_name: 'Bükreş, Romanya' })).toEqual({
                city: 'Bükreş',
                country: 'Romanya',
                name: 'Bükreş, Romanya',
            });
        });

        it('returns nothing when the post has no location', () => {
            expect(postLocationOf({})).toBeUndefined();
        });
    });
});
