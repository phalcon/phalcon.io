import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { createHighlighter } from 'shiki';

import { CODE_THEME } from './code-theme.mjs';
import { codeThemeProblems, definedCodeRoles } from './design-checks.mjs';

// The checks are tested in phalcon/assets (tests/design-checks.test.mjs). Here: this site's own files.

const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

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
