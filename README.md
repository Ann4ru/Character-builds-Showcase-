# Star Rail Character Library (character-showcase)

A small React + Vite browser for Honkai: Star Rail characters. Renders the 90-character bundled roster in `src/assets/hsr_character_library_starter.json` as Bootstrap cards with name search, multi-select filters, a detail modal, loading and error states, plus a build-time roster sync script.

> Note: the repo folder is `character-showcase` and `package.json` still names the package `productsapp`. The UI title is "Star Rail Character Library". See `CONTEXT.md` for this naming drift.

## Stack

- React 19 + React DOM (`src/main.jsx`, `src/App.jsx`)
- Vite 8 (dev server + production build)
- React-Bootstrap 2 + Bootstrap 5 (layout, cards, alerts, modal)
- ESLint 9 (flat config, react-hooks + react-refresh)
- Tests: `node --test` over pure helpers (`tests/`), no test framework dependency

## Getting started

```bash
npm install
npm run dev      # local dev server (see Vite output for port)
npm test         # node --test suite (filter predicate + repository)
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
npm run lint     # eslint .
```

No environment variables. No backend. No runtime network dependency — the roster is bundled JSON.

## Roster sync

```bash
npm run sync:hsr            # diff live roster, append missing stubs, update lastChecked
npm run sync:hsr -- --dry-run   # print ADD <name> lines without writing
```

Build-time only, never run by the app. Fetches the genshin.gg Star Rail hub page, normalizes names through an alias map (`Boothiill` → `Boothill`), and appends missing characters as stubs (thumbnail/element/rarity filled, build fields null/empty, `sources` set to the character page). Existing entries are never overwritten. See `docs/features/roster-sync.md`.

## Project structure

```
index.html                  # title: "Star Rail Character Library", mounts #root
vite.config.js              # @vitejs/plugin-react
eslint.config.js            # flat config, ignores dist/
scripts/
  sync-hsr.mjs              # build-time roster sync (npm run sync:hsr)
src/
  main.jsx                  # StrictMode root render
  App.jsx                   # renders <Characters />
  App.css                   # character-card styles (rarity borders, hover, modal badges)
  index.css                 # theme tokens, layout (#root max-width 1126px)
  assets/
    hsr_character_library_starter.json   # bundled mock DB: schema 1.1, 90 characters
  components/
    Characters.jsx          # container: load, search/filter/modal state, loading/error/empty UI
    Character.jsx           # single Bootstrap card (thumbnail, name, element, path, rarity)
    CharacterModal.jsx      # detail modal (build, teams, sources)
    FilterPanel.jsx         # collapsible checkbox sidebar
    SearchBar.jsx           # controlled input + submit; Enter key supported
  data/
    CharacterRepository.js  # repository seam: CharacterRepository base + JsonCharacterRepository
    characterFilters.js     # pure search/filter predicate (matchesQuery/matchesFilters/applyFilters)
    hsrAssets.js            # elementIconUrl + rarityStars helpers
tests/
  characterFilters.test.js  # predicate semantics (OR/AND, trim, case, empty)
  characterRepository.test.js  # JSON adapter returns bundled array
public/
  favicon.svg
  icons.svg
```

## How it works

1. `Characters.jsx` mounts -> `repository.getAll()` sets `loading=true`, clears `err`, loads the bundled characters into `allCharacters` (search/filter source of truth).
2. On failure, `err = 'Error while loading characters'`, the list is cleared, and a danger `Alert` is shown.
3. The visible list is derived with `useMemo` from `[allCharacters, searchText, filters]` via `applyFilters` — state is never filtered into itself.
4. Search: `query = searchText.trim().toLowerCase()`, substring match on `name`. Empty query constrains nothing.
5. Filters: within one group selections combine with OR; across groups with AND; the search query ANDs with all filters. An empty group constrains nothing.
6. UI states: spinner while `loading` (`Loading characters...`), danger alert on `err`, `No characters found` alert when not loading, no error, and zero matches. Result count above the grid (`X of 90 characters`). Clicking a card opens the detail modal.
7. Repository seam: components depend only on `CharacterRepository.getAll()`. `JsonCharacterRepository` serves the bundled JSON today; a real-DB adapter (e.g. `ApiCharacterRepository`) can replace it later without touching components.

## Known limitations

- Hotlinked thumbnails (`sunderarmor.com`) can rot or be blocked; cards fall back to a placeholder block with the character initial via `onError`.
- `overallRating` / builds are manual editorial values and can drift from the live meta; the sync script never overwrites them.
- Live roster names absent here (`Black Swan`, `Bronya`) arrive as stubs via sync; name mismatches (`Boothiill`) are handled by the alias map.
- Several entries have empty `bestTeams` and mixed `mainStats` shapes (string vs array) — the modal tolerates both with `No data yet` / `No team data yet` placeholders.
- Client-side name-only search; no debounce, no pagination, no sorting.
- `console.dir(err)` on load failure (dev aid, leaks nothing sensitive but noisy).

## Docs map

- `ARCHITECTURE.md` — component responsibilities and data flow
- `CONTEXT.md` — current state, recent work, open gaps
- `AGENTS.md` — working agreements for humans and AI agents
- `docs/ADR/` — architecture decision records
- `docs/features/` — per-feature behavior notes (`character-*` and `roster-sync` are current; `product-*`, `search-filter`, `refresh-error-recovery` describe the superseded products version)
