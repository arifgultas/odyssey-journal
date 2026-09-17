#!/usr/bin/env node
/**
 * Rule 6: the language context must survive the React Compiler.
 *
 * This project builds with `experiments.reactCompiler` (app.config.ts), so babel-preset-expo
 * runs babel-plugin-react-compiler over app code. The compiler re-derives hook dependencies
 * from the function body and ignores the array you wrote. A `t` whose body reads nothing but
 * module state therefore gets hoisted to module scope with one identity for the life of the
 * app - and every compiled component caches its strings as
 *
 *     if ($[n] !== t) { t4 = t(KEY); ... } else { t4 = $[n + 1]; }
 *
 * so the text freezes in whatever language was active when the component first mounted. That
 * shipped once: screens kept showing Italian after the reader had switched to English.
 *
 * The bug lives entirely in the compiled output. No lint rule and no Jest test can see it,
 * because Jest does not run the compiler. So this check compiles the file the way Metro does
 * and asserts the invariant directly.
 *
 * Run: npm run i18n:check
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const ROOT = path.join(__dirname, '..');
const REL = 'context/language-context.tsx';
const TARGET = path.join(ROOT, REL);

/** The caller flags Expo's Metro transformer sets when experiments.reactCompiler is on. */
const METRO_CALLER = {
    name: 'metro',
    bundler: 'metro',
    platform: 'ios',
    engine: 'hermes',
    isDev: true,
    isServer: false,
    isReactServer: false,
    supportsReactCompiler: true,
    routerRoot: 'app',
};

function compile(file) {
    return babel.transformSync(fs.readFileSync(file, 'utf8'), {
        filename: file,
        presets: [['babel-preset-expo', {}]],
        babelrc: false,
        configFile: false,
        caller: METRO_CALLER,
    }).code;
}

/**
 * Checks the compiled language context.
 *
 * @returns {string[]} problems, empty when the invariant holds
 */
function checkCompiledTranslate() {
    let code;
    try {
        code = compile(TARGET);
    } catch (error) {
        return [`[compiler] could not compile ${REL}: ${error.message}`];
    }

    // The compiler leaves the hook call in place when it gives up on a function. That is safe
    // - an unmemoised t is re-created every render, so it is always fresh - but it means the
    // memoisation this file is written around is gone, and nothing here can be verified. It
    // is also easy to cause by accident: a single `try` statement in the component body makes
    // the compiler bail out of the whole file.
    if (/var\s+translate\s*=\s*\(0,\s*_react\.useCallback\)/.test(code)) {
        return [
            `[compiler] the React Compiler gave up on ${REL}, leaving useCallback in place.\n` +
                '    Not a correctness bug on its own, but the memoisation the file is built\n' +
                '    around is gone and this check can no longer verify anything. The usual\n' +
                '    cause is a `try` statement in the component body - move it to a module-level\n' +
                '    helper. If the compiler was turned off in app.config.ts on purpose, this\n' +
                '    rule can go with it.',
        ];
    }

    const problems = [];

    // The failure that actually shipped: the compiler found no dependency and lifted the
    // function out of the component, giving it one identity for the life of the app.
    if (/var\s+translate\s*=\s*_temp\d*\s*;/.test(code)) {
        problems.push(
            `[compiler] \`translate\` was hoisted to module scope in ${REL}, so \`t\` keeps one\n` +
                '    identity for the whole life of the app and every compiled component freezes\n' +
                '    its strings in the language that was active when it first mounted.\n' +
                '    Fix: read `language` inside the body of `translate`, not just in the\n' +
                '    dependency array - the compiler ignores the array.'
        );
    }

    // The same invariant stated positively, so a different way of losing the dependency is
    // caught too. The window is generous on purpose: the exact shape of the emitted block is
    // the compiler's business, the dependency is ours.
    const at = code.indexOf('var translate');
    const window = at === -1 ? '' : code.slice(Math.max(0, at - 400), at);
    if (!/\$\[\d+\]\s*!==\s*language/.test(window) || !/locale:\s*language/.test(window)) {
        problems.push(
            `[compiler] the memo block that produces \`translate\` in ${REL} is not keyed on\n` +
                '    `language`. `t` has to be re-created whenever the language changes, or the\n' +
                '    strings cached in every compiled component are never recomputed.\n' +
                '    Fix: read `language` inside the body and hand it to i18n as the locale.'
        );
    }

    return problems;
}

module.exports = { checkCompiledTranslate };

if (require.main === module) {
    const problems = checkCompiledTranslate();
    if (problems.length) {
        console.error('i18n compiler check FAILED\n');
        for (const p of problems) console.error('  - ' + p + '\n');
        process.exit(1);
    }
    console.log('i18n compiler check passed: t is re-created per language under the React Compiler.');
}
