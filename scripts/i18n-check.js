#!/usr/bin/env node
/**
 * i18n consistency checker.
 *
 * Guards the five ways translations silently rot:
 *   1. a locale is missing a key another locale has  -> user sees the fallback language
 *   2. a locale still holds the English value        -> user sees English
 *   3. code references a key no locale defines       -> user sees nothing at all
 *   4. interpolation placeholders drift              -> user sees a literal {{count}}
 *   5. text never reaches a locale file at all       -> user sees it in one fixed language
 *
 * Run: npm run i18n:check
 */
const fs = require('fs');
const path = require('path');
const { loadAll, SOURCE_LOCALE } = require('./i18n-lib.js');
const { findLiterals } = require('./i18n-literals.js');

const ROOT = path.join(__dirname, '..');
const SCAN_DIRS = ['app', 'components', 'hooks', 'lib', 'context'];
const ALLOWED_IDENTICAL_FILE = path.join(__dirname, 'i18n-allowed-identical.json');

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
            walk(full, out);
        } else if (/\.(ts|tsx)$/.test(entry.name) && !full.includes(path.join('i18n', 'translations'))) {
            out.push(full);
        }
    }
    return out;
}

/** Collects t('some.key') / hasTranslation('some.key') literals used in source */
function usedKeys() {
    const found = new Map();
    for (const dir of SCAN_DIRS) {
        const abs = path.join(ROOT, dir);
        if (!fs.existsSync(abs)) continue;
        for (const file of walk(abs)) {
            const src = fs.readFileSync(file, 'utf8');
            // A complete literal argument only - t('categories.' + id) is dynamic, not a key.
            const re = /\b(?:t|hasTranslation)\(\s*'([a-zA-Z][\w./-]*\w)'\s*[,)]/g;
            let m;
            while ((m = re.exec(src))) {
                if (!found.has(m[1])) found.set(m[1], path.relative(ROOT, file));
            }
        }
    }
    return found;
}

const allowedIdentical = fs.existsSync(ALLOWED_IDENTICAL_FILE)
    ? JSON.parse(fs.readFileSync(ALLOWED_IDENTICAL_FILE, 'utf8'))
    : {};

const locales = loadAll();
const source = locales[SOURCE_LOCALE];
const sourceKeys = Object.keys(source);
const problems = [];

// 1 + 4: key parity and placeholder parity against the source locale
for (const [code, table] of Object.entries(locales)) {
    if (code === SOURCE_LOCALE) continue;

    const missing = sourceKeys.filter((k) => !(k in table));
    if (missing.length) problems.push(`[${code}] ${missing.length} missing key(s): ${missing.join(', ')}`);

    const extra = Object.keys(table).filter((k) => !(k in source));
    if (extra.length) problems.push(`[${code}] ${extra.length} key(s) not in ${SOURCE_LOCALE}: ${extra.join(', ')}`);

    const { placeholders } = require('./i18n-lib.js');
    const drift = sourceKeys.filter(
        (k) => k in table && placeholders(source[k]).join() !== placeholders(table[k]).join()
    );
    if (drift.length) problems.push(`[${code}] placeholder mismatch: ${drift.join(', ')}`);
}

// 2: values left identical to English
for (const [code, table] of Object.entries(locales)) {
    if (code === SOURCE_LOCALE) continue;
    const allowed = new Set([...(allowedIdentical['*'] || []), ...(allowedIdentical[code] || [])]);
    const untranslated = sourceKeys.filter((k) => k in table && table[k] === source[k] && !allowed.has(k));
    if (untranslated.length) {
        problems.push(`[${code}] ${untranslated.length} value(s) still in English: ${untranslated.join(', ')}`);
    }
}

// 3: keys used in code but defined nowhere
const used = usedKeys();
const undefinedKeys = [...used.entries()].filter(([key]) => !(key in source));
if (undefinedKeys.length) {
    problems.push(
        `[code] ${undefinedKeys.length} key(s) used but not defined in ${SOURCE_LOCALE}:\n` +
            undefinedKeys.map(([k, f]) => `    ${k}  (${f})`).join('\n')
    );
}

// 5: user-visible text that never goes through t() in the first place
const literals = findLiterals();
if (literals.length) {
    problems.push(
        `[code] ${literals.length} literal(s) shown to the user without t():\n` +
            literals.map((l) => `    ${l.file}:${l.line}  ${JSON.stringify(l.text)}`).join('\n') +
            '\n    (intentional ones belong in scripts/i18n-allowed-literals.json)'
    );
}

if (problems.length) {
    console.error('i18n check FAILED\n');
    for (const p of problems) console.error('  - ' + p + '\n');
    process.exit(1);
}

console.log(
    `i18n check passed: ${Object.keys(locales).length} locales x ${sourceKeys.length} keys, ` +
        `${used.size} keys referenced in code, no untranslated literals on screen.`
);
