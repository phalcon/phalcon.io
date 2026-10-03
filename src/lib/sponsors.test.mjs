import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { inGroup, logoSections, nameSections } from './sponsors.mjs';

const sponsor = (name, group, logo = `https://assets.phalcon.io/${name}.svg`) => ({
    group,
    id: `gh:${name}`,
    kind: 'financial',
    logo,
    name,
    source: ['github'],
    url: `https://example.com/${name}`,
});

test('inGroup keeps one group and sorts by name, ignoring case', () => {
    const roster = [sponsor('mctekk', 'sponsor'), sponsor('Abits', 'sponsor'), sponsor('Zed', 'backer')];

    assert.deepEqual(inGroup(roster, 'sponsor').map((s) => s.name), ['Abits', 'mctekk']);
});

test('inGroup with withLogo drops entries that have no logo', () => {
    const roster = [sponsor('Abits', 'partner'), sponsor('NoLogo', 'partner', null)];

    assert.deepEqual(inGroup(roster, 'partner', { withLogo: true }).map((s) => s.name), ['Abits']);
});

test('an empty roster gives no sections', () => {
    assert.deepEqual(logoSections([]), []);
    assert.deepEqual(nameSections([]), []);
});

test('logoSections keeps the order sponsor, partner and skips empty groups', () => {
    const roster = [sponsor('P', 'partner'), sponsor('S', 'sponsor'), sponsor('B', 'backer')];

    assert.deepEqual(logoSections(roster).map((s) => s.title), ['Sponsors', 'Partners']);
    assert.deepEqual(logoSections([sponsor('P', 'partner')]).map((s) => s.title), ['Partners']);
});

test('nameSections shows supporters and backers, with or without a logo', () => {
    const roster = [sponsor('B', 'backer', null), sponsor('U', 'supporter'), sponsor('S', 'sponsor')];

    assert.deepEqual(
        nameSections(roster).map((s) => [s.title, s.entries.map((e) => e.name)]),
        [['Supporters', ['U']], ['Backers', ['B']]]
    );
});

test('an unknown group shows nowhere', () => {
    const roster = [sponsor('X', 'other')];

    assert.deepEqual(logoSections(roster), []);
    assert.deepEqual(nameSections(roster), []);
});
