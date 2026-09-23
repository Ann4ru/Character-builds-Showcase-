# ARCHITECTURE.md — character-showcase design

## Goal

Single-page Honkai: Star Rail character browser: load the bundled 90-character roster once, display as a responsive card grid, filter by name substring plus multi-select facets, show build details in a modal, and keep a repository seam so a future real database replaces the JSON without touching components.

## Components

```
App (src/App.jsx)
 └─ Characters (src/components/Characters.jsx) — container
     ├─ SearchBar (src/components/SearchBar.jsx) — controlled input
     ├─ FilterPanel (src/components/FilterPanel.jsx) — collapsible checkbox sidebar
     ├─ Character[] (src/components/Character.jsx) — presentational card
     └─ CharacterModal (src/components/CharacterModal.jsx) — detail modal
Data: CharacterRepository (src/data/CharacterRepository.js) ← JsonCharacterRepository (bundled JSON)
Pure logic: characterFilters.js (matchesQuery/matchesFilters/applyFilters), hsrAssets.js (elementIconUrl/rarityStars)
Tooling: scripts/sync-hsr.mjs (npm run sync:hsr, manual build-time sync)
```

| Component | Responsibility | Must not |
|---|---|---|
| `Characters` | Loads via `repository.getAll()`; owns `allCharacters`, `searchText`, `filters`, `selected`, `loading`, `err`; derives `visible` with `useMemo`; renders loading/error/empty gates, result count, grid, modal | Render card/modal internals, own input DOM, filter state into itself |
| `SearchBar` | Controlled `Form.Control` (`value`/`onChange`), `<Form onSubmit>` → `onSearch()` | Filter, fetch, hold character data |
| `FilterPanel` | Collapsible sidebar; checkbox group per enum key; `Filters (N)` count badge; `Clear all` reset | Filter, fetch; hardcode option lists (derives them from `enums`) |
| `Character` | Render `Card` from `character` prop (thumbnail, name, element icon+label, path, rarity stars); clickable + keyboard-accessible (`role=button`, `tabIndex`, Enter/Space); image `onError` fallback | Fetch, filter, manage state |
| `CharacterModal` | Render Bootstrap `Modal size="lg"` from `character` prop (header badges, build, teams, sources); null/empty-safe placeholders | Fetch, filter, manage selection state |

`App.jsx` and `main.jsx` are composition/bootstrap only.

## State and data flow

State in `Characters.jsx`:

- `allCharacters` — immutable-until-reload source of truth.
- `searchText` (string), `filters` (`{ paths, elements, rarities, ratings, roles }` arrays).
- `selected` (character or null) — drives the modal.
- `loading` (bool), `err` (string).

Flow:

1. Mount → `useEffect([])` → `repository.getAll()` → `setAllCharacters`. On throw: `console.dir(err)`, `err='Error while loading characters'`, clear the list.
2. `visible = useMemo(() => applyFilters(allCharacters, searchText, filters), [allCharacters, searchText, filters])` — derived, never stored.
3. Render gates: spinner + `Loading characters...` if `loading`; danger `Alert` if `err`; neutral `Alert` `No characters found` if `!loading && !err && visible.length === 0`; grid only if `!loading && !err`.
4. Selection: card `onSelect` → `setSelected(character)`; modal `onClose` → `setSelected(null)`.
5. Filter option lists derive from the JSON `enums` (`paths`, `elements`, `rarities`, `ratings`, `roles`), so enum changes never require UI edits. Element icons derive from the `element` value (`https://sunderarmor.com/STARRAIL/Elements/<element>_sm.png`).

Invariant: search/filter always reads `allCharacters`, never the visible list.

## Filter semantics

| Rule | Meaning |
|---|---|
| Query | `query = searchText.trim().toLowerCase()`; substring match on `name`, case-insensitive. Empty query constrains nothing. |
| Within one group | OR — e.g. element ice OR wind. Empty group constrains nothing. |
| Across groups | AND — element AND path AND rarity AND tier AND role. |
| Query × filters | AND — a character must satisfy the query and every active group. |
| Reset | `Clear all` empties every group; clearing the search box removes the query constraint. |

Group-to-field mapping: `paths→path`, `elements→element`, `rarities→rarity`, `ratings→overallRating`, `roles→role`.

## Rendering and style

- Layout: `Container fluid py-4`, header `text-center` (`Star Rail Character Library` + `X of 90 characters` count), `Row` with sidebar `Col md=3` + content `Col md=9`.
- Filter toggle: `Filters` button with `aria-expanded` and a count `Badge` when selections exist; expands to checkbox groups (`Path`, `Element`, `Rarity`, `Tier`, `Role`) plus `Clear all`.
- Search row: `Form > Row.mb-4.g-2`, `Col xs=12 md=9` input + `Col xs=12 md=3` submit button (`type="submit"`, `w-100`).
- Cards: `Card.h-100.character-card.shadow-sm` with `rarity-5` (gold `#d4af37`) / `rarity-4` (purple `#9b7ede`) border, `Card.Img.character-image` (`height: 280px; object-fit: cover; loading="lazy"`), hover lift, rarity as `★★★★★` / `★★★★`.
- Modal: `size="lg"`; header with 64px thumbnail, name, badges (element with icon, path, rarity stars, role, tier); body sections Light Cones / Relics & Ornaments / Stats (Body/Feet/Sphere/Rope + Sub Stats) / Teams (up to 3); footer with `sources` links. Null/empty fields render muted `No data yet` (`No team data yet` for teams).
- Theme: CSS variables in `src/index.css` (`--text`, `--bg`, `--accent`, dark-mode via `prefers-color-scheme`), `#root` centered max-width 1126px. All `@media` queries are top-level (no CSS nesting).

## External contract

- Data source: bundled `src/assets/hsr_character_library_starter.json` (schema 1.1, 90 characters, `lastChecked`) via `JsonCharacterRepository.getAll()` → `data.characters`. No pagination, no auth, no runtime network.
- Sync input (build-time only): `https://genshin.gg/star-rail/` HTML. Grid keys on `character.name`.

## Failure modes

| Condition | UI |
|---|---|
| Load in flight | Spinner + "Loading characters..." |
| Load throws | Danger alert `Error while loading characters`, grid hidden |
| Load returns empty / query+filters match nothing | Neutral alert `No characters found` |
| Whitespace-only query | Treated as empty → constrains nothing |
| Thumbnail 404 | Placeholder block with the character initial (no broken-image icon) |
| Null/empty build field in modal | Muted `No data yet` (`No team data yet` for teams) |
