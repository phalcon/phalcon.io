/**
 * The code theme of the Phalcon sites: src/styles/code-theme.json, a copy of
 * phalcon/css/code-theme.json in phalcon/assets. Its rules are the rules of
 * GitHub's dark theme (Shiki's github-dark-default): they decide which part of
 * the code gets which role. Each color is a --code-<role> variable, and
 * .astro-code in src/styles/global.css maps the variables to the syntax tokens.
 *
 * The checks of the rules are in phalcon/assets (tests/tokens.php). The check
 * that this site can use a new file is codeThemeProblems() in
 * src/lib/design-checks.mjs, a copy of the shared design tools.
 */
import theme from '../styles/code-theme.json' with { type: 'json' };

/** @type {import('shiki').ThemeRegistration} */
export const CODE_THEME = /** @type {import('shiki').ThemeRegistration} */ (theme);
