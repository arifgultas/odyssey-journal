/**
 * Surgical editor for the locale files.
 *
 * The translation files are hand-maintained TS object literals with section comments,
 * so they are patched in place rather than regenerated - that keeps diffs reviewable.
 * The files use CRLF, so lines are compared trimmed and the original EOL is preserved.
 */
const fs = require('fs');
const path = require('path');
const { TRANSLATIONS_DIR } = require('./i18n-lib.js');

const BACKSLASH = String.fromCharCode(92);

function fileFor(locale) {
    return path.join(TRANSLATIONS_DIR, `${locale}.ts`);
}

function read(locale) {
    const raw = fs.readFileSync(fileFor(locale), 'utf8');
    const eol = raw.includes('\r\n') ? '\r\n' : '\n';
    return { lines: raw.split(eol), eol };
}

function write(locale, lines, eol) {
    fs.writeFileSync(fileFor(locale), lines.join(eol), 'utf8');
}

function quote(value) {
    const escaped = String(value)
        .split(BACKSLASH)
        .join(BACKSLASH + BACKSLASH)
        .split("'")
        .join(BACKSLASH + "'");
    return "'" + escaped + "'";
}

/** Finds [startLine, endLine] of a `name: {` block, endLine being its closing brace */
function findBlock(lines, name, from = 0, to = lines.length) {
    const target = [`${name}: {`, `'${name}': {`];
    let start = -1;
    for (let i = from; i < to; i++) {
        if (target.includes(lines[i].trim())) {
            start = i;
            break;
        }
    }
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < lines.length; i++) {
        for (const ch of lines[i]) {
            if (ch === '{') depth++;
            else if (ch === '}') depth--;
        }
        if (depth === 0) return [start, i];
    }
    return null;
}

/** Indentation used by the direct children of a block */
function childIndent(lines, start, end) {
    for (let i = start + 1; i < end; i++) {
        const m = lines[i].match(/^(\s+)\S/);
        if (m) return m[1];
    }
    return (lines[start].match(/^(\s*)/)[1] || '') + '    ';
}

/** Index of the line defining `leaf` as a direct child, or -1 */
function findLeaf(lines, start, end, leaf) {
    for (let i = start + 1; i < end; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.startsWith(`${leaf}:`) || trimmed.startsWith(`'${leaf}':`)) return i;
    }
    return -1;
}

/**
 * Resolves every segment of a dotted path except the last, descending through nested
 * blocks, and returns the enclosing block plus the remaining leaf name. Keys such as
 * `report.reasons.spam.label` and `moderation.categories.hate/threatening` are 3-4
 * levels deep, so a single split on the first dot is not enough.
 */
function resolveBlock(lines, dottedKey) {
    const segments = dottedKey.split('.');
    const leaf = segments.pop();
    let range = [-1, lines.length];

    for (const segment of segments) {
        const block = findBlock(lines, segment, range[0] + 1, range[1]);
        if (block) {
            range = block;
            continue;
        }
        // The deepest level is often written inline, e.g. `spam: { label: '...', desc: '...' },`
        const inline = findInline(lines, segment, range[0] + 1, range[1]);
        if (inline === -1) return null;
        return { inline, leaf };
    }
    return { range, leaf };
}

/** Index of a single-line object such as `spam: { label: '...', desc: '...' },`, or -1 */
function findInline(lines, name, from, to) {
    for (let i = from; i < to; i++) {
        const trimmed = lines[i].trim();
        if ((trimmed.startsWith(name + ':') || trimmed.startsWith("'" + name + "':")) && trimmed.includes('{')) {
            return i;
        }
    }
    return -1;
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** Adds `section.key: value`, or replaces it when it already exists */
function setKey(locale, dottedKey, value) {
    if (value === undefined) throw new Error(`${locale}: no value given for '${dottedKey}'`);
    const { lines, eol } = read(locale);

    const resolved = resolveBlock(lines, dottedKey);
    if (!resolved) throw new Error(`${locale}: no block for '${dottedKey}'`);
    const { leaf } = resolved;

    if (resolved.inline !== undefined) {
        const replaced = replaceInlineValue(lines[resolved.inline], leaf, quote(value));
        if (replaced === null) throw new Error(`${locale}: '${dottedKey}' not found inline`);
        lines[resolved.inline] = replaced;
        write(locale, lines, eol);
        return;
    }

    const [start, end] = resolved.range;
    const indent = childIndent(lines, start, end);
    const key = IDENTIFIER.test(leaf) ? leaf : quote(leaf);
    const line = `${indent}${key}: ${quote(value)},`;

    const existing = findLeaf(lines, start, end, leaf);
    if (existing !== -1) lines[existing] = line;
    else lines.splice(end, 0, line);

    write(locale, lines, eol);
}

/** Removes `section.key` entirely */
function removeKey(locale, dottedKey) {
    const { lines, eol } = read(locale);
    const resolved = resolveBlock(lines, dottedKey);
    if (!resolved) return false;
    const idx = findLeaf(lines, resolved.range[0], resolved.range[1], resolved.leaf);
    if (idx === -1) return false;
    lines.splice(idx, 1);
    write(locale, lines, eol);
    return true;
}

/**
 * Replaces the quoted value of `leaf` inside a single-line object literal.
 * Done by scanning rather than with a regular expression, so apostrophes and
 * escapes inside the existing value cannot break the match.
 */
function replaceInlineValue(line, leaf, quotedValue) {
    const marker = [leaf + ':', "'" + leaf + "':"].find((m) => line.includes(m));
    if (!marker) return null;

    const open = line.indexOf("'", line.indexOf(marker) + marker.length);
    if (open === -1) return null;

    let i = open + 1;
    while (i < line.length) {
        if (line[i] === BACKSLASH) i += 2;
        else if (line[i] === "'") break;
        else i++;
    }
    if (i >= line.length) return null;

    return line.slice(0, open) + quotedValue + line.slice(i + 1);
}

/** Removes a whole `name: { ... }` block, including its trailing comment line if any */
function removeBlock(locale, name) {
    const { lines, eol } = read(locale);
    const block = findBlock(lines, name);
    if (!block) return false;
    let [start, end] = block;
    // Take the section comment directly above it along with the block
    if (start > 0 && lines[start - 1].trim().startsWith('//')) start -= 1;
    lines.splice(start, end - start + 1);
    write(locale, lines, eol);
    return true;
}

/** Creates an empty top-level `name: {}` section at the end of the object if absent */
function ensureSection(locale, name, comment) {
    const { lines, eol } = read(locale);
    if (findBlock(lines, name)) return false;

    // The object literal's own closing brace is the last `};` in the file
    let close = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() === '};') {
            close = i;
            break;
        }
    }
    if (close === -1) throw new Error(`${locale}: could not find the end of the translation object`);

    const block = ['', `    // ${comment}`, `    ${name}: {`, '    },'];
    lines.splice(close, 0, ...block);
    write(locale, lines, eol);
    return true;
}

module.exports = { setKey, removeKey, removeBlock, ensureSection, fileFor };
