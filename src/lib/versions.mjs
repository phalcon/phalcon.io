/**
 * Version rules for the site data. The order is the order of PHP
 * version_compare(), which phalcon/assets uses: alpha < beta < RC < no
 * suffix, and numbers compare as numbers (beta11 > beta9). Letter case does
 * not matter.
 */

const PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:(alpha|beta|rc)(\d+))?$/i;
const STAGES = ['alpha', 'beta', 'rc'];
const STATUS = { alpha: 'Alpha', beta: 'Beta', rc: 'Release candidate' };

/** The parts of a version like 5.22.1 or 6.0.0RC3, or null. `stage` is null for a stable release. */
export function parseVersion(version) {
    const match = PATTERN.exec(String(version ?? ''));

    if (!match) {
        return null;
    }

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        number: match[5] ? Number(match[5]) : 0,
        patch: Number(match[3]),
        stage: match[4] ? match[4].toLowerCase() : null,
    };
}

/** Like parseVersion, but a value that is not a version is an error. */
function parsed(version) {
    const parts = parseVersion(version);

    if (!parts) {
        throw new Error(`"${version}" is not a version like 5.22.1 or 6.0.0RC3`);
    }

    return parts;
}

/** Negative when a is older than b, 0 when they are equal, positive when a is newer. */
export function compareVersions(a, b) {
    const x = parsed(a);
    const y = parsed(b);
    const rank = (parts) => (null === parts.stage ? STAGES.length : STAGES.indexOf(parts.stage));

    return x.major - y.major || x.minor - y.minor || x.patch - y.patch || rank(x) - rank(y) || x.number - y.number;
}

/** The major version: 5 for 5.22.1. */
export function majorOf(version) {
    return parsed(version).major;
}

/** The label of the release stage: Stable, Release candidate, Beta or Alpha. */
export function statusOf(version) {
    const { stage } = parsed(version);

    return null === stage ? 'Stable' : STATUS[stage];
}
