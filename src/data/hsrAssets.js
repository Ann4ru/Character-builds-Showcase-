// src/data/hsrAssets.js
export function elementIconUrl(element) {
  return `https://sunderarmor.com/STARRAIL/Elements/${String(element).toLowerCase()}_sm.png`;
}

export function pathIconUrl(path) {
  return `https://sunderarmor.com/STARRAIL/Paths/${String(path).toLowerCase()}_sm.png`;
}

export function rarityStars(rarity) {
  return rarity === '4-star' ? '★★★★' : '★★★★★';
}
