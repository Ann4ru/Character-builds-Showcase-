# HSR Character Showcase — Implementation Design

Date: 2026-09-23. Status: draft, awaiting user review. No code touched (data-only enrichment of the JSON in the same pass, per user approval).

**Goal:** Rework the products demo into a Honkai: Star Rail character browser backed by `src/assets/hsr_character_library_starter.json` (schema 1.1, 90 characters), with name search, multi-select advanced filters, a rich detail modal, a build-time genshin.gg sync script, and a repository seam for a future real database.

**Context.** The JSON now carries `rarity` (`5-star` | `4-star`; 67/23 split), hotlinked thumbnails (`sunderarmor.com/STARRAIL/Characters/Thumb/<id>.png`, scraped 2026-09-23 from the live roster page), and editorial `overallRating`/`role` values from 2026-09-22 research. The live roster holds two names absent here (`Black Swan`, `Bronya`) and spells `Boothill` as `Boothiill`. Current UI (`Products`/`Product`/`SearchBar` against dummyjson) is replaced, not extended.

## Approaches considered

1. **Mock JSON imported directly into components (simplest).** Rejected: no seam for a real database; every future data-source change touches UI code.
2. **Repository interface + JSON adapter (chosen).** Components depend only on `CharacterRepository.getAll()`; `JsonCharacterRepository` serves the bundled file today, `ApiCharacterRepository` can replace it later without touching components. Costs one small abstraction layer.
3. **Runtime first-load sync from genshin.gg.** Rejected: browsers cannot scrape genshin.gg (CORS, JS-rendered pages); it would need a proxy and adds load-time failure modes. A build-time script gets the same freshness with none of the runtime cost.

## Architecture

```
App (composition only)
 └─ Characters (container: data + search/filter/modal state)
     ├─ SearchBar (controlled input, unchanged contract)
     ├─ FilterPanel (collapsible left sidebar, checkbox groups)
     ├─ Character[] (card: thumbnail, name, element, path, rarity)
     └─ CharacterModal (Bootstrap Modal, rich build info)
Data: CharacterRepository ← JsonCharacterRepository (bundled JSON)
Tooling: scripts/sync-hsr.mjs (npm run sync:hsr, manual)
```

Components follow the existing single-purpose pattern: `Characters.jsx` owns all state and filtering; `Character.jsx` is presentational; `SearchBar.jsx` keeps its controlled-input contract (placeholder/aria-label retargeted to characters).

## Data layer

- `src/data/CharacterRepository.js` exports a `CharacterRepository` base (documents the `getAll()` contract returning a promise of character arrays) and `JsonCharacterRepository`, which imports the JSON and returns `data.characters`. Loading/error/empty UI states are preserved as-is so a future remote adapter inherits the same gates.
- Character shape is the JSON entry verbatim (`name`, `image`, `element`, `path`, `rarity`, `overallRating`, `role`, `bestLightCones`, `bestRelics`, `bestOrnaments`, `mainStats`, `subStats`, `bestTeams`, `sources`). Filter option lists derive from `data.enums` (`paths`, `elements`, `rarities`, `ratings`, `roles`), so enum changes never require UI edits.
- Element icons are not stored per character: `https://sunderarmor.com/STARRAIL/Elements/<element>_sm.png` is derived from the `element` value by a helper (pattern confirmed on the live roster page).

## Search + filter semantics

- Source of truth `allCharacters` (never filtered into itself); visible list computed with `useMemo` from `[query, filters]`.
- Search: `query = searchText.trim().toLowerCase()`, substring match on `name`. Empty query constrains nothing.
- Filters: within one group selections combine with OR (element ice OR wind); across groups with AND; the search query ANDs with all filters. An empty group constrains nothing.
- Panel: collapsed by default behind a `Filters` toggle button (visible count badge, e.g. `Filters (3)`); expands as a left sidebar (`Col md=3`, grid `md=9`); `Clear all` resets groups; result count shown above the grid (`X of 90 characters`); zero matches reuse the existing `No characters found` empty state.

## Card + modal

- Card (`Character.jsx`): lazy thumbnail (`alt=name`, `onError` fallback to a placeholder block with the character initial), name, element icon + label, path label, rarity as `★★★★★` / `★★★★` with a gold/purple accent border per rarity. Whole card clickable (`onSelect`), keyboard-accessible (`role=button`, `tabIndex`, Enter/Space).
- Modal (`CharacterModal.jsx`, react-bootstrap `Modal`, `size="lg"`): header with thumbnail, name, and badges (element, path, rarity, role, tier); Build section (light cones list, relics, ornaments, body/feet/sphere/rope main stats, sub stats); Teams section (up to 3, empty arrays skipped with a `No team data yet` note); footer with `sources` links. Any null/empty field renders a muted `No data yet` placeholder instead of breaking layout.

## Sync script (`scripts/sync-hsr.mjs`, `npm run sync:hsr`)

Manual build-time script, never run by the app:
1. Fetch `https://genshin.gg/star-rail/` HTML; parse roster entries (name, page slug, thumb URL, element from icon alt, rarity from 5-star/4-star page section).
2. Normalize names through an alias map (`Boothiill` → `Boothill`) and diff against JSON names.
3. Append missing characters as stubs: `image` filled from thumb URL, `element`/`rarity` from the page, `path`/`overallRating`/`role`/`bestLightCones`/`bestRelics`/`bestOrnaments`/`mainStats`/`subStats`/`bestTeams` set to null/empty, `sources` set to the character page URL.
4. Update `lastChecked` (keep `schemaVersion` unless the shape changes) and print an added/kept report. Ratings and builds stay manual editorial work — the script never overwrites existing values.

## File map

- Rename `src/components/Products.jsx` → `src/components/Characters.jsx` (container).
- Rename `src/components/Product.jsx` → `src/components/Character.jsx` (card).
- Keep + retarget `src/components/SearchBar.jsx`.
- Create `src/components/CharacterModal.jsx`, `src/components/FilterPanel.jsx`, `src/data/CharacterRepository.js`, `scripts/sync-hsr.mjs`.
- Data: `src/assets/hsr_character_library_starter.json` (committed as the mock database).
- Styles: extend `src/App.css` (rarity borders, card hover, modal badges); `src/index.css` tokens unchanged. Flat top-level `@media` only.
- Docs during implementation: rewrite `README.md`/`ARCHITECTURE.md`, add `docs/features/character-*.md`, add ADR (repository choice, build-time sync), refresh `CONTEXT.md`.

## Error handling, a11y, testing

- Image `onError` fallback; modal focus trap comes free with Bootstrap Modal; filter checkboxes are real inputs with labels; toggle button carries `aria-expanded`.
- No test framework exists (ADR-0003). Implementation adds a `node --test` suite for the pure filter/search predicate (no new dependencies); component behavior stays manually verified via `eslint` + `npm run build`.

## Risks

- Hotlinked thumbnails can rot or be blocked (accepted per user choice; mitigation: `onError` fallback + sync script re-scrape).
- Editorial `overallRating` drifts from the live meta (documented as editorial; refresh is manual).
- Name mismatches between sources (`Boothiill`, future collab renames) handled by the alias map, which must be extended when the script reports unknown names.
- Several entries have empty `bestTeams` and inconsistent `mainStats` shapes (string vs array); the modal and any future evolution of the schema must tolerate both.

## Out of scope

Pagination, sorting, debounced live search, team-builder features, light-cone/relic databases, authentication, any backend, committing `docs/other/` scratch notes.
