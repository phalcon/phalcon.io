import { strict as assert } from 'node:assert';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { BUILT_WITH, BUILT_WITH_TAGS, orderTags } from '../data/built-with.mjs';

const images = new URL('../../public/images/built-with/', import.meta.url);

/** The largest image, in bytes (300 KB). */
const MAX_IMAGE = 307200;

/** The most tags of one entry. */
const MAX_TAGS = 10;

const filled = (value) => typeof value === 'string' && value.trim() !== '';

/** The items that are in a list more than once. */
const twice = (list) => list.filter((item, index) => list.indexOf(item) !== index);

/** The image blocks that a screenshot can have, in this order. */
const LAYOUTS = ['VP8 ', 'VP8L', 'VP8X,VP8 ', 'VP8X,ALPH,VP8 ', 'VP8X,VP8L'];

/** A number as 4 bytes, little-endian. */
const u32 = (value) => {
    const bytes = Buffer.alloc(4);

    bytes.writeUInt32LE(value);

    return bytes;
};

/** One block of a WebP file: the name, the size, the data, and a pad byte when the size is odd. */
const block = (name, data) => Buffer.concat([Buffer.from(name, 'latin1'), u32(data.length), data, Buffer.alloc(data.length % 2)]);

/** A WebP file with these blocks. */
const webp = (...blocks) => {
    const body = Buffer.concat([Buffer.from('WEBP', 'latin1'), ...blocks]);

    return Buffer.concat([Buffer.from('RIFF', 'latin1'), u32(body.length), body]);
};

/** The first 10 bytes of a lossy image: the frame tag, the start code, the width and the height. */
const vp8 = (width, height) => Buffer.from([0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a, width & 0xff, width >> 8, height & 0xff, height >> 8]);

/** The first 5 bytes of a lossless image: the signature 0x2f, then the width minus 1 and the height minus 1 (14 bits each). */
const vp8l = (width, height) => {
    const data = Buffer.alloc(5);

    data[0] = 0x2f;
    data.writeUInt32LE(((height - 1) << 14) | (width - 1), 1);

    return data;
};

/** The data of a VP8X block: the flags, 3 bytes of 0, the canvas width minus 1 and height minus 1 (3 bytes each). */
const vp8x = (flags, width, height) => {
    const data = Buffer.alloc(10);

    data[0] = flags;
    data.writeUIntLE(width - 1, 4, 3);
    data.writeUIntLE(height - 1, 7, 3);

    return data;
};

/**
 * What is wrong with a WebP file, as a list of texts (empty when the file is
 * correct). It reads the blocks only: it does not decode the image.
 */
