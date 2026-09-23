# HSR Character Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dummyjson product browser with a Honkai: Star Rail character library backed by the bundled JSON, with name search, multi-select filters, a detail modal, and a build-time genshin.gg sync script.

**Architecture:** `Characters.jsx` container owns all state and reads through a `CharacterRepository` interface (`JsonCharacterRepository` today); pure predicate helpers in `characterFilters.js` are covered by `node --test`; presentational `Character`, `CharacterModal`, `FilterPanel`, and retargeted `SearchBar` compose the UI.

**Tech Stack:** React 19, Vite 8, react-bootstrap 2, Node built-in `node:test` + `node:assert/strict` (no new dependencies), builtin `fetch` + regex HTML parsing in the sync script.

## Global Constraints

- PowerShell 5.1: no `&&` chaining (use `; if ($?) { ... }`), no `cd` inside commands (pass `workdir`).
- `& .\node_modules\.bin\eslint.cmd .` must be exit 0; `npm run build` must be exit 0 before any done claim, with full output read.
- Never commit, push, or open PRs unless explicitly asked — tasks end with a completion report, not a commit.
- Search/filter source of truth is `allCharacters`; visible list is derived via `useMemo`. Never filter the visible list into itself.
- CSS: flat top-level `@media` only. Bootstrap utilities over custom CSS. Inputs need `aria-label`, images need `alt`, form buttons need explicit `type`.
- No new dependencies of any kind. Tests use `node --test` only.
- User-facing copy: `Error while loading characters`, `No characters found`, `X of 90 characters`, `No data yet`, `No team data yet`.
- Page title and heading: `Star Rail Character Library` (index.html title + Characters h1).

---

## File structure

| File | Responsibility |
|---|---|
| `src/data/CharacterRepository.js` (create) | `CharacterRepository` base contract + `JsonCharacterRepository` adapter + shared `repository` instance. No UI, no filtering. |
| `src/data/characterFilters.js` (create) | Pure predicates `matchesQuery`, `matchesFilters`, `applyFilters`. No React, no I/O — fully unit-testable. |
| `src/data/hsrAssets.js` (create) | `elementIconUrl(element)`, `rarityStars(rarity)`. Single home for derived asset URLs. |
| `tests/characterRepository.test.js` (create) | Data-layer tests on stub data (never imports the real JSON). |
| `tests/characterFilters.test.js` (create) | Predicate tests: query, per-group OR, cross-group AND, combined, empty. |
| `src/components/Characters.jsx` (rename from `Products.jsx` via `git mv`) | Container: load via repository, own `allCharacters`/`searchText`/`filters`/`selected`/`loading`/`err`, compute visible with `useMemo`, layout sidebar + grid + modal. |
| `src/components/Character.jsx` (rename from `Product.jsx` via `git mv`) | Presentational card: thumbnail, name, element, path, rarity. Emits `onSelect`. |
| `src/components/CharacterModal.jsx` (create) | Bootstrap `Modal size="lg"`: badges, build sections, teams, sources. Tolerates null/empty. |
| `src/components/FilterPanel.jsx` (create) | Collapsible sidebar: toggle with count badge, checkbox groups from enums, `Clear all`. |
| `src/components/SearchBar.jsx` (modify) | Same controlled-input contract; placeholder/aria-label retargeted to characters. |
| `src/App.jsx` (modify) | Render `<Characters />` instead of `<Products />`. |
| `src/App.css` (modify) | Rarity borders, card hover affordance, modal badge spacing. |
| `index.html` (modify) | Title `Star Rail Character Library`. |
| `package.json` (modify) | Add `"test": "node --test tests/"` and `"sync:hsr": "node scripts/sync-hsr.mjs"`. No dependency changes. |
| `scripts/sync-hsr.mjs` (create) | Build-time roster diff with `--dry-run`; appends stubs, updates `lastChecked`. |
| Docs (modify in final task) | `README.md`, `ARCHITECTURE.md`, `CONTEXT.md`, `docs/features/character-*.md`, one ADR for repository + sync choices. |

---

### Task 1: Data layer (`CharacterRepository`)

**Files:**
- Create: `src/data/CharacterRepository.js`
- Modify: `package.json` (add `"test": "node --test tests/"` to `scripts`)
- Test: `tests/characterRepository.test.js`

