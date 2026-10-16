/**
 * Checks the built site in dist/. Run it after `npm run build`.
 * Each check prints one line. The exit code is 1 when a check fails.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';

import { distFile, PAGES } from '../src/data/routes.mjs';
import { FLAVORS, SITE_DESCRIPTION, SITE_TITLE } from '../src/data/site.mjs';
import { CONTENT, SITE_LACKS } from './expectations.mjs';
import { allowedBy, attrValues, elements, inlineScripts, parseCsp, textOf } from './lib.mjs';
import { missingTokens, resolveToken, usedTokens } from '../src/lib/design-checks.mjs';
import { parseRedirects, resolve } from '../src/lib/redirects.mjs';
import { logoSections, nameSections } from '../src/lib/sponsors.mjs';

const checks = [];

const report = (label, ok, detail = '') => checks.push({ detail, label, ok });

/** The files under `root`, in all folders. */
const listFiles = (root) =>
    readdirSync(root, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => `${entry.parentPath}/${entry.name}`);

/** The newest modification time of the given files and folders. */
const newest = (paths) =>
    Math.max(
        ...paths.flatMap((path) => (statSync(path).isDirectory() ? listFiles(path) : [path])).map((file) => statSync(file).mtimeMs)
    );

/** A string matches with exact case; a RegExp matches as written. */
const contains = (source, pattern) => (pattern instanceof RegExp ? pattern.test(source) : source.includes(pattern));

/** A string matches with any case; a RegExp matches as written. */
const mentions = (source, pattern) =>
    pattern instanceof RegExp ? pattern.test(source) : source.toLowerCase().includes(pattern.toLowerCase());

/*
 * A failed build can leave an old dist/ in place, and an old dist/ can pass
 * every check. So this check runs first. scripts/ is not a source: a change
 * to the expectations must not make dist/ old.
 */
const sources = ['src', 'public', 'astro.config.mjs', 'package.json'].filter((path) => existsSync(path));

report('dist is current', existsSync('dist') && newest(sources) <= newest(['dist']));

for (const page of [...PAGES, '/404']) {
    report(`page ${page}`, existsSync(distFile(page)));
}

/* Every HTML file of dist/ is a page of PAGES (or the 404 page), so that each check below reads every page. */
{
    const known = [...PAGES, '/404'].map(distFile);
    const extra = existsSync('dist') ? listFiles('dist').filter((file) => file.endsWith('.html') && !known.includes(file)) : [];

    report('every HTML file of dist/ is a page of PAGES or /404', extra.length === 0, extra.join(', '));
}

const built = [...PAGES, '/404'].filter((page) => existsSync(distFile(page)));
const html = (page) => readFileSync(distFile(page), 'utf8');

for (const pattern of SITE_LACKS) {
    const pages = built.filter((page) => mentions(html(page), pattern));

    report(`no page mentions ${pattern}`, pages.length === 0, pages.join(', '));
}

for (const entry of CONTENT) {
    if (!existsSync(distFile(entry.page))) {
        report(`${entry.page} content`, false, 'the page is missing');
        continue;
    }

    const source = html(entry.page);
    const text = textOf(source);
    const hrefs = attrValues(source, 'a', 'href');
    const copied = attrValues(source, 'button', 'data-copy');

    for (const item of entry.has ?? []) {
        report(`${entry.page} shows "${item}"`, text.includes(item));
    }

    for (const item of entry.lacks ?? []) {
        report(`${entry.page} does not show ${item}`, !mentions(text, item));
    }

    for (const item of entry.html ?? []) {
        report(`${entry.page} HTML has ${item}`, contains(source, item));
    }

    for (const item of entry.htmlLacks ?? []) {
        report(`${entry.page} HTML lacks ${item}`, !mentions(source, item));
    }

    for (const item of entry.links ?? []) {
        report(`${entry.page} links to ${item}`, hrefs.includes(item));
    }

    for (const item of entry.copies ?? []) {
        report(`${entry.page} copy button has "${item}"`, copied.some((value) => value.includes(item)));
    }
}

/*
 * Sponsors. The counts come from src/sponsors.json, the committed roster
 * that scripts/update-data.mjs keeps current. An empty roster must pass too.
 */
{
    const roster = JSON.parse(readFileSync('src/sponsors.json', 'utf8')).sponsors;
    const logos = logoSections(roster).reduce((sum, section) => sum + section.entries.length, 0);
    const names = nameSections(roster).reduce((sum, section) => sum + section.entries.length, 0);
    const count = (page) => (existsSync(distFile(page)) ? (html(page).match(/\sdata-sponsor\b/g) ?? []).length : -1);

    report('home page shows each logo sponsor once', count('/') === logos, `${count('/')} of ${logos}`);
    report('sponsors page shows the full roster', count('/sponsors') === logos + names, `${count('/sponsors')} of ${logos + names}`);
}

