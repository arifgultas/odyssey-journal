/**
 * Finds user-visible text that never goes through t().
 *
 * The other four checks in i18n-check.js all assume the text is *in* the translation files.
 * They cannot see the failure that actually shipped: a string written straight into the JSX,
 * an English title handed to the native share sheet, an Alert with its wording inline. That
 * text simply never changes language, and nothing fails until someone reads the screen.
 *
 * The scan is deliberately conservative - no parser, and only the shapes that are nearly
 * always real prose. Anything it flags on purpose goes in scripts/i18n-allowed-literals.json.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCAN_DIRS = ['app', 'components', 'hooks', 'context'];
const ALLOWED_FILE = path.join(__dirname, 'i18n-allowed-literals.json');

/** Props whose value is read out to the user rather than used as an identifier */
const TEXT_PROPS = [
    'title', 'placeholder', 'label', 'accessibilityLabel', 'accessibilityHint',
    'dialogTitle', 'subtitle', 'header', 'emptyText', 'message', 'confirmText',
    'cancelText', 'headerTitle',
];

/** Object keys with the same role, e.g. Share.share({ title: '...' }) */
const TEXT_KEYS = ['title', 'message', 'dialogTitle', 'headerTitle', 'body'];

const RULES = [
    {
        id: 'jsx-text',
        // Text sitting directly between two tags: <Text>Save changes</Text>. The closing
        // `</` matters: it is what separates real JSX text from a type such as
        // `Promise<void>`, where the following `<` opens a generic rather than a tag.
        // Segments containing { } are skipped - those are expressions, not literals.
        re: />([^<>{}\n]+)<\//g,
    },
    {
        id: 'prop',
        re: new RegExp(`\\b(?:${TEXT_PROPS.join('|')})\\s*=\\s*["']([^"'\\n]+)["']`, 'g'),
    },
    {
        id: 'object-key',
        re: new RegExp(`\\b(?:${TEXT_KEYS.join('|')})\\s*:\\s*['"]([^'"\\n]+)['"]`, 'g'),
    },
    {
        id: 'alert',
        re: /Alert\.alert\(\s*['"]([^'"\n]+)['"]/g,
    },
];

/**
 * Prose, as opposed to an identifier, a path, a style value or a piece of punctuation.
 * A literal has to contain a letter and either a space or an uppercase start to count -
 * that keeps `flex-start`, `image/jpeg`, `chevron-back` and `#F5F1E8` out of the results.
 */
function looksLikeProse(text) {
    const value = text.trim();
    if (value.length < 2) return false;
    if (!/[A-Za-zÀ-ÿĞğİıŞşÇçÖöÜü]/.test(value)) return false;

    // Technical shapes that are never shown as words
    if (/^[a-z0-9]+([-_./][a-z0-9]+)+$/.test(value)) return false; // kebab/snake/path/mime
    if (/^[a-z][a-zA-Z0-9]*$/.test(value)) return false; // a bare camelCase identifier
    if (/^[#$%@<>=+*/\\|~^&]/.test(value)) return false;
    if (/^https?:\/\//.test(value)) return false;
    if (/^\d+(\.\d+)*$/.test(value)) return false;

    return true;
}

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
            walk(full, out);
        } else if (/\.tsx?$/.test(entry.name)) {
            out.push(full);
        }
    }
    return out;
}

function loadAllowed() {
    if (!fs.existsSync(ALLOWED_FILE)) return { byFile: {}, global: new Set() };
    const raw = JSON.parse(fs.readFileSync(ALLOWED_FILE, 'utf8'));
    const byFile = {};
    for (const [file, values] of Object.entries(raw)) {
        if (file.startsWith('_')) continue;
        if (file === '*') continue;
        byFile[file] = new Set(values);
    }
    return { byFile, global: new Set(raw['*'] || []) };
}

/** Strips // and /* *​/ comments so Turkish notes to developers are not mistaken for UI text */
function stripComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
}

/**
 * @returns {{file: string, line: number, rule: string, text: string}[]}
 */
function findLiterals() {
    const { byFile, global } = loadAllowed();
    const findings = [];

    for (const dir of SCAN_DIRS) {
        const abs = path.join(ROOT, dir);
        if (!fs.existsSync(abs)) continue;

        for (const file of walk(abs)) {
            const relative = path.relative(ROOT, file).split(path.sep).join('/');
            const allowed = byFile[relative] || new Set();
            const source = stripComments(fs.readFileSync(file, 'utf8'));
            const lineStarts = [];
            for (let i = 0, at = 0; at !== -1; i++) {
                lineStarts.push(at);
                at = source.indexOf('\n', at);
                if (at !== -1) at += 1;
            }

            for (const rule of RULES) {
                rule.re.lastIndex = 0;
                let match;
                while ((match = rule.re.exec(source))) {
                    const text = match[1].trim();
                    if (!looksLikeProse(text)) continue;
                    if (global.has(text) || allowed.has(text)) continue;

                    let line = 1;
                    while (line < lineStarts.length && lineStarts[line] <= match.index) line++;
                    findings.push({ file: relative, line, rule: rule.id, text });
                }
            }
        }
    }

    return findings;
}

module.exports = { findLiterals, looksLikeProse, ALLOWED_FILE };
