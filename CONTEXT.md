# CONTEXT.md — current state of character-showcase

Last updated: 2026-09-23 (HSR rework: spec + data pass; code untouched). Update this file whenever behavior, API, or structure changes.

## What this is

React 19 + Vite 8 + Bootstrap 5 app pivoting from a dummyjson product browser to a **Honkai: Star Rail character showcase**. Live code is still the products version; the rework design is specified in `docs/superpowers/specs/2026-09-23-hsr-showcase-design.md` (draft, awaiting user review). See `README.md` for setup, `ARCHITECTURE.md` for the current (products) design.

## HSR rework — decisions locked 2026-09-23 (Q&A)

- Thumbnails: hotlink genshin.gg (`sunderarmor.com/STARRAIL/...`), not downloaded.
- Data enriched before spec: JSON is now schema 1.1, 90 characters, `rarity` added (67× `5-star`, 23× `4-star`), all 90 `image` fields filled from the live roster page, `overallRating` kept as editorial.
- Sync: build-time `npm run sync:hsr` script (no runtime fetching — CORS + JS-rendered pages rule that out).
- DB seam: `CharacterRepository` interface + JSON adapter now, real-DB adapter later.
- Detail view: react-bootstrap `Modal` (`size="lg"`), structure defined in the spec.

## Mock database (`src/assets/hsr_character_library_starter.json`, still untracked)

- Schema 1.1, `lastChecked: 2026-09-23`, enums for elements/paths/ratings/roles/rarity/stats.
- Known issues for implementation: live roster has `Black Swan` + `Bronya` (absent here — sync script adds them as stubs); genshin.gg spells `Boothill` as `Boothiill` (alias map); several entries have empty `bestTeams` and mixed `mainStats` shapes (string vs array — UI must tolerate both).

## What works now (verified 2026-09-23)

- `eslint` (full `.\node_modules\.bin\eslint.cmd .`) → exit 0, no output.
- `npm run build` → exit 0, `dist/` emitted (376 modules, ~254 kB JS / ~232 kB CSS).
- Fetch → grid, spinner while loading, danger alert on error with working `Refresh`, neutral "No products found" on empty/filter-miss.
- Search: title-substring, case-insensitive, whitespace-trimmed, empty resets; Enter key submits via `<Form onSubmit>`.

## Recent fixes (2026-09-23, same turn as lint+build green)

1. `Products.jsx` — `handleSearch` trims input and resets on empty (`text-align-center` → `text-center` fixed in the header wrapper too).
2. `SearchBar.jsx` — wrapped in `<Form onSubmit>` with `preventDefault`, `type="submit"` button, `aria-label` on input, grid fixed to `xs=12 md=9/3` (was `md=8/2`, left a dead column and no mobile stacking).
3. `Product.jsx` — `loading="lazy"` on thumbnails.
4. `index.html` — title `productsapp` → `Very Random Items Shop`.
5. `src/index.css` — un-nested `@media` queries to top level (root font-size, `h1`/`h2`).

Root causes were scaffold leftovers (Vite template CSS nesting, template title, Bootstrap class confusion) plus missing form semantics (no submit path for Enter, no trim).

## Naming drift (do not "fix" silently)

- Folder: `character-showcase`. Package (`package.json`): `productsapp`. UI: "Very Random Items Shop". Data: dummyjson products until the HSR rework lands (then: HSR roster from the bundled JSON).
- The rework resolves the drift (folder name finally matches content); package rename still needs an explicit decision.

## Open gaps

- No test runner or test files. Rework spec calls for a `node --test` suite over the pure search/filter predicate (no new dependencies).
- `docs/features/*` and `ARCHITECTURE.md` still describe the products version; rewritten during rework implementation per the spec's file map.
- `docs/other/` is scratch space (see `docs/other/.gitignore`): never commit its contents, and ignore them in reviews.
- No pagination, no debounce, search covers `title` only.
- `console.dir(err)` on fetch failure — replace with a logging decision if this grows.
- No image error fallback; `brand` may render empty for unbranded items.

## Where to look next

- Behavior details: `docs/features/*.md`
- Decisions: `docs/ADR/*.md` (0001 stack, 0002 client-side filter, 0003 no-test-framework gap)
