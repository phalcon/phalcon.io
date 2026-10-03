import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { FEATURE_CATEGORIES } from '../data/snippets.mjs';

/*
 * Classes that the samples may use. Each one exists in cphalcon
 * (phalcon/<path>.zep) and in phalcon (src/<path>.php). Add a class here
 * only after the same check.
 */
const VERIFIED_CLASSES = [
    'Phalcon\\Di\\FactoryDefault',
    'Phalcon\\Http\\Response',
    'Phalcon\\Logger\\Adapter\\Stream',
    'Phalcon\\Logger\\Logger',
    'Phalcon\\Mvc\\Micro',
    'Phalcon\\Mvc\\Model',
    'Phalcon\\Mvc\\Router',
];

/* The built-in Volt filters (cphalcon phalcon/Mvc/View/Engine/Volt/Compiler.zep). */
const VOLT_FILTERS = [
    'abs', 'capitalize', 'convert_encoding', 'default', 'e', 'escape', 'escape_attr', 'escape_css', 'escape_js',
    'format', 'join', 'json_decode', 'json_encode', 'keys', 'left_trim', 'length', 'lower', 'lowercase', 'right_trim',
    'slashes', 'slice', 'sort', 'stripslashes', 'striptags', 'trim', 'upper', 'uppercase', 'url_encode',
];

/* Docs pages that exist in docs-5.22 and docs-6.0 of phalcon/documentation. */
const DOCS_SLUGS = [
    'acl', 'application-micro', 'autoload', 'cache', 'config', 'db-layer', 'db-models', 'db-models-transactions',
    'db-phql', 'di', 'encryption-crypt', 'events', 'flash', 'forms', 'logger', 'mvc', 'routing', 'translate', 'views',
    'volt',
];

test('there are five categories, each with all fields', () => {
    assert.equal(FEATURE_CATEGORIES.length, 5);

    for (const category of FEATURE_CATEGORIES) {
        for (const field of ['key', 'title', 'tagline', 'description', 'filename', 'lang', 'code']) {
            assert.ok(category[field], `${category.key} has ${field}`);
        }

        assert.ok(['php', 'twig'].includes(category.lang), `${category.key} lang`);
        assert.ok(category.components.length > 0, `${category.key} has components`);
    }
});

test('every class that a PHP sample imports is verified', () => {
    for (const category of FEATURE_CATEGORIES.filter((c) => c.lang === 'php')) {
        for (const [, name] of category.code.matchAll(/^use (Phalcon\\[\w\\]+);/gm)) {
            assert.ok(VERIFIED_CLASSES.includes(name), `${category.key} uses ${name}`);
        }
    }
});

test('no sample uses a v4 class name', () => {
    for (const category of FEATURE_CATEGORIES) {
        assert.doesNotMatch(category.code, /Phalcon\\(?:DI|Loader|Crypt|Cache)(?![\\\w])/, category.key);
    }
});

test('Volt samples use built-in filters only', () => {
    for (const category of FEATURE_CATEGORIES.filter((c) => c.lang === 'twig')) {
        for (const [, filter] of category.code.matchAll(/\|\s*(\w+)/g)) {
            assert.ok(VOLT_FILTERS.includes(filter), `${category.key} uses the filter ${filter}`);
        }
    }
});

test('every component links to an existing docs page', () => {
    for (const category of FEATURE_CATEGORIES) {
        for (const component of category.components) {
            assert.ok(DOCS_SLUGS.includes(component.slug), `${category.key}: ${component.slug}`);
        }
    }
});
