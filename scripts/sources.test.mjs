import { strict as assert } from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { FLAVORS } from '../src/data/site.mjs';

const root = new URL('../src/', import.meta.url);
const astroFiles = readdirSync(root, { recursive: true }).filter((file) => file.endsWith('.astro'));

test('no page or component types the PHP range of a flavor', () => {
    // The ranges come from FLAVORS in src/data/site.mjs, so a release changes one file.
    for (const file of astroFiles) {
        const text = readFileSync(new URL(file, root), 'utf8');

        for (const flavor of [FLAVORS.v5, FLAVORS.v6]) {
            assert.ok(!text.includes(flavor.php), `${file} types "${flavor.php}"`);
        }
    }
});

test('site.mjs takes the versions, stars and status from project.json', () => {
    // A typed value here would bypass project.json, which the deploy workflow keeps current.
    const text = readFileSync(new URL('../src/data/site.mjs', import.meta.url), 'utf8');

    assert.doesNotMatch(text, /\b(?:version|stars|status):\s*['"`]/);
});

test('expectations.mjs types no current version', () => {
    // The daily run moves the versions forward. A typed version would fail the
    // build checks on the first release. Only old text that must stay absent may be typed.
    const allowed = new Set(['phalcon-5.0.0', 'v5.0.0']);
    const text = readFileSync(new URL('./expectations.mjs', import.meta.url), 'utf8');
    const typed = [...text.matchAll(/['"`]([^'"`]*\b[56]\.\d+\.\d+[^'"`]*)['"`]/g)].map((match) => match[1]);

    assert.deepEqual(typed.filter((value) => !allowed.has(value)), []);
});