**Interfaces:**
- Consumes: `src/assets/hsr_character_library_starter.json` (default Vite JSON import, shape `{ characters: [...] }`)
- Produces: `class CharacterRepository { async getAll() }`, `class JsonCharacterRepository extends CharacterRepository { constructor(data) }`, `const repository = new JsonCharacterRepository(db)` — consumed by Task 3 via `import { repository } from '../data/CharacterRepository'`

- [ ] **Step 1: Write the failing test**

```js
// tests/characterRepository.test.js
const test = require('node:test');
const assert = require('node:assert/strict');

const { JsonCharacterRepository } = require('../src/data/CharacterRepository.js');

test('returns the bundled characters array', async () => {
  const stub = { characters: [{ name: 'Acheron' }] };
  const repo = new JsonCharacterRepository(stub);
  assert.deepEqual(await repo.getAll(), [{ name: 'Acheron' }]);
});
```

(Repo uses ESM `import` in app code; tests use `require` against a CJS-compatible module — so write `CharacterRepository.js` with ESM syntax Vite understands AND keep logic import-free; if `require` of ESM fails, write the test with dynamic `import()` instead. Decide at run time, keep whichever passes.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with "Cannot find module" (file does not exist yet)

- [ ] **Step 3: Write minimal implementation**

```js
// src/data/CharacterRepository.js
import db from '../assets/hsr_character_library_starter.json';

export class CharacterRepository {
  async getAll() {
    throw new Error('Not implemented');
  }
}

export class JsonCharacterRepository extends CharacterRepository {
  constructor(data) {
    super();
    this.data = data;
  }

  async getAll() {
    return this.data.characters;
  }
}

export const repository = new JsonCharacterRepository(db);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS, 1 test

- [ ] **Step 5: Report complete (do NOT commit — repo rule)**

---

### Task 2: Filter predicates + tests

**Files:**
- Create: `src/data/characterFilters.js`
- Test: `tests/characterFilters.test.js`

**Interfaces:**
- Consumes: character objects (`{ name, element, path, rarity, overallRating, role }`), `filters` shape `{ paths: [], elements: [], rarities: [], ratings: [], roles: [] }` (every key always present, arrays of selected values)
- Produces: `matchesQuery(character, query)`, `matchesFilters(character, filters)`, `applyFilters(characters, query, filters)` — consumed by Task 3

- [ ] **Step 1: Write the failing tests**

```js
// tests/characterFilters.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { matchesQuery, matchesFilters, applyFilters } = require('../src/data/characterFilters.js');

const acheron = { name: 'Acheron', element: 'lightning', path: 'nihility', rarity: '5-star', overallRating: 'S+', role: 'DPS' };
const bailu = { name: 'Bailu', element: 'lightning', path: 'abundance', rarity: '4-star', overallRating: 'A', role: 'sustain' };
const emptyFilters = { paths: [], elements: [], rarities: [], ratings: [], roles: [] };

test('query matches name substring, case-insensitive, trimmed', () => {
  assert.equal(matchesQuery(acheron, '  ACH '), true);
  assert.equal(matchesQuery(bailu, 'ach'), false);
});

test('empty query matches everything', () => {
  assert.equal(matchesQuery(acheron, ''), true);
  assert.equal(matchesQuery(acheron, '   '), true);
});

test('selections within one group combine with OR', () => {
  assert.equal(matchesFilters(acheron, { ...emptyFilters, paths: ['nihility', 'abundance'] }), true);
  assert.equal(matchesFilters(bailu, { ...emptyFilters, paths: ['nihility', 'abundance'] }), true);
  assert.equal(matchesFilters(acheron, { ...emptyFilters, paths: ['abundance'] }), false);
});

test('selections across groups combine with AND', () => {
  const f = { ...emptyFilters, elements: ['lightning'], roles: ['sustain'] };
  assert.equal(matchesFilters(bailu, f), true);
  assert.equal(matchesFilters(acheron, f), false);
});

test('applyFilters combines query AND filters', () => {
  const list = [acheron, bailu];
  assert.deepEqual(applyFilters(list, '', emptyFilters), list);
  assert.deepEqual(applyFilters(list, 'a', { ...emptyFilters, roles: ['sustain'] }), [bailu]);
  assert.deepEqual(applyFilters(list, 'zzz', emptyFilters), []);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL with "Cannot find module" (Task 1 test still passes alongside)

- [ ] **Step 3: Write minimal implementation**

```js
// src/data/characterFilters.js
function matchesQuery(character, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return character.name.toLowerCase().includes(q);
}

const GROUP_KEYS = [
  ['paths', 'path'],
  ['elements', 'element'],
  ['rarities', 'rarity'],
  ['ratings', 'overallRating'],
  ['roles', 'role'],
];

function matchesFilters(character, filters) {
  return GROUP_KEYS.every(([group, field]) => {
    const selected = filters[group];
    if (!selected || selected.length === 0) return true;
    return selected.includes(character[field]);
  });
}

function applyFilters(characters, query, filters) {
  return characters.filter((c) => matchesQuery(c, query) && matchesFilters(c, filters));
}

module.exports = { matchesQuery, matchesFilters, applyFilters };
```

(Note: this module uses `module.exports` so `node --test` can `require` it without ESM friction; it has no imports, so Vite bundles it fine for Task 3.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, all tests (Task 1 + Task 2)

- [ ] **Step 5: Report complete (do NOT commit — repo rule)**

---

### Task 3: `Characters.jsx` container (rename + rewire)

**Files:**
- Rename: `src/components/Products.jsx` → `src/components/Characters.jsx` (via `git mv`)
- Test: manual — `npm run dev`, `npm run build`; existing `node --test` suite stays green

**Interfaces:**
- Consumes: `repository` (Task 1), `applyFilters` (Task 2), `SearchBar`, `FilterPanel` (Task 6), `Character` (Task 4), `CharacterModal` (Task 5), `db.enums` for filter options (import the JSON directly for enums only)
- Produces: default-exported `Characters` component rendered by `App.jsx` (Task 7)

- [ ] **Step 1: Rename the file**

Run: `git mv src/components/Products.jsx src/components/Characters.jsx`

- [ ] **Step 2: Rewrite the container**

Required state: `allCharacters` (source of truth, set only on load), `searchText`, `filters` (exact shape from Task 2, all keys present), `selected` (character object or `null`), `loading`, `err`. Load once on mount:

```jsx
useEffect(() => {
  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      setAllCharacters(await repository.getAll());
    } catch (e) {
      console.dir(e);
      setErr('Error while loading characters');
      setAllCharacters([]);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);
```

Derive the visible list (never filter state into itself):

```jsx
const visible = useMemo(
  () => applyFilters(allCharacters, searchText, filters),
  [allCharacters, searchText, filters]
);
```

Layout: `Container fluid` → header (`h1` `Star Rail Character Library`, result count `visible.length of allCharacters.length characters`) → `Row`: `Col md={3}` with `<FilterPanel filters={filters} onChange={setFilters} enums={db.enums} />`, `Col md={9}` with `<SearchBar ... />`, states, and grid `Row className="g-4"` mapping `visible` to `Col sm={12} md={6} lg={4}` with `<Character character={c} onSelect={setSelected} />`. Modal: `<CharacterModal character={selected} onClose={() => setSelected(null)} />`. Keep the loading spinner, `err` danger `Alert`, and empty-state `Alert` (`No characters found`) with the same gates as before (`!loading && !err`).

- [ ] **Step 3: Verify**

Run: `npm test` (must stay green) and `npm run build` (must be exit 0; grid will render once Tasks 4–7 land — until then a build-only check is enough)
Expected: tests PASS, build exit 0

- [ ] **Step 4: Report complete (do NOT commit — repo rule)**

---

### Task 4: `Character.jsx` card + asset helpers

**Files:**
- Rename: `src/components/Product.jsx` → `src/components/Character.jsx` (via `git mv`)
- Create: `src/data/hsrAssets.js`
- Test: manual in dev server (visual) + `npm run build`

**Interfaces:**
- Consumes: `character` object, `onSelect(character)` callback; `elementIconUrl`, `rarityStars` from `../data/hsrAssets`
- Produces: default-exported `Character` card consumed by Task 3

- [ ] **Step 1: Create the asset helpers**

```js
// src/data/hsrAssets.js
export function elementIconUrl(element) {
  return `https://sunderarmor.com/STARRAIL/Elements/${element}_sm.png`;
}

export function rarityStars(rarity) {
  return rarity === '4-star' ? '★★★★' : '★★★★★';
}
```

- [ ] **Step 2: Rename and rewrite the card**

Run: `git mv src/components/Product.jsx src/components/Character.jsx`

Card requirements: `Card` with `role="button"`, `tabIndex={0}`, `onClick={() => onSelect(character)}`, `onKeyDown` firing `onSelect` on Enter/Space; `Card.Img` with `src={character.image}`, `alt={character.name}`, `loading="lazy"`, `onError` swapping to a placeholder `div` showing the first letter of the name; body with `Card.Title` (name), element icon `img` (`src={elementIconUrl(character.element)}`, `alt={character.element}`) + element label, path label, rarity line (`rarityStars` + `character.rarity` text); card border class `rarity-5` for `5-star`, `rarity-4` for `4-star` (styled in Task 7).

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 4: Report complete (do NOT commit — repo rule)**

---

### Task 5: `CharacterModal.jsx` detail modal

**Files:**
- Create: `src/components/CharacterModal.jsx`
- Test: manual in dev server (open/close, empty-field rendering) + `npm run build`

**Interfaces:**
- Consumes: `character` (object or `null`), `onClose()`; `elementIconUrl`, `rarityStars` from `../data/hsrAssets`
- Produces: default-exported `CharacterModal` consumed by Task 3

- [ ] **Step 1: Write the modal**

Requirements: `Modal show={character !== null} onHide={onClose} size="lg"`; `Modal.Header closeButton` with thumbnail + name + badges (`element`, `path`, `rarity` stars, `role`, tier `overallRating`); `Modal.Body` sections — Light Cones (`bestLightCones` list), Relics & Ornaments (`bestRelics`, `bestOrnaments`), Stats (body/feet/sphere/rope via local `asArray` normalizer because values may be string or array, plus `subStats`), Teams (up to 3 entries of `bestTeams`, skipping empty arrays; all-empty renders `No team data yet`); footer lists `sources` as links. Any null/empty value renders muted `No data yet`.

```jsx
const asArray = (v) => {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: exit 0; open a card in dev, confirm sections render and empty teams show the placeholder

- [ ] **Step 3: Report complete (do NOT commit — repo rule)**

---

### Task 6: `FilterPanel.jsx` collapsible filters

**Files:**
- Create: `src/components/FilterPanel.jsx`
- Test: manual in dev server (toggle, multi-select, clear) + `npm run build`

**Interfaces:**
- Consumes: `filters` (Task 2 shape), `onChange(nextFilters)`, `enums` (`{ paths, elements, rarities, ratings, roles }` from the JSON)
- Produces: default-exported `FilterPanel` consumed by Task 3

- [ ] **Step 1: Write the panel**

Requirements: internal `open` state (default `false`); toggle `Button` labeled `Filters` with count badge = total selected values and `aria-expanded={open}`; when open, one `Form.Group` per enum key with a `Form.Check` checkbox per value (label = value, `checked` = included, `onChange` toggling that value into/out of a copied array — never mutate `filters` in place); `Clear all` button resetting every key to `[]` (build the reset object from the same key list, not hardcoded values).

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: exit 0; in dev, selecting element ice + path nihility narrows the grid, badge counts selections, `Clear all` restores the full list

- [ ] **Step 3: Report complete (do NOT commit — repo rule)**

---

### Task 7: Shell — SearchBar, App, styles, title

**Files:**
- Modify: `src/components/SearchBar.jsx` (placeholder + aria-label only)
- Modify: `src/App.jsx` (`Products` → `Characters`)
- Modify: `src/App.css` (append rarity/hover/modal styles)
- Modify: `index.html` (title only)
- Test: full UI pass in dev + `npm run build`

**Interfaces:**
- Consumes: `Characters` (Task 3)
- Produces: working app shell

- [ ] **Step 1: Retarget SearchBar**

Change `placeholder="Search products..."` → `placeholder="Search characters..."` and `aria-label="Search products"` → `aria-label="Search characters"`. Nothing else.

- [ ] **Step 2: Rewire App and title**

`src/App.jsx`: `import Characters from './components/Characters';` rendering `<Characters />`. `index.html`: title → `Star Rail Character Library`.

- [ ] **Step 3: Append styles to `src/App.css`**

```css
.character-card {
  cursor: pointer;
}
.character-card:hover {
  transform: translateY(-2px);
}
.character-card.rarity-5 {
  border-color: #d4af37;
}
.character-card.rarity-4 {
  border-color: #9b7ede;
}
.character-placeholder {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: var(--code-bg);
}
.modal-badge {
  margin-right: 6px;
}
```

(Flat rules only; reuse the existing `.product-image` rule by adding `character-image` to its selector or renaming usages — pick one and keep both files consistent.)

- [ ] **Step 4: Verify**

Run: `npm test` then `npm run build`
Expected: tests PASS, build exit 0; dev shows sidebar + grid + working search/filter/modal

- [ ] **Step 5: Report complete (do NOT commit — repo rule)**

---

### Task 8: Sync script (`scripts/sync-hsr.mjs`)

**Files:**
- Create: `scripts/sync-hsr.mjs`
- Modify: `package.json` (add `"sync:hsr": "node scripts/sync-hsr.mjs"`)
- Test: `node scripts/sync-hsr.mjs --dry-run` (must report `Black Swan`, `Bronya` as missing without writing)

**Interfaces:**
- Consumes: live HTML of `https://genshin.gg/star-rail/`, the JSON file on disk
- Produces: updated JSON (new stubs appended, `lastChecked` refreshed) on real runs; console report always

- [ ] **Step 1: Write the script**

Requirements: builtin `fetch` the hub page; regex-parse roster anchors (`/star-rail/characters/<slug>/`), each entry's thumbnail `src`, name from `alt`/heading, element from the `Elements/<name>_sm.png` icon URL, rarity from page section (entries before the 4-star group are 5-star — detect the boundary by the first entry whose thumb URL matches a known 4-star id, or by section markup; document the chosen heuristic in a comment). Alias map `const ALIASES = { Boothiill: 'Boothill' };` applied before diffing; unknown names are reported, never silently dropped. New stubs use exactly this shape:

```js
{
  name, image: thumbUrl, element, path: null, rarity,
  overallRating: null, role: null,
  bestLightCones: [], bestRelics: [], bestOrnaments: [],
  mainStats: { body: null, feet: null, sphere: null, rope: null },
  subStats: [], bestTeams: [], sources: [pageUrl],
}
```

`--dry-run` prints `ADD <name>` lines and exits without writing; real run appends stubs, sets `lastChecked` to today (`YYYY-MM-DD`), and prints `Added N, kept M`. Never overwrites existing entries.

- [ ] **Step 2: Verify dry run**

Run: `node scripts/sync-hsr.mjs --dry-run`
Expected: output lists `Black Swan` and `Bronya` as to-add; JSON file byte-identical (`git diff --stat` shows nothing)

- [ ] **Step 3: Report complete (do NOT commit — repo rule)**

---

### Task 9: Docs refresh

**Files:**
- Modify: `README.md`, `ARCHITECTURE.md`, `CONTEXT.md`
- Create: `docs/features/character-library.md`, `docs/features/character-search-filter.md`, `docs/features/character-modal.md`, `docs/features/roster-sync.md`, `docs/ADR/0004-hsr-repository-and-sync.md`

**Interfaces:**
- Consumes: the as-built code from Tasks 1–8, the spec at `docs/superpowers/specs/2026-09-23-hsr-showcase-design.md`
- Produces: documentation matching the new behavior

- [ ] **Step 1: Rewrite README/ARCHITECTURE/CONTEXT**

`README.md`: HSR overview, `npm test` + `npm run sync:hsr` commands, structure with new files, repository seam explanation. `ARCHITECTURE.md`: replace product data flow with repository → `useMemo` filtering → card/modal; state table (`allCharacters`, `searchText`, `filters`, `selected`, `loading`, `err`). `CONTEXT.md`: mark rework implemented,-verified with fresh `eslint`/`build`/`npm test` outputs.

- [ ] **Step 2: Write features + ADR**

One `docs/features/` note per behavior (library grid, search+filter semantics with the OR/AND rule, modal sections, sync script usage). ADR-0004 records repository-over-direct-import and build-time-over-runtime-sync with the CORS rationale.

- [ ] **Step 3: Verify**

Run: `& .\node_modules\.bin\eslint.cmd .` (exit 0), `npm test` (all PASS), `npm run build` (exit 0) — full outputs read
Expected: all green; docs contain no TBD/TODO

- [ ] **Step 4: Report complete (do NOT commit — repo rule)**

---

## Final verification (end of Task 9)

All three commands green in the same turn before any done claim: `npm test`, `& .\node_modules\.bin\eslint.cmd .`, `npm run build`.
