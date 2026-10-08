/**
 * Rules for scripts/update-data.mjs: check the phalcon/assets feeds and turn
 * them into the committed site data. There is no network and no file access
 * here, so every rule has unit tests (data-update.test.mjs).
 */
import { formatStars } from './stars.mjs';
import { compareVersions, majorOf, parseVersion } from './versions.mjs';

export const AVATAR_HOST = 'https://avatars.githubusercontent.com/';
export const CONTRIBUTORS_SHOWN = 60;

/** For each flavor: the repository and the major version that it reads. Only v6 may show a pre-release. */
export const SOURCES = {
    v5: { id: 'phalcon/cphalcon', major: 5, prerelease: false },
    v6: { id: 'phalcon/phalcon', major: 6, prerelease: true },
};

const isObject = (value) => null !== value && 'object' === typeof value && !Array.isArray(value);
const isText = (value) => 'string' === typeof value && '' !== value;
const startsWith = (value, prefix) => 'string' === typeof value && value.startsWith(prefix);

/** Problems in the repositories feed. An empty list means that the feed is good. */
export function repositoriesProblems(feed) {
    if (!isObject(feed) || !Array.isArray(feed.repositories)) {
        return ['the feed has no "repositories" list'];
    }

    const problems = [];

    for (const entry of feed.repositories) {
        const id = isText(entry?.id) ? entry.id : '(no id)';

        if (!Number.isInteger(entry?.stars) || entry.stars < 0) {
            problems.push(`${id}: stars is not a count`);
        }

        for (const key of ['stable', 'latest']) {
            const value = entry?.[key];

            if (null !== value && (!isObject(value) || null === parseVersion(value.version))) {
                problems.push(`${id}: ${key} has no valid version`);
            }
        }
    }

    for (const { id } of Object.values(SOURCES)) {
        if (!feed.repositories.some((entry) => entry?.id === id)) {
            problems.push(`${id} is missing`);
        }
    }

    return problems;
}

/** The version that a flavor would show from a good feed, or null with the reason. */
export function candidateVersion(feed, flavor) {
    const source = SOURCES[flavor];
    const entry = feed.repositories.find((item) => item.id === source.id);
    const release = entry.stable ?? (source.prerelease ? entry.latest : null);

    if (null === release) {
        return { reason: `${source.id} has no ${source.prerelease ? '' : 'stable '}release`, version: null };
    }

    if (majorOf(release.version) !== source.major) {
        return { reason: `${source.id} ${release.version} is not major ${source.major}`, version: null };
    }

    return { reason: null, version: release.version };
}

/**
 * The next site data for the flavors, from a good feed. A version only moves
 * forward: an older or equal version in the feed keeps the committed one, so
 * a stale feed never undoes a manual edit. The star count follows the feed,
 * up or down.
 */
export function nextProject(project, feed) {
    const next = structuredClone(project);
    const warnings = [];

    for (const [flavor, source] of Object.entries(SOURCES)) {
        const { reason, version } = candidateVersion(feed, flavor);
        const entry = feed.repositories.find((item) => item.id === source.id);

        if (null === version) {
            warnings.push(`${flavor}: ${reason}; the version stays ${project[flavor].version}`);
        } else if (compareVersions(version, project[flavor].version) > 0) {
            next[flavor].version = version;
        }

        next[flavor].stars = formatStars(entry.stars);
    }

    return { project: next, warnings };
}

/** Problems in the contributors feed. An empty list means that the feed is good. */
export function contributorsProblems(feed) {
    if (!isObject(feed) || !Array.isArray(feed.contributors)) {
        return ['the feed has no "contributors" list'];
    }

    if (feed.contributors.length < CONTRIBUTORS_SHOWN) {
        return [`the feed has ${feed.contributors.length} contributors, fewer than ${CONTRIBUTORS_SHOWN}`];
    }

    const problems = [];

    feed.contributors.slice(0, CONTRIBUTORS_SHOWN).forEach((person, index) => {
        if (!startsWith(person?.avatar, AVATAR_HOST)) {
            problems.push(`entry ${index + 1} has no GitHub avatar`);
        }

        if (!isText(person?.login)) {
            problems.push(`entry ${index + 1} has no login`);
        }

        if (!startsWith(person?.url, 'https://github.com/')) {
            problems.push(`entry ${index + 1} has no GitHub url`);
        }
    });

    return problems;
}

/** The contributors that the site shows: the first 60, with login, url and avatar only. */
export function visibleContributors(feed) {
    return feed.contributors.slice(0, CONTRIBUTORS_SHOWN).map(({ avatar, login, url }) => ({ avatar, login, url }));
}

/** Problems in the sponsors feed. An empty list means that the feed is good. */
export function sponsorsProblems(feed) {
    if (!isObject(feed) || !Array.isArray(feed.sponsors)) {
        return ['the feed has no "sponsors" list'];
    }

    if (0 === feed.sponsors.length) {
        return ['the sponsors list is empty'];
    }

    const problems = [];

    feed.sponsors.forEach((sponsor, index) => {
        for (const key of ['group', 'name', 'url']) {
            if (!isText(sponsor?.[key])) {
                problems.push(`entry ${index + 1} has no ${key}`);
            }
        }
    });

    return problems;
}

/** An avatar URL at a size in pixels. GitHub reads the "s" parameter. */
export function sizedAvatar(url, size) {
    const sized = new URL(url);

    sized.searchParams.set('s', String(size));

    return sized.href;
}

/** The text of a data file: 4-space JSON and a final newline, as phalcon/assets writes. */
export function toJson(data) {
    return `${JSON.stringify(data, null, 4)}\n`;
}
