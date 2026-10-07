import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { allowedBy, attrValues, elements, inlineScripts, parseCsp, textOf } from './lib.mjs';

test('textOf drops tags, scripts and styles, and decodes entities', () => {
    const html = '<p>Fish &amp; <b>chips</b></p><script>var x = 1;</script><style>p{}</style><p>&lt;b&gt; &#39;q&#39;</p>';

    assert.equal(textOf(html), "Fish & chips <b> 'q'");
});

test('textOf decodes one level of entities only', () => {
    assert.equal(textOf('<p>&amp;lt;</p>'), '&lt;');
});

test('elements reads quoted, unquoted and boolean attributes', () => {
    assert.deepEqual(elements('<a href="/x" data-sponsor target=_blank>', 'a'), [
        { 'data-sponsor': '', href: '/x', target: '_blank' },
    ]);
});

test('elements keeps a quoted ">" inside an attribute value', () => {
    assert.deepEqual(elements('<button data-copy="$a->b()">copy</button>', 'button'), [{ 'data-copy': '$a->b()' }]);
});

test('attrValues decodes entities and skips elements without the attribute', () => {
    assert.deepEqual(attrValues('<a href="/a?x=1&amp;y=2">a</a><a name="n">b</a>', 'a', 'href'), ['/a?x=1&y=2']);
});

test('attrValues decodes numeric entities, as Astro writes a quote as &#34;', () => {
    assert.deepEqual(attrValues('<button data-copy="export X=&#34;a&#34; &#x26; y">c</button>', 'button', 'data-copy'), [
        'export X="a" & y',
    ]);
});

test('attrValues does not match a longer tag name', () => {
    assert.deepEqual(attrValues('<abbr href="/no"></abbr><a href="/yes"></a>', 'a', 'href'), ['/yes']);
});

test('inlineScripts returns scripts without src, and skips JSON-LD', () => {
    const html =
        '<script src="/js/a.js"></script>' +
        '<script type="application/ld+json">{}</script>' +
        '<script>run()</script>' +
        '<script type="module">go()</script>';

    assert.deepEqual(inlineScripts(html), ['run()', 'go()']);
});

test('parseCsp splits directives and sources', () => {
    const headers =
        "/*\n  X-Frame-Options: DENY\n  Content-Security-Policy: default-src 'self'; img-src 'self' data: https://*.example.com\n";

    assert.deepEqual(parseCsp(headers), {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'https://*.example.com'],
    });
});

test('allowedBy handles self, data, exact hosts and wildcards', () => {
    const policy = {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'https://assets.phalcon.io', 'https://*.example.com'],
    };

    assert.equal(allowedBy(policy, 'img-src', '/images/a.png'), true);
    assert.equal(allowedBy(policy, 'img-src', 'data:image/png;base64,AA'), true);
    assert.equal(allowedBy(policy, 'img-src', 'https://assets.phalcon.io/x.svg'), true);
    assert.equal(allowedBy(policy, 'img-src', 'https://cdn.example.com/x.png'), true);
    assert.equal(allowedBy(policy, 'img-src', 'https://example.com/x.png'), false);
    assert.equal(allowedBy(policy, 'img-src', 'https://evil.test/x.png'), false);
    assert.equal(allowedBy(policy, 'script-src', '/js/a.js'), true);
    assert.equal(allowedBy(policy, 'script-src', 'https://assets.phalcon.io/a.js'), false);
});
