import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesQuery, matchesFilters, applyFilters } from '../src/data/characterFilters.js';

const acheron = { name: 'Acheron', element: 'lightning', path: 'nihility', rarity: '5-star', overallRating: 'S+', role: 'DPS' };
const bailu = { name: 'Bailu', element: 'lightning', path: 'abundance', rarity: '4-star', overallRating: 'A', role: 'sustain' };
const emptyFilters = { paths: [], elements: [], rarities: [], ratings: [], roles: [] };

test('query matches name substring, case-insensitive, trimmed', () => {
  assert.equal(matchesQuery(acheron, '  ACH '), true);
  assert.equal(matchesQuery(bailu, 'ach'), false);
});

test('empty query matches everything', () => {
  assert.equal(matchesQuery(acheron, ''), true);
  assert.equal(matchesQuery(acheron, '   '), true);
});

test('selections within one group combine with OR', () => {
  assert.equal(matchesFilters(acheron, { ...emptyFilters, paths: ['nihility', 'abundance'] }), true);
  assert.equal(matchesFilters(bailu, { ...emptyFilters, paths: ['nihility', 'abundance'] }), true);
  assert.equal(matchesFilters(acheron, { ...emptyFilters, paths: ['abundance'] }), false);
});

test('selections across groups combine with AND', () => {
  const f = { ...emptyFilters, elements: ['lightning'], roles: ['sustain'] };
  assert.equal(matchesFilters(bailu, f), true);
  assert.equal(matchesFilters(acheron, f), false);
});

test('applyFilters combines query AND filters', () => {
  const list = [acheron, bailu];
  assert.deepStrictEqual(applyFilters(list, '', emptyFilters), list);
  assert.deepStrictEqual(applyFilters(list, 'a', { ...emptyFilters, roles: ['sustain'] }), [bailu]);
  assert.deepStrictEqual(applyFilters(list, 'zzz', emptyFilters), []);
});
