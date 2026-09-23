import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elementIconUrl, pathIconUrl } from '../src/data/hsrAssets.js';

test('elementIconUrl lowercases element name', () => {
  assert.equal(elementIconUrl('lightning'), 'https://sunderarmor.com/STARRAIL/Elements/lightning_sm.png');
});

test('pathIconUrl lowercases capitalized path name', () => {
  assert.equal(pathIconUrl('Nihility'), 'https://sunderarmor.com/STARRAIL/Paths/nihility_sm.png');
});

test('pathIconUrl handles already-lowercase path name', () => {
  assert.equal(pathIconUrl('destruction'), 'https://sunderarmor.com/STARRAIL/Paths/destruction_sm.png');
});
