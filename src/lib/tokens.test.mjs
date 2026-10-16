import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { commonCssProblems, icoProblems, pngProblems, resolveToken, svgProblems } from './design-checks.mjs';

// The checks are tested in phalcon/assets (tests/design-checks.test.mjs). Here: this site's own copy.

test('the committed copy is a tokens file: its backgrounds and syntax colors have a value', () => {
    // Only the shape: the values change in phalcon/assets, and the deploy must accept a new palette.
    const copy = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');

    for (const name of ['--ph-dark-bg', '--ph-light-bg', '--ph-dark-syntax-keyword']) {
        assert.notEqual(resolveToken(copy, name), null, name);
    }
});

test('the committed copy of common.css is one that this site can use', () => {
    // Only the shape: the rules change in phalcon/assets, and the deploy must accept them.
    const common = readFileSync(new URL('../../public/css/common.css', import.meta.url), 'utf8');
    const tokens = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');

    assert.deepEqual(commonCssProblems(common, tokens), []);
});

test('the committed icon copies are icons that this site can use', () => {
    // Only the shape: the icons change in phalcon/assets, and the deploy must accept them. The root of the site serves
    // them, so a failed download must leave a copy there.
    const icon = (file) => readFileSync(new URL(`../../public/${file}`, import.meta.url));

    assert.deepEqual(icoProblems(icon('favicon.ico')), []);
    assert.deepEqual(svgProblems(icon('favicon.svg')), []);
    assert.deepEqual(pngProblems(icon('apple-touch-icon.png'), 180), []);
    assert.deepEqual(pngProblems(icon('android-chrome-192x192.png'), 192), []);
    assert.deepEqual(pngProblems(icon('android-chrome-512x512.png'), 512), []);
});