/* No page has an inline script that runs: the CSP in _headers allows none. */
{
    const pages = built.filter((page) => inlineScripts(html(page)).length > 0);

    report('no page has an inline script', pages.length === 0, pages.join(', '));
}

/* Contributors: one GitHub avatar at 80 px per entry on the home and team pages, and no local images. */
{
    const people = JSON.parse(readFileSync('src/data/contributors.json', 'utf8'));
    const avatars = (page) =>
        existsSync(distFile(page)) ? elements(html(page), 'img').filter((img) => 'data-contributor' in img) : [];
    const sized = (img) =>
        (img.src ?? '').startsWith('https://avatars.githubusercontent.com/') && '80' === new URL(img.src).searchParams.get('s');

    report('home page shows every contributor', avatars('/').length === people.length, `${avatars('/').length} of ${people.length}`);
    report('team page shows every contributor', avatars('/team').length === people.length, `${avatars('/team').length} of ${people.length}`);
    report('every contributor avatar is a GitHub avatar at 80 px', avatars('/').every(sized));
    report('no local contributor images', !existsSync('dist/images/contributors'));
}

/* Files that Cloudflare Pages and old installs need. */
for (const file of ['_redirects', '_headers', 'robots.txt', 'humans.txt', 'debug/3.0.x/pretty.js', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png']) {
    report(`dist/${file} exists`, existsSync(`dist/${file}`));
}

/* The Astro locale stubs are gone: _redirects does that job with real 301s. */
report('no locale stub pages', !existsSync('dist/en-us.html') && !existsSync('dist/en-us'));

/* Every script, image, frame and icon URL on a page is allowed by the CSP. */
if (existsSync('dist/_headers')) {
    const policy = parseCsp(readFileSync('dist/_headers', 'utf8'));
    const blocked = [];

    for (const page of built) {
        const source = html(page);
        const uses = [
            ...attrValues(source, 'script', 'src').map((url) => ['script-src', url]),
            ...attrValues(source, 'img', 'src').map((url) => ['img-src', url]),
            ...attrValues(source, 'iframe', 'src').map((url) => ['frame-src', url]),
            ...elements(source, 'link')
                .filter((link) => /icon/.test(link.rel ?? ''))
                .map((link) => ['img-src', link.href]),
            ...elements(source, 'link')
                .filter((link) => link.rel === 'stylesheet')
                .map((link) => ['style-src', link.href]),
            ...elements(source, 'link')
                .filter((link) => link.rel === 'manifest')
                .map((link) => ['manifest-src', link.href]),
        ];

        for (const [directive, url] of uses) {
            if (!allowedBy(policy, directive, url)) {
                blocked.push(`${page} ${directive} ${url}`);
            }
        }
    }

    report('the CSP allows every resource', blocked.length === 0, blocked.join(' | '));
}

/* Every internal link goes to a page, a file in dist/, or a redirect rule. */
{
    const rules = existsSync('dist/_redirects') ? parseRedirects(readFileSync('dist/_redirects', 'utf8')) : [];
    const broken = new Set();

    for (const page of built) {
        for (const href of attrValues(html(page), 'a', 'href')) {
            if (!href.startsWith('/') || href.startsWith('//')) {
                continue;
            }

            const path = href.split(/[?#]/)[0] || '/';
            const ok = PAGES.includes(path) || (path !== '/' && existsSync(`dist${path}`)) || resolve(rules, path) !== null;

            if (!ok) {
                broken.add(`${page} → ${href}`);
            }
        }
    }

    report('every internal link works', broken.size === 0, [...broken].join(' | '));
}

/* Review Focus 2: with JavaScript off, the footer is the menu. It must link to every page. */
{
    // The platform pages are one click from /download, which the footer has.
    const viaDownload = ['/', '/download/composer', '/download/linux', '/download/windows'];
    const footer = (html('/').match(/<footer\b[\s\S]*?<\/footer>/) ?? [''])[0];
    const links = attrValues(footer, 'a', 'href');
    const missing = PAGES.filter((page) => !viaDownload.includes(page) && !links.includes(page));

    report('footer links to every page', missing.length === 0, missing.join(', '));
}

/* Review Focus 3: every version number on the site is the current one. */
{
    const current = [FLAVORS.v5.version, FLAVORS.v6.version];
    const stale = new Set();

    for (const page of built) {
        for (const [version] of textOf(html(page)).matchAll(/\b[56]\.\d+\.\d+(?:RC\d+|beta\d+|alpha\d+)?\b/g)) {
            if (!current.includes(version)) {
                stale.add(`${page}: ${version}`);
            }
        }
    }

    report('every version number on the site is current', stale.size === 0, [...stale].join(', '));
}

/* The sitemap lists every page (the Jekyll site had /sitemap.xml; _redirects sends it here). */
{
    const sitemap = existsSync('dist/sitemap-0.xml') ? readFileSync('dist/sitemap-0.xml', 'utf8') : '';
    const missing = PAGES.filter((page) => !sitemap.includes(`<loc>https://phalcon.io${page}</loc>`));

    report('dist/sitemap-index.xml exists', existsSync('dist/sitemap-index.xml'));
    report('the sitemap lists every page', sitemap !== '' && missing.length === 0, missing.join(', '));
    report('the sitemap has no 404 page', !sitemap.includes('/404'));
}

/* Design tokens: the built CSS defines every token that it uses, and the browser bar takes the dark background. */
{
    const css = existsSync('dist/_astro')
        ? listFiles('dist/_astro')
              .filter((file) => file.endsWith('.css'))
              .map((file) => readFileSync(file, 'utf8'))
              .join('\n')
        : '';
    const missing = missingTokens(css, usedTokens(css));
    const meta = existsSync(distFile('/')) ? elements(html('/'), 'meta').find((element) => element.name === 'theme-color') : null;
    const expected = resolveToken(readFileSync('src/styles/tokens.css', 'utf8'), '--ph-dark-bg');

    report('the built CSS defines every token that it uses', css !== '' && missing.length === 0, missing.join(', '));
    report('the theme color is the dark background token', expected !== null && meta?.content === expected, meta?.content ?? 'none');
}

/*
 * The icons, the same set as on the other Phalcon sites. Every page links the
 * copies in public/ of phalcon/favicons/ (phalcon/assets) and the manifest,
 * has the browser bar color of the tokens, and has no tag of the old set. The
 * manifest is JSON, with the name of the site, a short name of the site part
 * only (the icon shows the brand), the description of the site, the color of
 * the browser bar, and the two icons of a home screen. A home screen icon opens
 * the home page in the browser.
 */
{
    const color = resolveToken(readFileSync('src/styles/tokens.css', 'utf8'), '--ph-dark-bg');
    const tags = [
        '<link rel="icon" href="/favicon.ico" sizes="32x32">',
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
        '<link rel="manifest" href="/site.webmanifest">',
        `<meta name="theme-color" content="${color}">`,
    ].join(' ');
    const iconTags = (source) =>
        [...source.matchAll(/<link[^>]*rel="(?:apple-touch-icon|icon|manifest|mask-icon|shortcut icon)"[^>]*>|<meta[^>]*name="theme-color"[^>]*>/g)]
            .map((match) => match[0])
            .join(' ');
    const wrong = built.filter((page) => iconTags(html(page)) !== tags);
    // A manifest that is missing or is not JSON fails one check here, and the checks of its fields; the script goes on.
    const parsed = (() => {
        try {
            return JSON.parse(readFileSync('dist/site.webmanifest', 'utf8'));
        } catch {
            return null;
        }
    })();
    const manifest = parsed ?? {};
    const icons = manifest.icons ?? [];

    report('every page has exactly the icon tags', wrong.length === 0, wrong.join(', '));
    report('dist/site.webmanifest is a JSON file', parsed !== null);
    report('no page has a tag of the Windows tiles', built.every((page) => !/name="msapplication-/.test(html(page))));
    report(
        'the manifest has the name and the short name of the site',
        manifest.name === SITE_TITLE && manifest.short_name === 'Phalcon',
        `${manifest.name} / ${manifest.short_name}`
    );
    report('the manifest has the description of the site', manifest.description === SITE_DESCRIPTION, manifest.description ?? 'none');
    report(
        'a home screen icon opens the home page in the browser',
        manifest.display === 'browser' && manifest.start_url === '/',
        `${manifest.display} ${manifest.start_url}`
    );
    report(
        'the manifest colors are the dark background token',
        color !== null && manifest.background_color === color && manifest.theme_color === color,
        `${manifest.background_color} ${manifest.theme_color}`
    );
    report(
        'the manifest has the two icons of a home screen, and they are in dist',
        icons.map((icon) => `${icon.src} ${icon.sizes} ${icon.type}`).join(', ') ===
            '/android-chrome-192x192.png 192x192 image/png, /android-chrome-512x512.png 512x512 image/png' &&
            icons.every((icon) => existsSync(`dist${icon.src}`)),
        icons.map((icon) => `${icon.src} ${icon.sizes} ${icon.type}`).join(', ')
    );
}

/* Task checks go above this line. */

for (const { detail, label, ok } of checks) {
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? `: ${detail}` : ''}`);
}

const failed = checks.filter((check) => !check.ok).length;

console.log(`\n${checks.length - failed} of ${checks.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
