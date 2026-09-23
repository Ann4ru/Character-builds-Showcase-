// src/data/hsrAssets.js
export function elementIconUrl(element) {
  return `https://sunderarmor.com/STARRAIL/Elements/${element}_sm.png`;
}

export function rarityStars(rarity) {
  return rarity === '4-star' ? '★★★★' : '★★★★★';
}
