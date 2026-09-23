export function matchesQuery(character, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return character.name.toLowerCase().includes(q);
}

const GROUP_KEYS = [
  ['paths', 'path'],
  ['elements', 'element'],
  ['rarities', 'rarity'],
  ['ratings', 'overallRating'],
  ['roles', 'role'],
];

export function matchesFilters(character, filters) {
  return GROUP_KEYS.every(([group, field]) => {
    const selected = filters[group];
    if (!selected || selected.length === 0) return true;
    return selected.includes(character[field]);
  });
}

export function applyFilters(characters, query, filters) {
  return characters.filter((c) => matchesQuery(c, query) && matchesFilters(c, filters));
}
