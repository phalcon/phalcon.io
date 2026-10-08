import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { compareVersions, majorOf, parseVersion, statusOf } from './versions.mjs';

const older = (a, b) => assert.ok(compareVersions(a, b) < 0, `${a} < ${b}`);

test('parseVersion reads a stable and a pre-release version', () => {
    assert.deepEqual(parseVersion('5.22.1'), { major: 5, minor: 22, number: 0, patch: 1, stage: null });
    assert.deepEqual(parseVersion('6.0.0RC3'), { major: 6, minor: 0, number: 3, patch: 0, stage: 'rc' });
});

test('parseVersion rejects what is not a version', () => {
    for (const value of ['5.22', 'v5.22.1', '5.22.1-hotfix', 'latest', '', null]) {
        assert.equal(parseVersion(value), null, String(value));
    }
});

test('compareVersions orders numbers as numbers', () => {
    older('5.22.1', '5.23.0');
    older('5.9.0', '5.10.0');
    older('6.0.0beta9', '6.0.0beta11');
});

test('compareVersions orders alpha < beta < RC < stable', () => {
    older('6.0.0alpha1', '6.0.0beta1');
    older('6.0.0beta11', '6.0.0RC3');
    older('6.0.0RC3', '6.0.0');
});

test('compareVersions ignores letter case and finds equal versions', () => {
    assert.equal(compareVersions('6.0.0rc3', '6.0.0RC3'), 0);
    assert.equal(compareVersions('5.22.1', '5.22.1'), 0);
});

test('compareVersions rejects a value that is not a version', () => {
    assert.throws(() => compareVersions('5.22', '5.22.1'), /is not a version/);
});

test('majorOf gives the major version', () => {
    assert.equal(majorOf('5.22.1'), 5);
    assert.equal(majorOf('6.0.0RC3'), 6);
});

test('statusOf names the release stage', () => {
    assert.equal(statusOf('5.22.1'), 'Stable');
    assert.equal(statusOf('6.0.0RC3'), 'Release candidate');
    assert.equal(statusOf('6.0.0beta11'), 'Beta');
    assert.equal(statusOf('6.0.0alpha1'), 'Alpha');
});

test('statusOf rejects a value that is not a version', () => {
    assert.throws(() => statusOf('5.22'), /is not a version/);
});
