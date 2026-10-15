import { strict as assert } from 'node:assert';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { BUILT_WITH } from '../data/built-with.mjs';

const images = new URL('../../public/images/built-with/', import.meta.url);

/** The largest image, in bytes (300 KB). */
const MAX_IMAGE = 307200;

const filled = (value) => typeof value === 'string' && value.trim() !== '';

test('each entry has the eight keys, with text in each key that is not optional', () => {
    assert.ok(BUILT_WITH.length > 0);

    for (const entry of BUILT_WITH) {
        assert.deepEqual(
            Object.keys(entry).sort(),
            ['alt', 'author', 'authorHref', 'description', 'href', 'name', 'slug', 'source'],
            entry.slug,
        );

        for (const key of ['slug', 'name', 'href', 'description', 'alt']) {
            assert.ok(filled(entry[key]), `${entry.slug}: ${key}`);
        }

        for (const key of ['source', 'author', 'authorHref']) {
            assert.ok(entry[key] === null || filled(entry[key]), `${entry.slug}: ${key}`);
        }
    }
});

test('the author link is https, and only an entry with an author has one', () => {
    for (const entry of BUILT_WITH) {
        if (entry.authorHref !== null) {
            assert.match(entry.authorHref, /^https:\/\/\S+$/, entry.slug);
            assert.notEqual(entry.author, null, entry.slug);
        }
    }
});

test('the slugs are unique and safe for a file name', () => {
    const slugs = BUILT_WITH.map((entry) => entry.slug);

    assert.equal(new Set(slugs).size, slugs.length);

    for (const slug of slugs) {
        assert.match(slug, /^[a-z0-9-]+$/);
    }
});

test('the links are https, and the source is not the same as the link', () => {
    for (const entry of BUILT_WITH) {
        assert.match(entry.href, /^https:\/\/\S+$/, entry.slug);

        if (entry.source !== null) {
            assert.match(entry.source, /^https:\/\/\S+$/, entry.slug);
            assert.notEqual(entry.source, entry.href, entry.slug);
        }
    }
});

test('each entry has a WebP image of at most 300 KB', () => {
    for (const { slug } of BUILT_WITH) {
        const file = new URL(`${slug}.webp`, images);

        assert.ok(existsSync(file), `${slug}.webp exists`);

        const bytes = readFileSync(file);

        assert.equal(bytes.subarray(0, 4).toString('latin1'), 'RIFF', `${slug}.webp`);
        assert.equal(bytes.subarray(8, 12).toString('latin1'), 'WEBP', `${slug}.webp`);
        assert.ok(bytes.length <= MAX_IMAGE, `${slug}.webp has ${bytes.length} bytes`);
    }
});

test('each image in public/images/built-with belongs to an entry', () => {
    const names = BUILT_WITH.map(({ slug }) => `${slug}.webp`);

    for (const file of readdirSync(images)) {
        assert.ok(names.includes(file), `${file} has no entry`);
    }
});
