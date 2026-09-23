# Filter Drawer + Dark Pink Cartoon Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the showcase with a left overlay filter drawer, forced dark pink cartoon theme, and element/path icons in cards, modal, and filters.

**Architecture:** Keep the `Characters.jsx` container ownership unchanged; convert `FilterPanel.jsx` to an icon-button-triggered Bootstrap `Offcanvas` + `Accordion`; extend `hsrAssets.js` with `pathIconUrl`; restyle via CSS tokens in `index.css` and cartoon card rules in `App.css`.

**Tech Stack:** React 19, Vite 8, react-bootstrap 2 (Offcanvas, Accordion, Badge, Form, Button), Node built-in `node:test` + `node:assert/strict`, sunderarmor CDN icons with onError text fallback.

## Global Constraints

- PowerShell 5.1: no `&&` chaining (use `; if ($?) { ... }`), no `cd` inside commands (pass `workdir`).
- `& .\node_modules\.bin\eslint.cmd .` must be exit 0 with full output read; `npm run build` must be exit 0 with full output read before any done claim.
- Never commit, push, or open PRs unless explicitly asked — tasks end with a completion report, not a commit.
- Search/filter source of truth is `allCharacters`; visible list is derived via `useMemo`. Never filter the visible list into itself.
- CSS: flat top-level `@media` only (no nesting). Bootstrap utilities over custom CSS. Inputs need `aria-label`, images need `alt`, form buttons need explicit `type`.
- No new dependencies of any kind. Tests use `node --test` only.
- User-facing copy stays: `Error while loading characters`, `No characters found`, `No data yet`, `No team data yet`.
- All API logic lives in `Characters.jsx`; `Character.jsx` stays presentational; filtering logic stays in `Characters.jsx` + `characterFilters.js`.

---

## File structure

| File | Responsibility |
|---|---|
| `src/data/hsrAssets.js` (modify) | Add `pathIconUrl(path)` alongside `elementIconUrl`; both lowercase-normalize input and return sunderarmor CDN URL string. |
| `tests/hsrAssets.test.js` (create) | Unit tests for `elementIconUrl` + `pathIconUrl` URL shape and lowercase normalization. |
| `src/components/FilterPanel.jsx` (modify) | Icon-only filter button with count badge; left `Offcanvas` drawer; left-aligned `Accordion` with one section per enum group; icons in element/path checkbox labels; `Clear all` in drawer header. |
| `src/components/Character.jsx` (modify) | Add path icon + label row mirroring the element row; keep `onError` placeholder fallback. |
| `src/components/CharacterModal.jsx` (modify) | Add path icon image inside the path badge; keep null-safe placeholders. |
| `src/index.css` (modify) | Forced-dark tokens: bg, surface, text, border, accent pink `#ff4d8d`, accent-bg/border. |
| `src/App.css` (modify) | Cartoon card style: 16px radius, 3px borders, offset hard shadow, hover lift+tilt, icon sizes, drawer/accordion left-align tweaks. |
| Docs (modify in final task) | `ARCHITECTURE.md` rendering section, `docs/features/character-search-filter.md` drawer description. |

---

### Task 1: Path icon helper + tests

**Files:**
- Modify: `src/data/hsrAssets.js`
- Test: `tests/hsrAssets.test.js`

**Interfaces:**
- Consumes: nothing (pure string builder).
- Produces: `export function pathIconUrl(path)` returning `string`; `export function elementIconUrl(element)` unchanged signature — consumed by Task 2 (filters), Task 3 (card/modal).

- [ ] **Step 1: Write the failing test**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elementIconUrl, pathIconUrl } from '../src/data/hsrAssets.js';

test('elementIconUrl builds CDN URL', () => {
  assert.equal(elementIconUrl('lightning'), 'https://sunderarmor.com/STARRAIL/Elements/lightning_sm.png');
});

