/**
 * Checks external links. It needs the network, so CI does not run it.
 *
 *   ./run node scripts/check-links.mjs                      every external link in dist/ and dist/_redirects
 *   ./run node scripts/check-links.mjs URL…                 the given URLs
 *   ./run node scripts/check-links.mjs --contains TEXT URL… the given URLs, and each page must contain TEXT
 *
 * "WARN" means that the site blocks automatic checks (401, 403, 429, 999).
 * Open those URLs in a browser. The exit code is 1 when a link fails.
 */
import { readdirSync, readFileSync } from 'node:fs';

import { parseRedirects } from '../src/lib/redirects.mjs';
import { attrValues } from './lib.mjs';

const BLOCKED = [401, 403, 429, 999];

const args = process.argv.slice(2);
let contains = null;

if (args[0] === '--contains') {
    contains = args[1].toLowerCase();
    args.splice(0, 2);
}

/** Every external URL in the built pages and in the redirect targets. */
function collect() {
    const urls = new Set();
    const files = readdirSync('dist', { recursive: true })
        .filter((file) => file.endsWith('.html') && !file.startsWith('debug'))
        .map((file) => `dist/${file}`);

    for (const file of files) {
        const html = readFileSync(file, 'utf8');

        for (const [tag, attr] of [['a', 'href'], ['img', 'src'], ['iframe', 'src'], ['script', 'src']]) {
            for (const value of attrValues(html, tag, attr)) {
                if (/^https?:\/\//.test(value)) {
                    urls.add(value.split('#')[0]);
                }
            }
        }
    }

    for (const rule of parseRedirects(readFileSync('dist/_redirects', 'utf8'))) {
        if (/^https?:\/\//.test(rule.to)) {
            urls.add(rule.to);
        }
    }

    return [...urls].sort();
}

async function check(url) {
    try {
        const response = await fetch(url, {
            headers: { 'user-agent': 'Mozilla/5.0 (phalcon.io link check)' },
            redirect: 'follow',
            signal: AbortSignal.timeout(15000),
        });
        const found = !contains || (await response.text()).toLowerCase().includes(contains);
        const state = BLOCKED.includes(response.status) ? 'WARN' : response.status < 400 && found ? 'ok  ' : 'FAIL';

        return { final: response.url, state, status: found ? response.status : `${response.status} no "${contains}"` };
    } catch (error) {
        return { final: url, state: 'FAIL', status: error.name };
    }
}

const urls = args.length > 0 ? args : collect();
let failed = 0;

// One request at a time, to be polite to the sites.
for (const url of urls) {
    const result = await check(url);

    if (result.state === 'FAIL') {
        failed++;
    }

    console.log(`${result.state}  ${result.status}  ${url}${result.final !== url ? `  → ${result.final}` : ''}`);
}

console.log(`\n${urls.length - failed} of ${urls.length} links did not fail`);
process.exit(failed === 0 ? 0 : 1);
