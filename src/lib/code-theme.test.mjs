import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { createHighlighter } from 'shiki';

import { CODE_THEME, codeThemeProblems, definedCodeRoles } from './code-theme.mjs';

const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

/** A theme that uses the roles bg, comment and text. $changes replaces top-level keys. */
const theme = (changes = {}) => JSON.stringify({
    colors: { 'editor.background': 'var(--code-bg)', 'editor.foreground': 'var(--code-text)' },
    name: 'phalcon',
    tokenColors: [
        { scope: ['comment'], settings: { foreground: 'var(--code-comment)' } },
        { scope: 'markup.underline', settings: { fontStyle: 'underline' } },
    ],
    type: 'dark',
    ...changes,
});

test('codeThemeProblems accepts a theme whose roles the site maps', () => {
    assert.deepEqual(codeThemeProblems(theme(), ['bg', 'comment', 'text']), []);
});

test('codeThemeProblems rejects a file that is not a JSON object', () => {
    assert.deepEqual(codeThemeProblems('<!DOCTYPE html><html><body>Not found</body></html>', ['bg']), ['the file is not JSON']);
    assert.deepEqual(codeThemeProblems('[]', ['bg']), ['the file is not a JSON object']);
    assert.deepEqual(codeThemeProblems('', ['bg']), ['the file is not JSON']);
});

test('codeThemeProblems rejects a file with no rules', () => {
    assert.deepEqual(codeThemeProblems(theme({ tokenColors: [] }), ['bg', 'comment', 'text']), ['the file has no list of rules']);
});

test('codeThemeProblems names a color that is not a --code- variable, and a role that the site does not map', () => {
    const json = theme({ tokenColors: [
        { scope: 'comment', settings: { foreground: 'red' } },
        { scope: 'keyword', settings: { foreground: 'var(--code-keyword)' } },
    ] });

    assert.deepEqual(codeThemeProblems(json, ['bg', 'text']), ['--code-keyword has no value on this site', 'red is not a --code- variable']);
});

test('codeThemeProblems names every typed color, in a rule and in the keys that Shiki also reads (bg, settings)', () => {
    const json = theme({
        bg: '#ff0000',
        settings: [{ settings: { foreground: 'rgb(255 0 0)' } }],
        tokenColors: [{ scope: 'comment', settings: { foreground: '#8b949e' } }],
    });

    assert.deepEqual(codeThemeProblems(json, ['bg', 'comment', 'text']), [
        '#8b949e is a typed color',
        '#ff0000 is a typed color',
        'bg is not allowed',
        'rgb(255 0 0) is a typed color',
        'settings is not allowed',
    ]);
});

test('codeThemeProblems allows only colors, name, tokenColors and type (Shiki reads fg and settings in their place)', () => {
    const json = theme({ fg: 'var(--code-text)', settings: [{ settings: { foreground: 'var(--code-comment)' } }] });

    assert.deepEqual(codeThemeProblems(json, ['bg', 'comment', 'text']), ['fg is not allowed', 'settings is not allowed']);
});

test('codeThemeProblems takes the --code- roles from the whole file', () => {
    const json = theme({ bg: 'var(--code-unmapped)' });

    assert.deepEqual(codeThemeProblems(json, ['bg', 'comment', 'text']), ['--code-unmapped has no value on this site', 'bg is not allowed']);
});

test('codeThemeProblems needs the two editor colors (Shiki falls back to typed colors)', () => {
    assert.deepEqual(codeThemeProblems(theme({ colors: {} }), ['bg', 'comment', 'text']), [
        'colors.editor.background is missing',
        'colors.editor.foreground is missing',
    ]);
});

test('definedCodeRoles reads the --code- roles that a stylesheet defines, not the ones in a comment', () => {
    const text = '/* --code-ghost: red; */ .astro-code { --code-bg: var(--ph-dark-code-bg); color: var(--code-text); }';

    assert.deepEqual([...definedCodeRoles(text)], ['bg']);
});

test('the committed copy is a code theme that this site can use', () => {
    // Only the shape: the rules change in phalcon/assets, and the deploy must accept them.
    const copy = readFileSync(new URL('../styles/code-theme.json', import.meta.url), 'utf8');

    assert.deepEqual(codeThemeProblems(copy, definedCodeRoles(css)), []);
});

test('global.css maps every --code- variable of the theme to a dark syntax token', () => {
    const block = /\.astro-code\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    const roles = new Set([...JSON.stringify(CODE_THEME).matchAll(/var\(--code-([a-z-]+)\)/g)].map((match) => match[1]));

    for (const role of roles) {
        const token = role === 'bg' ? '--ph-dark-code-bg' : `--ph-dark-syntax-${role}`;

        assert.match(block, new RegExp(`--code-${role}:\\s*var\\(${token}\\);`), `--code-${role}`);
    }
});

test('Shiki colors PHP with the --code- variables only', async () => {
    // Only the shape: the name and the rules of the theme change in phalcon/assets.
    const highlighter = await createHighlighter({ langs: ['php'], themes: [CODE_THEME] });
    const html = highlighter.codeToHtml('<?php\n// note\necho "text";\n', { lang: 'php', theme: CODE_THEME.name });
    const colors = [...html.matchAll(/(?<![\w-])color:([^;"]+)/g)].map((match) => match[1]);

    highlighter.dispose();

    assert.match(html, /background-color:var\(--code-bg\)/);
    assert.ok(colors.length > 1, 'the code has colors');
    assert.deepEqual(colors.filter((color) => !/^var\(--code-[a-z0-9-]+\)$/.test(color)), []);
});