test('pathIconUrl builds CDN URL and lowercases input', () => {
  assert.equal(pathIconUrl('Nihility'), 'https://sunderarmor.com/STARRAIL/Paths/nihility_sm.png');
  assert.equal(pathIconUrl('destruction'), 'https://sunderarmor.com/STARRAIL/Paths/destruction_sm.png');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with `pathIconUrl is not a function` (element test passes, path tests fail).

- [ ] **Step 3: Write minimal implementation**

```js
// src/data/hsrAssets.js
export function elementIconUrl(element) {
  return `https://sunderarmor.com/STARRAIL/Elements/${String(element).toLowerCase()}_sm.png`;
}

export function pathIconUrl(path) {
  return `https://sunderarmor.com/STARRAIL/Paths/${String(path).toLowerCase()}_sm.png`;
}

export function rarityStars(rarity) {
  return rarity === '4-star' ? '★★★★' : '★★★★★';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (all suites, including existing `characterFilters` + `characterRepository` tests).

- [ ] **Step 5: Report completion (no commit)**

Run: `& .\node_modules\.bin\eslint.cmd src/data/hsrAssets.js tests/hsrAssets.test.js`
Expected: exit 0, no warnings.

---

### Task 2: Filter drawer (icon button + Offcanvas + Accordion + filter icons)

**Files:**
- Modify: `src/components/FilterPanel.jsx`

**Interfaces:**
- Consumes: props `{ filters, onChange, enums }` unchanged; `pathIconUrl`, `elementIconUrl` from Task 1; react-bootstrap `Button`, `Badge`, `Form`, `Offcanvas`, `Accordion`.
- Produces: same `onChange(nextFilters)` contract — no changes required in `Characters.jsx`.

- [ ] **Step 1: Replace toggle button with icon button + Offcanvas shell**

```jsx
// src/components/FilterPanel.jsx (top of return)
import { useState } from 'react';
import { Button, Badge, Form, Offcanvas, Accordion } from 'react-bootstrap';
import { elementIconUrl, pathIconUrl } from '../data/hsrAssets';

// inside component, return:
<div className="filter-drawer-trigger">
  <Button
    type="button"
    variant="primary"
    className="filter-icon-btn"
    onClick={() => setShow(true)}
    aria-label="Open filters"
    aria-expanded={show}
  >
    <span aria-hidden="true">☰</span>
    {selectedCount > 0 && (
      <Badge bg="light" text="dark" className="ms-2">
        {selectedCount}
      </Badge>
    )}
  </Button>
  <Offcanvas show={show} onHide={() => setShow(false)} placement="start" aria-label="Filters">
    <Offcanvas.Header closeButton>
      <Offcanvas.Title>Filters</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body className="text-start">
      {/* Accordion goes here in Step 3, Clear all button below */}
    </Offcanvas.Body>
  </Offcanvas>
</div>
```

State: replace `const [open, setOpen] = useState(false);` with `const [show, setShow] = useState(false);`.

- [ ] **Step 2: Add per-group icon helper and left-aligned checkbox label**

```jsx
const groupIcon = (groupKey, value) => {
  if (groupKey === 'elements') return elementIconUrl(value);
  if (groupKey === 'paths') return pathIconUrl(value);
  return null;
};

const labelWithIcon = (groupKey, value) => {
  const src = groupIcon(groupKey, value);
  if (!src) return value;
  return (
    <span className="d-inline-flex align-items-center gap-2">
      <img
        src={src}
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {value}
    </span>
  );
};
```

Use as `label={labelWithIcon(group.key, value)}` on each `Form.Check`. Decorative icons use `alt=""` + `aria-hidden` so screen readers hear only the value text.

- [ ] **Step 3: Render Accordion sections with Clear all**

```jsx
<Accordion defaultActiveKey="0" className="text-start">
  {groups.map((group, index) => (
    <Accordion.Item eventKey={String(index)} key={group.key}>
      <Accordion.Header>{group.title}</Accordion.Header>
      <Accordion.Body>
        <Form.Group controlId={`filter-${group.key}`}>
          {group.values.map((value) => (
            <Form.Check
              key={value}
              type="checkbox"
              id={`filter-${group.key}-${value}`}
              label={labelWithIcon(group.key, value)}
              checked={filters[group.key]?.includes(value) ?? false}
              onChange={() => toggleValue(group.key, value)}
            />
          ))}
        </Form.Group>
      </Accordion.Body>
    </Accordion.Item>
  ))}
</Accordion>
<Button type="button" variant="secondary" onClick={handleClear} className="mt-3">
  Clear all
</Button>
```

Keep `GROUP_TITLES`, `GROUP_ORDER`, `toggleValue`, `handleClear`, `selectedCount` logic unchanged.

- [ ] **Step 4: Verify manually + lint**

Run: `npm run dev`, open page, click funnel button, drawer slides from left, each section expands/collapses, element/path rows show icons, `Clear all` empties groups, Escape/backdrop closes.
Run: `& .\node_modules\.bin\eslint.cmd src/components/FilterPanel.jsx`
Expected: exit 0.

---

### Task 3: Card + modal path icons

**Files:**
- Modify: `src/components/Character.jsx`
- Modify: `src/components/CharacterModal.jsx`

**Interfaces:**
- Consumes: `pathIconUrl` from Task 1; `character.path` string prop.
- Produces: no interface change (same `character` + `onSelect` / `onClose` props).

- [ ] **Step 1: Card path row with icon**

```jsx
// Character.jsx — replace <Card.Text className="mb-1">{character.path}</Card.Text> with:
<Card.Text className="mb-1">
  {character.path ? (
    <>
      <img
        src={pathIconUrl(character.path)}
        alt={character.path}
        loading="lazy"
        width={20}
        height={20}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {' '}{character.path}
    </>
  ) : (
    <span className="text-muted">No data yet</span>
  )}
</Card.Text>
```

Add `import { elementIconUrl, pathIconUrl, rarityStars } from '../data/hsrAssets';`. Give the existing element `<img>` explicit `width={20} height={20}` if missing.

- [ ] **Step 2: Modal path badge with icon**

```jsx
// CharacterModal.jsx — replace path badge line with:
{character.path ? (
  <Badge bg="secondary" className="modal-badge">
    <img
      src={pathIconUrl(character.path)}
      alt={character.path}
      loading="lazy"
      width={16}
      height={16}
      className="me-1"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
    {character.path}
  </Badge>
) : (
  <span className="text-muted">No data yet</span>
)}
```

Add `pathIconUrl` to the existing `hsrAssets` import.

- [ ] **Step 3: Verify manually + lint**

Run: `npm run dev`, open any card and its modal, confirm path icon renders next to path text; block images/throttle 404 to confirm text fallback still reads clean.
Run: `& .\node_modules\.bin\eslint.cmd src/components/Character.jsx src/components/CharacterModal.jsx`
Expected: exit 0.

---

### Task 4: Forced dark pink cartoon theme

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: Bootstrap class names already in use (`character-card`, `modal-badge`, `filter-icon-btn`, `character-image`).
- Produces: CSS tokens consumed by all components via `var(--bg)`, `var(--accent)`, etc.

- [ ] **Step 1: Force dark pink tokens in index.css**

```css
:root {
  --text: #f3f4f6;
  --text-h: #ffffff;
  --bg: #16171d;
  --surface: #1f2028;
  --border: #2e303a;
  --code-bg: #1f2028;
  --accent: #ff4d8d;
  --accent-contrast: #1a0a12;
  --accent-bg: rgba(255, 77, 141, 0.15);
  --accent-border: rgba(255, 77, 141, 0.55);
  --social-bg: rgba(47, 48, 58, 0.5);
  --shadow: rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
}
```

Delete or demote the `@media (prefers-color-scheme: dark)` override so dark is the default (keep `color-scheme: dark`). Set `body { background: var(--bg); color: var(--text); }` and `.btn-primary` overrides to use `var(--accent)` with `var(--accent-contrast)` text.

- [ ] **Step 2: Cartoon card + drawer styles in App.css**

```css
.character-card {
  cursor: pointer;
  border-radius: 16px;
  border: 3px solid var(--border);
  background: var(--surface);
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.45);
  transition: transform 120ms ease;
}
.character-card:hover {
  transform: translateY(-4px) rotate(-0.5deg);
}
.character-card .card-title {
  font-weight: 800;
  letter-spacing: -0.02em;
}
.filter-icon-btn {
  border-radius: 999px;
  border-width: 3px;
  font-size: 20px;
  line-height: 1;
}
.offcanvas {
  background: var(--surface);
}
```

Keep rarity borders (`.rarity-5`, `.rarity-4`), keep all `@media` queries flat at top level, keep `text-center` utilities in JSX (no custom centering classes).

- [ ] **Step 3: Verify manually + lint**

Run: `npm run dev`, confirm dark bg everywhere, pink primary buttons/badges/focus, cards look chunky with hard shadow and hover tilt, drawer matches theme.
Run: `& .\node_modules\.bin\eslint.cmd src`
Expected: exit 0 (CSS has no lint, but JSX class usage must pass).

---

### Task 5: Docs + full verification

**Files:**
- Modify: `ARCHITECTURE.md` (rendering/style bullet)
- Modify: `docs/features/character-search-filter.md` (drawer + icons description)
- Modify: `README.md` only if it describes the old Filters button or theme.

**Interfaces:**
- Consumes: final behavior from Tasks 1-4.
- Produces: accurate docs; `npm run test` + eslint + build all green.

- [ ] **Step 1: Update ARCHITECTURE.md rendering bullet**

Replace the filter-toggle + theme sentences with: icon-only filter button opening a left `Offcanvas` drawer; `Accordion` sections per enum key, left-aligned, with element/path icons; forced-dark pink tokens; cartoon card rules; `pathIconUrl` alongside `elementIconUrl` with text fallback.

- [ ] **Step 2: Update docs/features/character-search-filter.md**

Document: funnel icon button with count badge, overlay drawer (backdrop/Escape close), Accordion sections, `Clear all`, icons in element/path options, filter semantics unchanged (OR within group, AND across groups).

- [ ] **Step 3: Full verification**

Run: `npm run test`
Expected: PASS all suites.

Run: `& .\node_modules\.bin\eslint.cmd .`
Expected: exit 0 — read full output, not partial.

Run: `npm run build`
Expected: exit 0 — read full output. Confirm loading / error / empty states still reachable and no new console errors.

- [ ] **Step 4: Report completion (no commit)**

Summarize files changed, test/build/lint outputs, and manual checks (drawer open/close, sections collapse, icons + fallbacks, dark pink cartoon look).
