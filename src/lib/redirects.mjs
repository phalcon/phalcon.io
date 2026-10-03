/**
 * Cloudflare Pages `_redirects`: parse the file and find the rule for a path.
 * Rules are tried in order, and the first rule that matches wins. `*` matches
 * the rest of the path (`:splat` in the target). `:name` matches one segment.
 *
 * @typedef {{ from: string, line: number, status: number, to: string }} Rule
 */

/**
 * @param {string} text
 * @returns {Rule[]}
 */
export function parseRedirects(text) {
    return text.split('\n').flatMap((raw, index) => {
        const line = raw.trim();

        if (line === '' || line.startsWith('#')) {
            return [];
        }

        const [from, to, status = '302'] = line.split(/\s+/);

        return [{ from, line: index + 1, status: Number(status), to }];
    });
}

const escape = (text) => text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

/** The regular expression of a rule source. */
function compile(from) {
    let source = '';

    for (const part of from.split(/(\*|:[A-Za-z]\w*)/)) {
        if (part === '*') {
            source += '(?<splat>.*)';
        } else if (/^:[A-Za-z]\w*$/.test(part)) {
            source += `(?<${part.slice(1)}>[^/]+)`;
        } else {
            source += escape(part);
        }
    }

    return new RegExp(`^${source}$`);
}

/**
 * The first rule that matches `path`, and its target with the placeholders filled in.
 *
 * @param {Rule[]} rules
 * @param {string} path
 * @returns {{ rule: Rule, target: string } | null}
 */
export function resolve(rules, path) {
    for (const rule of rules) {
        const match = path.match(compile(rule.from));

        if (match) {
            const target = rule.to.replace(/:([A-Za-z]\w*)/g, (whole, name) => match.groups?.[name] ?? whole);

            return { rule, target };
        }
    }

    return null;
}