function webpProblems(bytes) {
    if (bytes.subarray(0, 4).toString('latin1') !== 'RIFF' || bytes.subarray(8, 12).toString('latin1') !== 'WEBP') {
        return ['not a WebP file'];
    }

    const problems = [];
    const names = [];
    let flags = 0;
    let size = null;
    let offset = 12;

    if (bytes.readUInt32LE(4) + 8 !== bytes.length) {
        problems.push(`the RIFF length is ${bytes.readUInt32LE(4) + 8}, the file has ${bytes.length} bytes`);
    }

    while (offset + 8 <= bytes.length) {
        const name = bytes.subarray(offset, offset + 4).toString('latin1');
        const length = bytes.readUInt32LE(offset + 4);
        const data = bytes.subarray(offset + 8, offset + 8 + length);

        names.push(name);

        if (name === 'VP8X' && data.length >= 10) {
            flags = data[0];
            size = [data.readUIntLE(4, 3) + 1, data.readUIntLE(7, 3) + 1];
        } else if (name === 'VP8 ' && size === null && data.length >= 10 && data[3] === 0x9d && data[4] === 0x01 && data[5] === 0x2a) {
            size = [data.readUInt16LE(6) & 0x3fff, data.readUInt16LE(8) & 0x3fff];
        } else if (name === 'VP8L' && size === null && data.length >= 5 && data[0] === 0x2f) {
            const bits = data.readUInt32LE(1);

            size = [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
        }

        offset += 8 + length + (length % 2);
    }

    if (offset !== bytes.length) {
        problems.push(`the blocks end at byte ${offset}, the file has ${bytes.length} bytes`);
    }

    if (!LAYOUTS.includes(names.join(','))) {
        problems.push(`the blocks are ${names.join(', ')}`);
    }

    if ((flags & ~0x10) !== 0) {
        problems.push(`the VP8X flags are 0x${flags.toString(16)}`);
    }

    if (size === null || size[0] !== 1280 || size[1] !== 800) {
        problems.push(`the size is ${size === null ? 'unknown' : size.join(' x ')}`);
    }

    return problems;
}

test('each entry has the nine keys, with text in each key that is not optional', () => {
    assert.ok(BUILT_WITH.length > 0);

    for (const entry of BUILT_WITH) {
        assert.deepEqual(
            Object.keys(entry).sort(),
            ['alt', 'author', 'authorHref', 'description', 'href', 'name', 'slug', 'source', 'tags'],
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

test('the preset tags are in three groups, each sorted A to Z, with no tag twice', () => {
    assert.deepEqual(Object.keys(BUILT_WITH_TAGS), ['type', 'phalcon', 'stack']);

    for (const [group, tags] of Object.entries(BUILT_WITH_TAGS)) {
        assert.ok(tags.length > 0, group);

        for (const tag of tags) {
            assert.ok(filled(tag), `${group}: "${tag}"`);
        }

        const lower = tags.map((tag) => tag.toLowerCase());

        assert.deepEqual(lower, [...lower].sort(), `${group} is not sorted A to Z`);
    }

    const all = Object.values(BUILT_WITH_TAGS).flat().map((tag) => tag.toLowerCase());

    assert.deepEqual(twice(all), [], 'a tag is in the list twice');
});

test('each entry has 1 to 10 tags of the preset list, with no tag twice', () => {
    const preset = Object.values(BUILT_WITH_TAGS).flat();

    for (const entry of BUILT_WITH) {
        assert.ok(Array.isArray(entry.tags), `${entry.slug}: tags`);
        assert.ok(entry.tags.length >= 1 && entry.tags.length <= MAX_TAGS, `${entry.slug} has ${entry.tags.length} tags`);
        assert.deepEqual(twice(entry.tags), [], `${entry.slug} has a tag twice`);

        for (const tag of entry.tags) {
            assert.ok(preset.includes(tag), `${entry.slug}: "${tag}" is not in BUILT_WITH_TAGS`);
        }
    }
});

test('orderTags puts the tags in the order of the groups, then of the preset list', () => {
    const tags = ['Redis', 'Education', 'CLI'];

    assert.deepEqual(orderTags(tags), ['Education', 'CLI', 'Redis']);
    assert.deepEqual(tags, ['Redis', 'Education', 'CLI'], 'the input does not change');
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

test('the block check accepts the image blocks and refuses other blocks, data after the image and a wrong size', () => {
    const image = block('VP8 ', vp8(1280, 800));

    assert.deepEqual(webpProblems(webp(image)), []);
    assert.deepEqual(webpProblems(webp(block('VP8X', vp8x(0x10, 1280, 800)), block('ALPH', Buffer.alloc(3)), image)), []);
    assert.deepEqual(webpProblems(webp(block('VP8X', vp8x(0, 1280, 800)), block('ICCP', Buffer.alloc(456)), image)), [
        'the blocks are VP8X, ICCP, VP8 ',
    ]);
    assert.deepEqual(webpProblems(webp(image, block('EXIF', Buffer.alloc(7)))), ['the blocks are VP8 , EXIF']);
    assert.deepEqual(webpProblems(webp(block('VP8X', vp8x(0x02, 1280, 800)), image)), ['the VP8X flags are 0x2']);
    assert.deepEqual(webpProblems(webp(block('VP8 ', vp8(1279, 800)))), ['the size is 1279 x 800']);
    assert.match(webpProblems(Buffer.concat([webp(image), Buffer.from('<script>', 'latin1')])).join('; '), /the RIFF length is 30, the file has 38 bytes/);
    assert.deepEqual(webpProblems(Buffer.from('GIF89a')), ['not a WebP file']);
    assert.deepEqual(webpProblems(webp(block('VP8L', vp8l(1280, 800)))), []);
    assert.deepEqual(webpProblems(webp(block('VP8X', vp8x(0x02, 1280, 800)), block('ANIM', Buffer.alloc(6)), block('ANMF', Buffer.alloc(16)))), [
        'the blocks are VP8X, ANIM, ANMF',
        'the VP8X flags are 0x2',
    ]);
    assert.match(webpProblems(webp(image).subarray(0, 25)).join('; '), /the blocks end at byte 30, the file has 25 bytes/);
});

test('each image has only the image blocks, nothing after them, and the size 1280 x 800', () => {
    for (const { slug } of BUILT_WITH) {
        assert.deepEqual(webpProblems(readFileSync(new URL(`${slug}.webp`, images))), [], `${slug}.webp`);
    }
});
