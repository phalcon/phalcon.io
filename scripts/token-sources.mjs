/**
 * The design tokens that the site's source uses. The source tests and
 * scripts/update-tokens.mjs use it: a tokens file must define all of them.
 */
import { readdirSync, readFileSync } from 'node:fs';

import { usedTokens } from '../src/lib/design-checks.mjs';

const root = new URL('../src/', import.meta.url);

/**
 * The source files that can use a token or type a color: pages, components,
 * layouts, styles and modules. Tests and the tokens file are not sources.
 *
 * @returns {string[]} paths relative to src/
 */
export function sourceFiles() {
    return readdirSync(root, { recursive: true })
        .filter((file) => /\.(astro|css|mjs|ts)$/.test(file))
        .filter((file) => !file.endsWith('.test.mjs') && file !== 'styles/tokens.css');
}

/**
 * Every --ph- token that a source file uses in var().
 *
 * @returns {Set<string>}
 */
export function usedBySite() {
    return new Set(sourceFiles().flatMap((file) => [...usedTokens(readFileSync(new URL(file, root), 'utf8'))]));
}
