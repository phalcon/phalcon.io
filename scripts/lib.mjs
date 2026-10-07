/**
 * Helpers for the build checks. They use regular expressions on purpose:
 * the input is our own build output, not HTML from an unknown source.
 */

const ENTITIES = { amp: '&', gt: '>', lt: '<', nbsp: ' ', quot: '"' };

/** The body of a start tag: any character except ">", or a quoted string. */
const TAG_BODY = `(?:[^>"']|"[^"]*"|'[^']*')*`;

/** Decodes the entities that Astro writes (named, and numeric such as &#34;). One level only. */
const decode = (text) =>
    text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|gt|lt|nbsp|quot));/gi, (whole, dec, hex, name) =>
        dec ? String.fromCodePoint(Number(dec)) : hex ? String.fromCodePoint(parseInt(hex, 16)) : ENTITIES[name.toLowerCase()]
    );

/** The visible text of a page: no scripts, styles or tags, entities decoded, spaces collapsed. */
export function textOf(html) {
    return decode(
        html
            .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
    )
        .replace(/\s+/g, ' ')
        .trim();
}

/** The attributes of every `<tag>` element, one object per element. Names are lower case. */
export function elements(html, tag) {
    const found = [];

    for (const [, body] of html.matchAll(new RegExp(`<${tag}(?=[\\s>/])(${TAG_BODY})>`, 'gi'))) {
        const attributes = {};

        for (const [, name, double, single, bare] of body.matchAll(
            /([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
        )) {
            attributes[name.toLowerCase()] = decode(double ?? single ?? bare ?? '');
        }

        found.push(attributes);
    }

    return found;
}

/** The values of `attr` on every `<tag>` element that has it. */
export function attrValues(html, tag, attr) {
    return elements(html, tag)
        .map((attributes) => attributes[attr])
        .filter((value) => value !== undefined);
}

/** The code of inline scripts that a browser runs: no src, and no data type such as JSON-LD. */
export function inlineScripts(html) {
    const scripts = [];

    for (const [, body, code] of html.matchAll(new RegExp(`<script(?=[\\s>])(${TAG_BODY})>([\\s\\S]*?)</script>`, 'gi'))) {
        const attributes = elements(`<script${body}>`, 'script')[0] ?? {};
        const type = (attributes.type ?? '').toLowerCase();

        if (attributes.src !== undefined || !['', 'module', 'text/javascript'].includes(type)) {
            continue;
        }

        scripts.push(code);
    }

    return scripts;
}

/** The Content-Security-Policy in a Cloudflare `_headers` file, as directive → sources. */
export function parseCsp(headersText) {
    const line = headersText.split('\n').find((row) => row.trim().startsWith('Content-Security-Policy:'));
    const policy = {};

    if (!line) {
        return policy;
    }

    for (const part of line.slice(line.indexOf(':') + 1).split(';')) {
        const [name, ...sources] = part.trim().split(/\s+/);

        if (name) {
            policy[name] = sources;
        }
    }

    return policy;
}

/** True when the policy lets a page load `url` for `directive`. Uses default-src when the directive is missing. */
export function allowedBy(policy, directive, url) {
    const sources = policy[directive] ?? policy['default-src'] ?? [];

    if (url.startsWith('data:')) {
        return sources.includes('data:');
    }

    const absolute = url.startsWith('//') ? `https:${url}` : url;

    if (!/^https?:/i.test(absolute)) {
        return sources.includes("'self'");
    }

    const { hostname, protocol } = new URL(absolute);

    return sources.some((source) => {
        const match = source.match(/^(https?:)\/\/(\*\.)?([^/:]+)/i);

        if (!match || match[1].toLowerCase() !== protocol) {
            return false;
        }

        return match[2] ? hostname.endsWith(`.${match[3]}`) : hostname === match[3];
    });
}
