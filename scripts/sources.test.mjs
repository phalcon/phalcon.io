import { strict as assert } from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { FLAVORS } from '../src/data/site.mjs';
import { missingTokens } from '../src/lib/tokens.mjs';
import { sourceFiles, usedBySite } from './token-sources.mjs';

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

test('the source scan covers pages, components, layouts and styles, not tests or the tokens file', () => {
    // A token that only a component prop uses must count as used.
    const files = sourceFiles();

    for (const file of ['components/DiamondBullet.astro', 'layouts/BaseLayout.astro', 'pages/support.astro', 'styles/global.css']) {
        assert.ok(files.includes(file), file);
    }

    assert.ok(!files.includes('styles/tokens.css'));
    assert.ok(!files.includes('lib/tokens.test.mjs'));
});

test('no source types a color', () => {
    // Colors come from src/styles/tokens.css (phalcon/assets), so a palette change is made once.
    const typed = sourceFiles().flatMap((file) =>
        readFileSync(new URL(file, root), 'utf8')
            .split('\n')
            .flatMap((line, index) => [...line.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g)].map((match) => `${file}:${index + 1} ${match[0]}`))
    );

    assert.deepEqual(typed, []);
});

test('the Tailwind white takes its value from the tokens', () => {
    // Tailwind has its own white (#fff). bg-white and the other white classes must follow --ph-white.
    const css = readFileSync(new URL('styles/global.css', root), 'utf8');

    assert.match(css, /--color-white:\s*var\(--ph-white\);/);
});

test('the tokens file defines every token that the site uses', () => {
    const tokens = readFileSync(new URL('styles/tokens.css', root), 'utf8');

    assert.deepEqual(missingTokens(tokens, usedBySite()), []);
});

test('the deploy workflow refreshes the tokens and restores them before the data push', () => {
    // The scheduled run rebases before it pushes, so the downloaded files must not stay changed.
    const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');

    assert.match(workflow, /run: node scripts\/update-tokens\.mjs/);
    assert.match(workflow, /git checkout -- src\/fanart\.html src\/styles\/tokens\.css src\/styles\/code-theme\.json/);
});

test('the deploy workflow and the scripts read phalcon/assets from assets.phalcon.io', () => {
    // assets.phalcon.io is the CDN of the Phalcon sites. Cloudflare answers a
    // .html URL with a 308 to the URL without .html, so curl must follow it (-L).
    const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    const workflow = read('.github/workflows/deploy.yml');
    const tokens = read('scripts/update-tokens.mjs');
    const data = read('scripts/update-data.mjs');

    assert.doesNotMatch(workflow, /raw\.githubusercontent\.com/, 'deploy.yml');
    assert.doesNotMatch(tokens, /raw\.githubusercontent\.com/, 'update-tokens.mjs');
    assert.doesNotMatch(data, /raw\.githubusercontent\.com/, 'update-data.mjs');
    assert.match(tokens, /const SOURCE = 'https:\/\/assets\.phalcon\.io\/phalcon\/css';/);
    assert.match(data, /const FEEDS = 'https:\/\/assets\.phalcon\.io\/phalcon';/);
    assert.match(workflow, /curl -fsSL -o src\/fanart\.html \\\n\s+https:\/\/assets\.phalcon\.io\/phalcon\/fanart-fragment\.html/);
});
