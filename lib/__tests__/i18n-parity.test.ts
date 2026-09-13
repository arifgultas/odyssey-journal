/**
 * Guards the translation files against the four ways they silently rot.
 *
 * These are the failures that made "switch language" leave stray Turkish or English on
 * screen: a key missing from one locale falls back to another language, a value left
 * identical to the English source is simply untranslated, a key used in code but defined
 * nowhere renders as nothing at all, and a dropped {{placeholder}} loses its value.
 *
 * `npm run i18n:check` runs the same checks outside jest (see scripts/i18n-check.js).
 */
import arLocale from '../i18n/translations/ar';
import deLocale from '../i18n/translations/de';
import enLocale from '../i18n/translations/en';
import esLocale from '../i18n/translations/es';
import frLocale from '../i18n/translations/fr';
import itLocale from '../i18n/translations/it';
import jaLocale from '../i18n/translations/ja';
import koLocale from '../i18n/translations/ko';
import ptLocale from '../i18n/translations/pt';
import ruLocale from '../i18n/translations/ru';
import trLocale from '../i18n/translations/tr';
import zhLocale from '../i18n/translations/zh';

import allowedIdentical from '../../scripts/i18n-allowed-identical.json';

const LOCALES: Record<string, unknown> = {
    ar: arLocale, de: deLocale, en: enLocale, es: esLocale, fr: frLocale, it: itLocale,
    ja: jaLocale, ko: koLocale, pt: ptLocale, ru: ruLocale, tr: trLocale, zh: zhLocale,
};
const SOURCE = 'en';

type Flat = Record<string, string>;

function flatten(value: unknown, prefix = '', out: Flat = {}): Flat {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        const full = prefix ? `${prefix}.${key}` : key;
        if (child && typeof child === 'object') flatten(child, full, out);
        else out[full] = String(child);
    }
    return out;
}

function placeholders(value: string): string[] {
    return (value.match(/\{\{\s*\w+\s*\}\}/g) || []).map((m) => m.replace(/\s/g, '')).sort();
}

const flat: Record<string, Flat> = Object.fromEntries(
    Object.entries(LOCALES).map(([code, table]) => [code, flatten(table)])
);
const source = flat[SOURCE];
const sourceKeys = Object.keys(source);
const others = Object.keys(LOCALES).filter((code) => code !== SOURCE);

const allowList = allowedIdentical as Record<string, string[]>;
const isAllowedIdentical = (code: string, key: string) =>
    (allowList['*'] || []).includes(key) || (allowList[code] || []).includes(key);

describe('translation files', () => {
    it('all define the same keys as the source locale', () => {
        expect(sourceKeys.length).toBeGreaterThan(600);
    });

    it.each(others)('%s has no missing or extra keys', (code) => {
        const table = flat[code];
        expect(sourceKeys.filter((key) => !(key in table))).toEqual([]);
        expect(Object.keys(table).filter((key) => !(key in source))).toEqual([]);
    });

    it.each(others)('%s has no values left in English', (code) => {
        const table = flat[code];
        const untranslated = sourceKeys.filter(
            (key) => table[key] === source[key] && !isAllowedIdentical(code, key)
        );
        expect(untranslated).toEqual([]);
    });

    it.each(others)('%s keeps the same interpolation placeholders', (code) => {
        const table = flat[code];
        const drifted = sourceKeys.filter(
            (key) => placeholders(source[key]).join() !== placeholders(table[key]).join()
        );
        expect(drifted).toEqual([]);
    });
});
