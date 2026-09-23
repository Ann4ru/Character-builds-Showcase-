import db from '../assets/hsr_character_library_starter.json' with { type: 'json' };

export class CharacterRepository {
  async getAll() {
    throw new Error('Not implemented');
  }
}

export class JsonCharacterRepository extends CharacterRepository {
  constructor(data) {
    super();
    this.data = data;
  }

  async getAll() {
    return this.data.characters;
  }
}

export const repository = new JsonCharacterRepository(db);
