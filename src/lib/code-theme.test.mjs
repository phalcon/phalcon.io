import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { createHighlighter } from 'shiki';

import { CODE_THEME } from './code-theme.mjs';

/** The color of the first rule that names the scope. */
const roleOf = (scope) => CODE_THEME.tokenColors.find((rule) => [].concat(rule.scope).includes(scope))?.settings.foreground;

test("the code theme has the 49 rules of GitHub's dark theme", () => {
    assert.equal(CODE_THEME.tokenColors.length, 49);
});

test('the code theme types no color', () => {
    // The colors come from the --code- variables, which a site maps to the syntax tokens.
    assert.doesNotMatch(JSON.stringify(CODE_THEME), /#[0-9a-f]{3,8}\b|rgba?\(/i);
});

test('every color of the code theme is a --code- variable', () => {
    const colors = [
        ...Object.values(CODE_THEME.colors),
        ...CODE_THEME.tokenColors.map((rule) => rule.settings.foreground).filter(Boolean),
    ];

    assert.ok(colors.every((color) => /^var\(--code-[a-z-]+\)$/.test(color)), colors.join(', '));
});

test("the code theme gives GitHub's roles to the main scopes", () => {
    assert.equal(roleOf('comment'), 'var(--code-comment)');
    assert.equal(roleOf('keyword'), 'var(--code-keyword)');
    assert.equal(roleOf('string'), 'var(--code-string)');
    assert.equal(roleOf('constant'), 'var(--code-constant)');
    assert.equal(roleOf('entity.name.function'), 'var(--code-function)');
    assert.equal(roleOf('variable'), 'var(--code-parameter)');
    assert.equal(roleOf('entity.name.tag'), 'var(--code-string-expression)');
    assert.equal(roleOf('markup.inserted'), 'var(--code-inserted)');
    assert.equal(roleOf('markup.deleted'), 'var(--code-deleted)');
    assert.equal(roleOf('markup.changed'), 'var(--code-changed)');
});

test('global.css maps every --code- variable of the theme to a dark syntax token', () => {
    const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
    const block = /\.astro-code\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    const roles = new Set([...JSON.stringify(CODE_THEME).matchAll(/var\(--code-([a-z-]+)\)/g)].map((match) => match[1]));

    for (const role of roles) {
        const token = role === 'bg' ? '--ph-dark-code-bg' : `--ph-dark-syntax-${role}`;

        assert.match(block, new RegExp(`--code-${role}:\\s*var\\(${token}\\);`), `--code-${role}`);
    }
});

test('Shiki colors PHP with the --code- variables', async () => {
    const highlighter = await createHighlighter({ langs: ['php'], themes: [CODE_THEME] });
    const html = highlighter.codeToHtml('<?php\n// note\necho "text";\n', { lang: 'php', theme: 'phalcon' });

    highlighter.dispose();

    assert.match(html, /background-color:var\(--code-bg\)/);
    assert.match(html, /color:var\(--code-comment\)">\/\/ note</);
    assert.match(html, /color:var\(--code-string\)"> "text"</);
});
