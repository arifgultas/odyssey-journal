/**
 * Shared loader for the i18n checking tooling.
 * The locale files are plain TS object literals (`export default { ... };`),
 * so they can be evaluated as JS once the export statement is stripped.
 */
const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '..', 'lib', 'i18n', 'translations');
const SOURCE_LOCALE = 'en';

function loadLocale(code) {
    const file = path.join(TRANSLATIONS_DIR, `${code}.ts`);
    const raw = fs.readFileSync(file, 'utf8');
    const body = raw.replace(/^\s*export\s+default\s*/m, 'return ').replace(/;\s*$/, '');
    // eslint-disable-next-line no-new-func
    return new Function(body)();
}

function listLocales() {
    return fs
        .readdirSync(TRANSLATIONS_DIR)
        .filter((f) => f.endsWith('.ts'))
        .map((f) => f.replace(/\.ts$/, ''))
        .sort();
}

/** Flattens a nested translation object into { 'a.b.c': 'value' } */
function flatten(obj, prefix = '', out = {}) {
    for (const [key, value] of Object.entries(obj)) {
        const full = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            flatten(value, full, out);
        } else {
            out[full] = value;
        }
    }
    return out;
}

function loadAll() {
    const locales = {};
    for (const code of listLocales()) {
        locales[code] = flatten(loadLocale(code));
    }
    return locales;
}

/** Placeholders like {{count}} used by i18n-js interpolation */
function placeholders(value) {
    return String(value).match(/\{\{\s*\w+\s*\}\}/g)?.map((m) => m.replace(/\s/g, '')).sort() || [];
}

module.exports = { TRANSLATIONS_DIR, SOURCE_LOCALE, loadLocale, listLocales, flatten, loadAll, placeholders };
