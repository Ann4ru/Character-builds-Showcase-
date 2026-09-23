import { test } from 'node:test';
import assert from 'node:assert/strict';

const { JsonCharacterRepository } = await import('../src/data/CharacterRepository.js');

test('returns the bundled characters array', async () => {
  const stub = { characters: [{ name: 'Acheron' }] };
  const repo = new JsonCharacterRepository(stub);
  assert.deepStrictEqual(await repo.getAll(), [{ name: 'Acheron' }]);
});
