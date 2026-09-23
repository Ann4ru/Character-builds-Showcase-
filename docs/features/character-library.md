# Character library

Supersedes `product-listing.md` (products version, kept for history).

## Trigger

App mount (`Characters.jsx` `useEffect([])` loads via `repository.getAll()`).

## Rules

- `JsonCharacterRepository.getAll()` returns `data.characters` from the bundled `src/assets/hsr_character_library_starter.json` (schema 1.1, 90 characters). Components depend only on the `CharacterRepository.getAll()` contract, so a future real-DB adapter replaces the JSON without touching UI code.
- Header: `Star Rail Character Library` + result count (`X of 90 characters`, i.e. `` `${visible.length} of ${allCharacters.length} characters` ``).
- Grid: `Row.g-4`, cards at `Col sm=12 md=6 lg=4`, keyed by `character.name`. Sidebar layout: `Col md=3` filter panel + `Col md=9` search + grid.
- Card (`Character.jsx`): thumbnail (`alt=name`, `loading="lazy"`, `onError` fallback to a placeholder block with the character initial), name, element icon + label (icon derived via `elementIconUrl`), `path` label, rarity as `★★★★★` / `★★★★` plus label, gold (`rarity-5`) / purple (`rarity-4`) accent border. Whole card clickable (`onSelect`), keyboard-accessible (`role="button"`, `tabIndex={0}`, Enter/Space).
- Source of truth is `allCharacters`; the visible list is derived with `useMemo` from `[allCharacters, searchText, filters]`, never filtered into itself.

## UI states

| State | Condition | UI |
|---|---|---|
| Loading | `loading === true` | Spinner + "Loading characters..." |
| Error | `err !== ''` | Danger `Alert`: `Error while loading characters`; grid hidden |
| Empty | `!loading && !err && visible.length === 0` | Neutral `Alert`: `No characters found` |
| Ready | `!loading && !err && visible.length > 0` | Result count + card grid |

Source: `src/components/Characters.jsx`, `src/components/Character.jsx`, `src/data/CharacterRepository.js`.
