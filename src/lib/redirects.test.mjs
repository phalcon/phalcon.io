import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { legacyUrls, PAGES } from '../data/routes.mjs';
import { parseRedirects, resolve } from './redirects.mjs';

const rules = parseRedirects(readFileSync(new URL('../../public/_redirects', import.meta.url), 'utf8'));

/* The short links of the old site. Every one must stay (spec, Open Item 2). */
const SHORT_LINKS = [
    'api', 'bitchute', 'blog', 'brighteon', 'builtwith', 'devto', 'devtools', 'discord', 'discussions', 'docs',
    'donate', 'f', 'facebook', 'fb', 'forum', 'fund', 'funding', 'gab', 'github', 'github-docs', 'incubator', 'lbry',
    'license', 'linkedin', 'mewe', 'oldreleases', 'reddit', 'so', 'status', 'store', 'support_us', 't', 'team/andres',
    'team/nikos', 'team/ruud', 'team/serghei', 'telegram', 'tutorial', 'twitter', 'youtube', 'yt',
];

/** Follows redirects from `path`, at most `hops` times. Returns the last path. */
const follow = (path, hops) => {
    let current = path;

    for (let i = 0; i < hops; i++) {
        const match = resolve(rules, current);

        if (!match) {
            break;
        }

        current = match.target;
    }

    return current;
};

test('parseRedirects skips comments and blank lines, and defaults to 302', () => {
    assert.deepEqual(parseRedirects('# note\n\n/a /b 301\n/c /d\n'), [
        { from: '/a', line: 3, status: 301, to: '/b' },
        { from: '/c', line: 4, status: 302, to: '/d' },
    ]);
});

test('resolve matches exact paths, splats and placeholders, first rule first', () => {
    const sample = parseRedirects('/x/about /contribute 301\n/x/* /:splat 301\n/team/:name https://github.com/:name 301\n');

    assert.equal(resolve(sample, '/x/about').target, '/contribute');
    assert.equal(resolve(sample, '/x/team').target, '/team');
    assert.equal(resolve(sample, '/x/').target, '/');
    assert.equal(resolve(sample, '/team/niden').target, 'https://github.com/niden');
    assert.equal(resolve(sample, '/x'), null);
    assert.equal(resolve(sample, '/other'), null);
});

test('resolve keeps colons in a target URL that are not placeholders', () => {
    const sample = parseRedirects('/lbry https://beta.lbry.tv/@PhalconPHP:0 301\n');

    assert.equal(resolve(sample, '/lbry').target, 'https://beta.lbry.tv/@PhalconPHP:0');
});

test('every old URL reaches its page with one 301', () => {
    for (const { from, to } of legacyUrls()) {
        const match = resolve(rules, from);

        assert.ok(match, `${from} has a rule`);
        assert.equal(match.rule.status, 301, `${from} status`);
        assert.equal(match.target, to, `${from} target`);
        assert.equal(resolve(rules, match.target), null, `${from} needs a second hop`);
    }
});

test('no rule hides a page', () => {
    for (const page of [...PAGES, '/404']) {
        assert.equal(resolve(rules, page), null, `${page} is redirected`);
    }
});

test('every short link stays and points to an absolute URL', () => {
    for (const name of SHORT_LINKS) {
        const match = resolve(rules, `/${name}`);

        assert.ok(match, `/${name} has a rule`);
        assert.match(match.target, /^https:\/\//, `/${name} target`);
    }
});

test('/github-docs points to the documentation repository', () => {
    assert.equal(resolve(rules, '/github-docs')?.target, 'https://github.com/phalcon/documentation');
});

test('the old Jekyll sitemap URL reaches the Astro sitemap', () => {
    assert.equal(resolve(rules, '/sitemap.xml')?.target, '/sitemap-index.xml');
});

test('no redirect target has a second URL inside its path', () => {
    for (const rule of rules) {
        assert.doesNotMatch(rule.to.replace(/^https?:\/\//, ''), /https?:\/\//, `line ${rule.line}: ${rule.to}`);
    }
});

test('trailing-slash variants reach a page', () => {
    // Cloudflare Pages serves /p/ as /p when dist/p.html exists, so a final "/p/" counts as "/p".
    for (const from of ['/en-us/team/', '/de-de/', '/el/download/linux/', '/about/', '/en-us/about/']) {
        const last = follow(from, 2).replace(/(.)\/$/, '$1');

        assert.ok(PAGES.includes(last), `${from} ends at ${last}`);
    }
});
