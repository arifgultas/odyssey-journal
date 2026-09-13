#!/usr/bin/env node
/**
 * Re-indents the locale files with four spaces per nesting level.
 *
 * Several files drifted into inconsistent indentation over time (zh and ja nested whole
 * sections at 8-12 spaces), which makes them hard to diff and easy to edit wrongly.
 * Only whitespace is touched: the script refuses to write if the parsed object changed.
 *
 * Run: npm run i18n:format
 */
const fs = require('fs');
const { listLocales, loadLocale } = require('./i18n-lib.js');
const { fileFor } = require('./i18n-edit.js');

const INDENT = '    ';
const BACKSLASH = String.fromCharCode(92);

/** Counts brace depth change on a line, ignoring braces inside string literals */
function braceDelta(line) {
    let delta = 0;
    let quote = null;
    let startsWithClose = false;
    let seenCode = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (quote) {
            if (ch === BACKSLASH) i++;
            else if (ch === quote) quote = null;
            continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') {
            quote = ch;
            seenCode = true;
            continue;
        }
        if (ch === '/' && line[i + 1] === '/') break;
        if (ch === '{' || ch === '[') {
            delta++;
            seenCode = true;
        } else if (ch === '}' || ch === ']') {
            if (!seenCode) startsWithClose = true;
            delta--;
            seenCode = true;
        } else if (!/\s/.test(ch)) {
            seenCode = true;
        }
    }
    return { delta, startsWithClose };
}

function format(text) {
    const eol = text.includes('\r\n') ? '\r\n' : '\n';
    const lines = text.split(eol);
    const out = [];
    let depth = 0;
    let inBlockComment = false;

    for (const raw of lines) {
        const trimmed = raw.trim();

        if (trimmed === '') {
            out.push('');
            continue;
        }

        // Leave the file header / block comments exactly where they are
        if (inBlockComment || trimmed.startsWith('/*')) {
            out.push(raw.trimEnd());
            if (trimmed.startsWith('/*')) inBlockComment = !trimmed.includes('*/');
            else if (trimmed.includes('*/')) inBlockComment = false;
            continue;
        }

        const { delta, startsWithClose } = braceDelta(trimmed);
        if (startsWithClose) depth = Math.max(0, depth - 1);
        out.push(INDENT.repeat(depth) + trimmed);
        depth = Math.max(0, depth + (startsWithClose ? delta + 1 : delta));
    }

    return out.join(eol);
}

let changed = 0;
for (const locale of listLocales()) {
    const file = fileFor(locale);
    const before = loadLocale(locale);
    const original = fs.readFileSync(file, 'utf8');
    const formatted = format(original);

    if (formatted === original) continue;

    fs.writeFileSync(file, formatted, 'utf8');
    const after = loadLocale(locale);
    if (JSON.stringify(after) !== JSON.stringify(before)) {
        fs.writeFileSync(file, original, 'utf8');
        console.error(`${locale}: reformatting changed the data - reverted, please fix by hand`);
        process.exit(1);
    }
    changed++;
    console.log(`formatted ${locale}.ts`);
}

console.log(changed === 0 ? 'All locale files already formatted.' : `Reformatted ${changed} file(s).`);
