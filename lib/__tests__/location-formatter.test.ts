import {
    formatPostLocation,
    getLocalizedCityName,
    getLocalizedCountryCode,
    getLocalizedCountryName,
} from '../location-formatter';

describe('location-formatter utility', () => {
    describe('getLocalizedCityName', () => {
        it('translates Bucharest and Bükreş correctly in both directions', () => {
            // From Turkish to English
            expect(getLocalizedCityName('Bükreş', 'en')).toBe('Bucharest');
            expect(getLocalizedCityName('Bükreş', 'tr')).toBe('Bükreş');

            // From English to Turkish
            expect(getLocalizedCityName('Bucharest', 'tr')).toBe('Bükreş');
            expect(getLocalizedCityName('Bucharest', 'en')).toBe('Bucharest');

            // From Romanian to English/Turkish
            expect(getLocalizedCityName('București', 'en')).toBe('Bucharest');
            expect(getLocalizedCityName('București', 'tr')).toBe('Bükreş');
        });

        it('translates Istanbul / İstanbul correctly', () => {
            expect(getLocalizedCityName('İstanbul', 'en')).toBe('Istanbul');
            expect(getLocalizedCityName('Istanbul', 'tr')).toBe('İstanbul');
            expect(getLocalizedCityName('İstanbul', 'tr')).toBe('İstanbul');
        });

        it('translates major European and world cities', () => {
            // Rome / Roma
            expect(getLocalizedCityName('Rome', 'tr')).toBe('Roma');
            expect(getLocalizedCityName('Roma', 'en')).toBe('Rome');

            // Vienna / Viyana
            expect(getLocalizedCityName('Vienna', 'tr')).toBe('Viyana');
            expect(getLocalizedCityName('Viyana', 'en')).toBe('Vienna');

            // Prague / Prag
            expect(getLocalizedCityName('Prague', 'tr')).toBe('Prag');
            expect(getLocalizedCityName('Prag', 'en')).toBe('Prague');

            // Munich / Münih
            expect(getLocalizedCityName('Munich', 'tr')).toBe('Münih');
            expect(getLocalizedCityName('Münih', 'en')).toBe('Munich');

            // Athens / Atina
            expect(getLocalizedCityName('Athens', 'tr')).toBe('Atina');
            expect(getLocalizedCityName('Atina', 'en')).toBe('Athens');

            // London / Londra
            expect(getLocalizedCityName('London', 'tr')).toBe('Londra');
            expect(getLocalizedCityName('Londra', 'en')).toBe('London');

            // Cairo / Kahire
            expect(getLocalizedCityName('Cairo', 'tr')).toBe('Kahire');
            expect(getLocalizedCityName('Kahire', 'en')).toBe('Cairo');

            // Jerusalem / Kudüs
            expect(getLocalizedCityName('Jerusalem', 'tr')).toBe('Kudüs');
            expect(getLocalizedCityName('Kudüs', 'en')).toBe('Jerusalem');
        });

        it('handles unknown cities cleanly without crashing', () => {
            // Unknown Turkish city converted to clean ASCII Latin for English to prevent font clipping
            expect(getLocalizedCityName('Eskişehir', 'en')).toBe('Eskisehir');
            expect(getLocalizedCityName('Eskişehir', 'tr')).toBe('Eskişehir');
            expect(getLocalizedCityName('', 'en')).toBe('');
        });
    });

    describe('getLocalizedCountryCode', () => {
        it('returns RO for Romania in both languages', () => {
            expect(getLocalizedCountryCode('Romania', 'tr')).toBe('RO');
            expect(getLocalizedCountryCode('Romanya', 'tr')).toBe('RO');
            expect(getLocalizedCountryCode('Romania', 'en')).toBe('RO');
            expect(getLocalizedCountryCode('Romanya', 'en')).toBe('RO');
        });

        it('returns localized abbreviations for Spain (İSP for tr, ES for en)', () => {
            expect(getLocalizedCountryCode('Spain', 'tr')).toBe('İSP');
            expect(getLocalizedCountryCode('İspanya', 'tr')).toBe('İSP');
            expect(getLocalizedCountryCode('Spain', 'en')).toBe('ES');
            expect(getLocalizedCountryCode('İspanya', 'en')).toBe('ES');
        });

        it('returns TR for Turkey in both Turkish and English', () => {
            expect(getLocalizedCountryCode('Turkey', 'tr')).toBe('TR');
            expect(getLocalizedCountryCode('Türkiye', 'tr')).toBe('TR');
            expect(getLocalizedCountryCode('Turkey', 'en')).toBe('TR');
            expect(getLocalizedCountryCode('Türkiye', 'en')).toBe('TR');
        });

        it('returns localized abbreviations for Italy, Germany, France, USA, UK', () => {
            expect(getLocalizedCountryCode('Italy', 'tr')).toBe('İTA');
            expect(getLocalizedCountryCode('Italy', 'en')).toBe('IT');

            expect(getLocalizedCountryCode('Germany', 'tr')).toBe('ALM');
            expect(getLocalizedCountryCode('Germany', 'en')).toBe('DE');

            expect(getLocalizedCountryCode('France', 'tr')).toBe('FR');
            expect(getLocalizedCountryCode('France', 'en')).toBe('FR');

            expect(getLocalizedCountryCode('United States', 'tr')).toBe('ABD');
            expect(getLocalizedCountryCode('United States', 'en')).toBe('US');

            expect(getLocalizedCountryCode('United Kingdom', 'tr')).toBe('İNG');
            expect(getLocalizedCountryCode('United Kingdom', 'en')).toBe('UK');
        });

        it('handles fallback cleanly for unrecognized country', () => {
            expect(getLocalizedCountryCode('Atlantis', 'tr')).toBe('AT');
            expect(getLocalizedCountryCode('Atlantis', 'en')).toBe('AT');
            expect(getLocalizedCountryCode('', 'tr')).toBe('');
        });
    });

    describe('getLocalizedCountryName', () => {
        it('returns full country names in user language', () => {
            expect(getLocalizedCountryName('Romania', 'tr')).toBe('Romanya');
            expect(getLocalizedCountryName('Romanya', 'en')).toBe('Romania');
            expect(getLocalizedCountryName('Spain', 'tr')).toBe('İspanya');
            expect(getLocalizedCountryName('İspanya', 'en')).toBe('Spain');
        });
    });

    describe('formatPostLocation', () => {
        it('formats Bucharest / Bükreş correctly according to viewer language', () => {
            // Given a post saved with Turkish city/country
            const locTr = { city: 'Bükreş', country: 'Romanya' };
            expect(formatPostLocation(locTr, 'tr')).toBe('Bükreş, RO');
            expect(formatPostLocation(locTr, 'en')).toBe('Bucharest, RO');

            // Given a post saved with English city/country
            const locEn = { city: 'Bucharest', country: 'Romania' };
            expect(formatPostLocation(locEn, 'tr')).toBe('Bükreş, RO');
            expect(formatPostLocation(locEn, 'en')).toBe('Bucharest, RO');
        });

        it('formats Madrid, Spain correctly according to viewer language', () => {
            const loc = { city: 'Madrid', country: 'Spain' };
            expect(formatPostLocation(loc, 'tr')).toBe('Madrid, İSP');
            expect(formatPostLocation(loc, 'en')).toBe('Madrid, ES');
        });

        it('formats Istanbul, Turkey correctly', () => {
            const loc = { city: 'İstanbul', country: 'Türkiye' };
            expect(formatPostLocation(loc, 'tr')).toBe('İstanbul, TR');
            expect(formatPostLocation(loc, 'en')).toBe('Istanbul, TR');
        });

        it('auto-resolves country code when only city is provided for known cities', () => {
            expect(formatPostLocation({ city: 'Bükreş' }, 'en')).toBe('Bucharest, RO');
            expect(formatPostLocation({ city: 'Bükreş' }, 'tr')).toBe('Bükreş, RO');
            expect(formatPostLocation({ city: 'Rome' }, 'tr')).toBe('Roma, İTA');
            expect(formatPostLocation({ city: 'Roma' }, 'en')).toBe('Rome, IT');
        });

        it('extracts city and country from comma-separated location name or address', () => {
            expect(formatPostLocation({ name: 'Bükreş, Romanya' }, 'en')).toBe('Bucharest, RO');
            expect(formatPostLocation({ address: 'Bucharest, Romania' }, 'tr')).toBe('Bükreş, RO');
        });

        it('formats in Italian (it) and other languages correctly', () => {
            const locBucharest = { city: 'Bükreş', country: 'Romanya' };
            expect(formatPostLocation(locBucharest, 'it')).toBe('Bucarest, RO');
            expect(formatPostLocation(locBucharest, 'de')).toBe('Bukarest, RO');

            const locRome = { city: 'Rome', country: 'Italy' };
            expect(formatPostLocation(locRome, 'it')).toBe('Roma, IT');
            expect(formatPostLocation(locRome, 'de')).toBe('Rom, IT');

            const locMadrid = { city: 'Madrid', country: 'Spain' };
            expect(formatPostLocation(locMadrid, 'it')).toBe('Madrid, ES');

            expect(getLocalizedCountryName('Romania', 'it')).toBe('Romania');
            expect(getLocalizedCountryName('Germany', 'it')).toBe('Germania');
            expect(getLocalizedCountryName('Spain', 'it')).toBe('Spagna');
            expect(getLocalizedCountryName('Turkey', 'it')).toBe('Turchia');
        });

        it('handles missing city or missing country gracefully', () => {
            expect(formatPostLocation({ country: 'France' }, 'tr')).toBe('FR');
            expect(formatPostLocation(null, 'tr', 'Default Title')).toBe('Default Title');
        });
    });
});
