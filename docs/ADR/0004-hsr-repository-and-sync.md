# 0004 — HSR repository seam + build-time roster sync

Date: 2026-09-23
Status: Accepted (implemented)

## Context

The HSR rework replaces the dummyjson product fetch with a bundled 90-character roster JSON (schema 1.1) that must stay fresh against the live genshin.gg roster. Two questions needed answers: how do components consume the data so a future real database does not require UI rewrites, and when does the live-roster sync run.

## Decision

1. **Repository over direct import.** Components depend only on `CharacterRepository.getAll()` (promise of character arrays). `JsonCharacterRepository` serves the bundled JSON today; a future `ApiCharacterRepository` (or any real-DB adapter) implements the same contract without touching components. Loading/error/empty UI states are preserved as-is so a future remote adapter inherits the same gates. Costs one small abstraction layer (`src/data/CharacterRepository.js`).
2. **Build-time sync over runtime sync.** A manual script (`scripts/sync-hsr.mjs`, `npm run sync:hsr`) diffs the live roster and appends missing characters as stubs. It never runs in the browser and never overwrites existing entries (ratings/builds stay editorial).

## Alternatives considered

- **Mock JSON imported directly into components (simplest).** Rejected: no seam for a real database; every future data-source change touches UI code.
- **Runtime first-load sync from genshin.gg.** Rejected: browsers cannot scrape genshin.gg (CORS, JS-rendered pages); it would need a proxy and adds load-time failure modes. A build-time script gets the same freshness with none of the runtime cost.

## Consequences

- Filter option lists derive from the JSON `enums`, so roster/enum changes never require UI edits; the modal tolerates stub-shaped entries via null/empty placeholders.
- Hotlinked thumbnails can rot or be blocked (accepted; mitigation: `onError` fallback + sync re-scrape).
- Name mismatches between sources (`Boothiill`, future renames) must be handled by extending the alias map when the script reports unknown names.
- `lastChecked` tracks sync freshness; `schemaVersion` only changes when the entry shape changes.
