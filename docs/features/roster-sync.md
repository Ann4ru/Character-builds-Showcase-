# Roster sync

## Trigger

Manual, build-time only — never run by the app:

```bash
npm run sync:hsr               # sync live roster into the bundled JSON
npm run sync:hsr -- --dry-run  # print ADD <name> lines without writing
```

## Rules

1. Fetch `https://genshin.gg/star-rail/` HTML; parse roster entries (name, page slug, thumbnail URL, element from the icon path, rarity from the thumbnail's `rarity-5` / `rarity-4` class with a section-order fallback).
2. Normalize names through the alias map (`Boothiill` → `Boothill`) and diff against the JSON names.
3. Append missing characters as stubs: `image` filled from the thumbnail URL, `element` / `rarity` from the page, `path` / `overallRating` / `role` set to null, `bestLightCones` / `bestRelics` / `bestOrnaments` / `subStats` / `bestTeams` set to empty arrays, `mainStats` set to `{ body: null, feet: null, sphere: null, rope: null }`, `sources` set to the character page URL.
4. Update `lastChecked` to today (keep `schemaVersion` unless the shape changes) and print an `Added X, kept Y` report. Ratings and builds stay manual editorial work — the script never overwrites existing entries.
5. `--dry-run` prints `ADD <name>` per missing character and writes nothing (no `lastChecked` update either).

## Stub policy and alias map

- Stubs are intentionally sparse: everything the hub page cannot provide stays null/empty so the modal's `No data yet` placeholders show until an editor fills in real build data.
- Alias map (in `scripts/sync-hsr.mjs`, extend when the script reports unknown names): `Boothiill` → `Boothill`.
- Known roster gaps the script fills: `Black Swan`, `Bronya` (absent from the bundled JSON).

## `lastChecked`

- The JSON `lastChecked` field records the last sync date (`2026-09-23` as bundled). Only a real (non-dry-run) sync updates it.

Source: `scripts/sync-hsr.mjs`.
