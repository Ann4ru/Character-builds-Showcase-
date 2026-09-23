# CONTEXT.md — current state of character-showcase

Last updated: 2026-09-23 (HSR rework implemented, Tasks 1–9; verification green same turn). Update this file whenever behavior, API, or structure changes.

## What this is

React 19 + Vite 8 + Bootstrap 5 **Honkai: Star Rail character showcase**. The products demo is gone: `Characters`/`Character`/`CharacterModal`/`FilterPanel`/`SearchBar` browse the 90-character bundled roster with name search, multi-select filters, and a build detail modal. Design spec: `docs/superpowers/specs/2026-09-23-hsr-showcase-design.md`. See `README.md` for setup, `ARCHITECTURE.md` for design.

## HSR rework — implemented 2026-09-23 (Tasks 1–9)

- Data: `src/assets/hsr_character_library_starter.json`, schema 1.1, 90 characters, `lastChecked: 2026-09-23`, `rarity` split 67× `5-star` / 23× `4-star`, all `image` fields hotlinked (`sunderarmor.com/STARRAIL/...`), `overallRating` editorial.
- Repository seam: `CharacterRepository` base + `JsonCharacterRepository` (`src/data/CharacterRepository.js`); components depend only on `getAll()`.
- Pure filter predicate (`src/data/characterFilters.js`) covered by `node --test` (`tests/characterFilters.test.js`, `tests/characterRepository.test.js`) — no test framework dependency.
- UI: `Characters.jsx` container (repository → `useMemo` filtering → card/modal), `FilterPanel` sidebar, `CharacterModal` (`size="lg"`), retargeted `SearchBar`.
- Sync: `scripts/sync-hsr.mjs` (`npm run sync:hsr`, `--dry-run`), alias map (`Boothiill` → `Boothill`), stub policy, `lastChecked` update.
- Detail view: react-bootstrap `Modal` (`size="lg"`), null/empty-safe placeholders.

## Mock database (`src/assets/hsr_character_library_starter.json`)

- Schema 1.1, `lastChecked: 2026-09-23`, enums for elements (7) / paths (9) / ratings (6: SS, S+, S, A, B, C) / roles (3: DPS, support, sustain) / rarity (2) / stats.
- Known issues (still true as-built): live roster has `Black Swan` + `Bronya` (absent here — sync script adds them as stubs); genshin.gg spells `Boothill` as `Boothiill` (alias map); several entries have empty `bestTeams` and mixed `mainStats` shapes (string vs array — the modal tolerates both via `asArray`).

## What works now (verified 2026-09-23, same turn as docs refresh)

- `npm test` → 6 pass, 0 fail (`node --test tests/**/*.test.js`: 5 filter-predicate tests + 1 repository test, ~1s).
- `& .\node_modules\.bin\eslint.cmd .` → exit 0, no output.
- `npm run build` → exit 0, `dist/` emitted (332 modules transformed, ~300 kB JS / ~232 kB CSS).
- Load → grid, result count (`X of 90 characters`), spinner while loading (`Loading characters...`), danger alert on error (`Error while loading characters`), neutral `No characters found` on empty/filter-miss.
- Search: name-substring, case-insensitive, whitespace-trimmed, empty constrains nothing; Enter key submits via `<Form onSubmit>`.
- Filters: OR within group, AND across groups, query ANDs with filters; `Filters (N)` badge; `Clear all` resets.
- Modal: header badges, Light Cones / Relics & Ornaments / Stats / Teams (≤3) / Sources sections; `No data yet` / `No team data yet` placeholders.

## Naming drift (do not "fix" silently)

- Folder: `character-showcase`. Package (`package.json`): still `productsapp` — rename needs an explicit decision.
- UI: "Star Rail Character Library". Data: bundled HSR JSON (no more dummyjson).
- The rework resolved the content drift (folder name finally matches content); only the package name still drifts.

## Open gaps

- `docs/features/product-listing.md`, `search-filter.md`, `refresh-error-recovery.md` still describe the superseded products version (kept intentionally; the current `character-*` / `roster-sync` notes supersede them).
- No pagination, no sorting, no debounce, search covers `name` only.
- `console.dir(err)` on load failure — replace with a logging decision if this grows.
- `overallRating` / builds are editorial and can drift from the live meta; refresh is manual.
- Hotlinked thumbnails can rot or be blocked (mitigation: `onError` placeholder + sync re-scrape); `axios` remains a dependency but is no longer used by the UI.
- `docs/other/` is scratch space (see `docs/other/.gitignore`): never commit its contents, and ignore them in reviews.

## Where to look next

- Behavior details: `docs/features/*.md` (`character-library`, `character-search-filter`, `character-modal`, `roster-sync` are current)
- Decisions: `docs/ADR/*.md` (0001 stack, 0002 client-side filter, 0003 no-test-framework gap, 0004 HSR repository + build-time sync)
