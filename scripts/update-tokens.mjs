/**
 * Updates src/styles/tokens.css from phalcon/assets (phalcon/css/tokens.css).
 * The deploy workflow runs it before the build. It does not commit: the
 * committed copy is the default.
 *
 *   ./run node scripts/update-tokens.mjs              download the file from GitHub
 *   ./run node scripts/update-tokens.mjs --from FILE  read FILE instead
 *
 * A file that cannot be read, or that has a problem (see tokensProblems in
 * src/lib/tokens.mjs), keeps the committed copy and prints a GitHub Actions
 * warning. The exit code is 0 also then.
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { tokensProblems } from '../src/lib/tokens.mjs';
import { usedBySite } from './token-sources.mjs';

const FILE = 'src/styles/tokens.css';
const SOURCE = 'https://raw.githubusercontent.com/phalcon/assets/master/phalcon/css/tokens.css';

const args = process.argv.slice(2);
const from = args.includes('--from') ? args[args.indexOf('--from') + 1] : null;

/** The new file, as { css } or { problem }. */
async function load() {
    try {
        if (from) {
            return { css: readFileSync(from, 'utf8') };
        }

        const response = await fetch(SOURCE, { signal: AbortSignal.timeout(30000) });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return { css: await response.text() };
    } catch (error) {
        return { problem: `cannot read the file: ${error.message}` };
    }
}

const tokens = await load();
const problems = tokens.problem ? [tokens.problem] : tokensProblems(tokens.css, usedBySite());

if (problems.length > 0) {
    problems.forEach((problem) => console.log(`::warning title=Design tokens::${problem}`));
    console.log(`kept          ${FILE}`);
} else if (readFileSync(FILE, 'utf8') === tokens.css) {
    console.log(`same          ${FILE}`);
} else {
    writeFileSync(FILE, tokens.css);
    console.log(`changed       ${FILE}`);
}
