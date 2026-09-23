// scripts/sync-hsr.mjs
// Roster sync: diffs the live genshin.gg HSR roster against the bundled JSON
// and appends stubs for characters missing locally. Never overwrites entries.
//
// Rarity heuristic: the hub page lists the 5-star group before the 4-star
// group (the 4-star group currently starts at Arlan), and each entry's
// thumbnail also carries an explicit `rarity-5` / `rarity-4` class that
// agrees with that section order. Rarity is read from the class; when the
// class is absent it falls back to position relative to the first entry
// whose thumbnail matches a known 4-star id from the local JSON.

import { readFileSync, writeFileSync } from 'node:fs';

const HUB_URL = 'https://genshin.gg/star-rail/';
const JSON_URL = new URL('../src/assets/hsr_character_library_starter.json', import.meta.url);

const ALIASES = { Boothiill: 'Boothill' };

function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function parseRoster(html, knownFourStarThumbs) {
  const entries = [];
  const anchorRe = /<a href="(\/star-rail\/characters\/[^"'/]+\/)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = anchorRe.exec(html)) !== null) {
    const href = m[1];
    const inner = m[2];
    const imgTag = inner.match(/<img[^>]*>/);
    const alt = imgTag?.[0].match(/alt="([^"]*)"/);
    const cls = imgTag?.[0].match(/class="([^"]*)"/);
    const src = imgTag?.[0].match(/src="([^"]+)"/);
    const thumb = src ? [imgTag[0], alt?.[1] ?? '', cls?.[1] ?? '', src[1]] : null;
    const heading = inner.match(/<h2 class="character-name">([^<]+)<\/h2>/);
    if (!thumb && heading) {
      console.error(`Missing thumbnail src for character: ${heading[1].trim()} (${href})`);
    }
    const element = inner.match(/STARRAIL\/Elements\/([^"'_]+)_sm\.png/);
    const rawName = (heading && heading[1].trim()) || (thumb && thumb[1].trim()) || '';
    if (!rawName) {
      console.error(`Skipping entry without a name: ${href}`);
      continue;
    }
    const name = ALIASES[rawName] ?? rawName;
    const rarityClass = thumb ? thumb[2] : '';
    let rarity;
    if (/rarity-4/.test(rarityClass)) {
      rarity = '4-star';
    } else if (/rarity-5/.test(rarityClass)) {
      rarity = '5-star';
    } else {
      // No rarity class: fall back to section order. The 4-star group starts
      // at the first entry whose thumb matches a known 4-star id, so the
      // entry is 4-star when its own thumb is known or a 4-star was seen
      // before it.
      const pastBoundary = entries.some((e) => knownFourStarThumbs.has(e.image));
      rarity = thumb && (knownFourStarThumbs.has(thumb[3]) || pastBoundary) ? '4-star' : '5-star';
    }
    entries.push({
      name,
      image: thumb ? thumb[3] : null,
      element: element ? element[1] : null,
      rarity,
      pageUrl: `https://genshin.gg${href}`,
    });
  }
  return entries;
}

const dryRun = process.argv.includes('--dry-run');

const res = await fetch(HUB_URL);
if (!res.ok) {
  console.error(`Failed to fetch roster: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const roster = parseRoster(
  await res.text(),
  new Set(
    JSON.parse(readFileSync(JSON_URL, 'utf8')).characters
      .filter((c) => c.rarity === '4-star')
      .map((c) => c.image),
  ),
);

const raw = readFileSync(JSON_URL, 'utf8');
const data = JSON.parse(raw);
const existing = new Set(data.characters.map((c) => c.name));
const missing = roster.filter((e) => !existing.has(e.name));

if (dryRun) {
  for (const e of missing) console.log(`ADD ${e.name}`);
} else {
  const seen = new Set(existing);
  for (const e of missing) {
    if (seen.has(e.name)) continue;
    seen.add(e.name);
    data.characters.push({
      name: e.name,
      image: e.image,
      element: e.element,
      path: null,
      rarity: e.rarity,
      overallRating: null,
      role: null,
      bestLightCones: [],
      bestRelics: [],
      bestOrnaments: [],
      mainStats: { body: null, feet: null, sphere: null, rope: null },
      subStats: [],
      bestTeams: [],
      sources: [e.pageUrl],
    });
  }
  data.lastChecked = today();
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  writeFileSync(JSON_URL, `${JSON.stringify(data, null, 2).split('\n').join(eol)}${eol}`);
  console.log(`Added ${seen.size - existing.size}, kept ${existing.size}`);
}
