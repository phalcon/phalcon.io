import { strict as assert } from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { FLAVORS, FOOTER_COLUMNS } from '../src/data/site.mjs';
import { missingTokens } from '../src/lib/design-checks.mjs';
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

    assert.ok(files.includes('../public/css/common.css'), 'the shared header and footer');
    assert.ok(!files.includes('styles/tokens.css'));
    assert.ok(!files.includes('lib/tokens.test.mjs'));
});

test('no source types a color', () => {
    // Colors come from src/styles/tokens.css (phalcon/assets), so a palette change is made once. The copy of
    // common.css is not this site's source: phalcon/assets checks its colors, and its comments can name colors.
    const typed = sourceFiles().filter((file) => !file.startsWith('../public/')).flatMap((file) =>
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
    // The tests must check the files that the build uses.
    assert.ok(
        workflow.indexOf('run: node scripts/update-tokens.mjs') < workflow.indexOf('run: npm test'),
        'the design files must come before the tests',
    );
    assert.match(
        workflow,
        /git checkout -- src\/fanart\.html src\/styles\/tokens\.css src\/styles\/code-theme\.json public\/css\/common\.css src\/lib\/design-checks\.mjs src\/lib\/design-refresh\.mjs src\/lib\/stars\.mjs/,
    );
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

test('the deploy workflow gets the design tools first, and keeps the committed copy when a file is not valid', () => {
    // The tools come from assets.phalcon.io. The design files and the tests must use the tools that the build uses.
    const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
    const step = workflow.indexOf('https://assets.phalcon.io/phalcon/tools/$file');

    assert.ok(step > 0, 'the step is missing');
    assert.ok(step < workflow.indexOf('run: node scripts/update-tokens.mjs'), 'the step must come before the design files');
    assert.match(workflow, /for file in design-checks\.mjs design-refresh\.mjs stars\.mjs; do/);
    assert.match(workflow, /new="src\/lib\/\$\{file%\.mjs\}\.new\.mjs"/);
    assert.match(workflow, /curl -fsSL --max-time 30 -o "\$new" "https:\/\/assets\.phalcon\.io\/phalcon\/tools\/\$file" && node --check "\$new"/);
});

test('the base layout links common.css, the shared header and footer, outside the Tailwind build', () => {
    // The build would round its calc() line heights; a linked file reaches the browser as it is, in no layer.
    const layout = readFileSync(new URL('layouts/BaseLayout.astro', root), 'utf8');
    const css = readFileSync(new URL('styles/global.css', root), 'utf8');

    assert.match(layout, /<link rel="stylesheet" href="\/css\/common\.css" \/>/);
    assert.doesNotMatch(css, /@import "\.\/common\.css"/);
});

test('the refresh script copies common.css and checks it against the tokens copy', () => {
    const script = readFileSync(new URL('../scripts/update-tokens.mjs', import.meta.url), 'utf8');

    assert.match(script, /copy: 'public\/css\/common\.css',\n\s+name: 'common\.css',/);
    assert.match(script, /problems: \(text\) => commonCssProblems\(text, readFileSync\('src\/styles\/tokens\.css', 'utf8'\)\),/);
    // The tokens come first: the check of common.css must read the new tokens copy.
    assert.ok(
        script.indexOf("copy: 'src/styles/tokens.css'") < script.indexOf("copy: 'public/css/common.css'"),
        'the tokens must come before common.css',
    );
});

test('common.css has a rule for every class that the nav and the footer use', () => {
    // A class that phalcon/assets renames would leave an element with no style. The tests run after the refresh,
    // so the deploy stops before it publishes.
    const css = readFileSync(new URL('../public/css/common.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const used = ['components/Nav.astro', 'components/Footer.astro']
        .flatMap((file) => [...readFileSync(new URL(file, root), 'utf8').matchAll(/class="([^"]*)"/g)])
        .flatMap((match) => match[1].split(/\s+/))
        .filter((name) => name.startsWith('ph-'));
    const missing = [...new Set(used)].filter((name) => !new RegExp(`\\.${name}(?![\\w-])`).test(css));

    assert.ok(used.length > 30, 'the nav and the footer use the shared classes');
    assert.deepEqual(missing, []);
});

test('the footer links to the license site, last in the Framework column', () => {
    // The same link as phalcon/footer.json in phalcon/assets, which the other sites read.
    const framework = FOOTER_COLUMNS.find((column) => column.title === 'Framework');

    assert.deepEqual(framework.links.at(-1), { href: 'https://license.phalcon.io', label: 'License' });
});

test('the deploy workflow keeps the committed design tools when a new file lacks one of their exports', () => {
    // The site imports the functions by name: a new file with an export less would stop the refresh.
    const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');

    assert.match(workflow, /node --check "\$new" \\\n\s+&& node --input-type=module -e "\$EXPORTS" "\$new" "src\/lib\/\$file"; then/);
    assert.match(workflow, /Object\.keys\(last\)\.every\(\(name\) => name in next\)/);
});

test('the deploy workflow runs one deploy at a time on each branch', () => {
    // A push run and a scheduled run must not publish at the same time.
    // A group keeps only one waiting run, so a pull request run must not cancel a waiting master run.
    const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');

    assert.match(workflow, /\nconcurrency:\n {2}group: deploy-\$\{\{ github\.ref \}\}\n {2}cancel-in-progress: false\n/);
});

test('only master publishes', () => {
    // The trial of the redesign is over: new-design is merged to master.
    const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');

    assert.doesNotMatch(workflow, /new-design/);
});
