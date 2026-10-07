import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
    candidateVersion,
    contributorsProblems,
    nextProject,
    repositoriesProblems,
    sizedAvatar,
    sponsorsProblems,
    toJson,
    visibleContributors,
} from './data-update.mjs';

const release = (version) => ({ date: '2026-10-01', tag: `v${version}`, version });

const repositories = ({ v5 = '5.22.1', v6Stable = null, v6Latest = '6.0.0RC3', v5Stars = 10820, v6Stars = 254 } = {}) => ({
    repositories: [
        { id: 'phalcon/cphalcon', latest: release(v5), stable: release(v5), stars: v5Stars, url: 'https://github.com/phalcon/cphalcon' },
        {
            id: 'phalcon/phalcon',
            latest: v6Latest ? release(v6Latest) : null,
            stable: v6Stable ? release(v6Stable) : null,
            stars: v6Stars,
            url: 'https://github.com/phalcon/phalcon',
        },
        { id: 'phalcon/crest', latest: null, stable: null, stars: 1, url: 'https://github.com/phalcon/crest' },
    ],
});

const project = (v5 = '5.22.1', v6 = '6.0.0RC3') => ({
    v5: { stars: '10.8k', version: v5 },
    v6: { stars: '249', version: v6 },
});

const person = (n) => ({
    avatar: `https://avatars.githubusercontent.com/u/${n}?v=4`,
    contributions: 1000 - n,
    login: `user${n}`,
    url: `https://github.com/user${n}`,
});

const contributors = (count) => ({ contributors: Array.from({ length: count }, (_, n) => person(n)) });

const sponsors = () => ({
    sponsors: [{ group: 'sponsor', id: 'manual:a', kind: 'in-kind', logo: null, name: 'A', source: ['manual'], url: 'https://a.example' }],
});

test('a good repositories feed has no problems', () => {
    assert.deepEqual(repositoriesProblems(repositories()), []);
});

test('repositoriesProblems finds a missing list, a bad count, a bad version and a missing repository', () => {
    assert.deepEqual(repositoriesProblems({}), ['the feed has no "repositories" list']);

    const feed = repositories();

    feed.repositories[0].stars = -1;
    feed.repositories[1].latest = { version: '6.0' };
    feed.repositories.splice(2, 1);
    assert.deepEqual(repositoriesProblems(feed), ['phalcon/cphalcon: stars is not a count', 'phalcon/phalcon: latest has no valid version']);

    assert.deepEqual(repositoriesProblems({ repositories: [repositories().repositories[0]] }), ['phalcon/phalcon is missing']);
});

test('v5 takes the stable release of cphalcon', () => {
    assert.deepEqual(candidateVersion(repositories(), 'v5'), { reason: null, version: '5.22.1' });
});

test('v6 takes the latest release while there is no stable one, then the stable one', () => {
    assert.equal(candidateVersion(repositories(), 'v6').version, '6.0.0RC3');
    assert.equal(candidateVersion(repositories({ v6Latest: '6.0.0', v6Stable: '6.0.0' }), 'v6').version, '6.0.0');
});

test('a release of another major version gives no candidate', () => {
    const result = candidateVersion(repositories({ v5: '6.0.0' }), 'v5');

    assert.equal(result.version, null);
    assert.match(result.reason, /is not major 5/);
});

test('a version only moves forward', () => {
    assert.equal(nextProject(project('5.23.0'), repositories({ v5: '5.22.1' })).project.v5.version, '5.23.0');
    assert.equal(nextProject(project('5.22.1'), repositories({ v5: '5.22.1' })).project.v5.version, '5.22.1');
    assert.equal(nextProject(project('5.22.1'), repositories({ v5: '5.23.0' })).project.v5.version, '5.23.0');
    assert.equal(nextProject(project('5.22.1', '6.0.0RC2'), repositories()).project.v6.version, '6.0.0RC3');
});

test('stars follow the feed, up and down', () => {
    assert.equal(nextProject(project(), repositories({ v5Stars: 10912 })).project.v5.stars, '10.9k');
    assert.equal(nextProject(project(), repositories({ v5Stars: 10790 })).project.v5.stars, '10.7k');
    assert.equal(nextProject(project(), repositories()).project.v6.stars, '254');
});

test('nextProject warns, and keeps the version, when there is no candidate', () => {
    const { project: next, warnings } = nextProject(project(), repositories({ v5: '6.0.0' }));

    assert.equal(next.v5.version, '5.22.1');
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /^v5: .* the version stays 5\.22\.1$/);
});

test('nextProject does not change the project that it gets', () => {
    const before = project();

    nextProject(before, repositories({ v5: '5.23.0' }));
    assert.equal(before.v5.version, '5.22.1');
});

test('a good contributors feed has no problems', () => {
    assert.deepEqual(contributorsProblems(contributors(100)), []);
});

test('contributorsProblems finds a missing list, too few entries and bad fields', () => {
    assert.deepEqual(contributorsProblems({}), ['the feed has no "contributors" list']);
    assert.deepEqual(contributorsProblems(contributors(59)), ['the feed has 59 contributors, fewer than 60']);

    const feed = contributors(60);

    feed.contributors[3].avatar = 'https://example.com/a.png';
    feed.contributors[4].login = '';
    assert.deepEqual(contributorsProblems(feed), ['entry 4 has no GitHub avatar', 'entry 5 has no login']);
});

test('visibleContributors keeps the first 60, with login, url and avatar only', () => {
    const visible = visibleContributors(contributors(100));

    assert.equal(visible.length, 60);
    assert.deepEqual(visible[0], { avatar: 'https://avatars.githubusercontent.com/u/0?v=4', login: 'user0', url: 'https://github.com/user0' });
});

test('sponsorsProblems finds a missing list, an empty list and missing fields', () => {
    assert.deepEqual(sponsorsProblems(sponsors()), []);
    assert.deepEqual(sponsorsProblems({}), ['the feed has no "sponsors" list']);
    assert.deepEqual(sponsorsProblems({ sponsors: [] }), ['the sponsors list is empty']);
    assert.deepEqual(sponsorsProblems({ sponsors: [{ group: 'sponsor', name: 'A' }] }), ['entry 1 has no url']);
});

test('sizedAvatar adds the size to any avatar URL', () => {
    assert.equal(sizedAvatar('https://avatars.githubusercontent.com/u/1?v=4', 80), 'https://avatars.githubusercontent.com/u/1?v=4&s=80');
    assert.equal(sizedAvatar('https://avatars.githubusercontent.com/u/1', 80), 'https://avatars.githubusercontent.com/u/1?s=80');
    assert.equal(sizedAvatar('https://avatars.githubusercontent.com/u/1?s=40', 80), 'https://avatars.githubusercontent.com/u/1?s=80');
});

test('toJson writes 4-space JSON with a final newline', () => {
    assert.equal(toJson({ a: [1] }), '{\n    "a": [\n        1\n    ]\n}\n');
});
