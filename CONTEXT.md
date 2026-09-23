# CONTEXT.md — current state of character-showcase

Last updated: 2026-09-23. Update this file whenever behavior, API, or structure changes.

## What this is

React 19 + Vite 8 + Bootstrap 5 product browser against `https://dummyjson.com/products`. See `README.md` for setup, `ARCHITECTURE.md` for design.

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

- Folder: `character-showcase`. Package (`package.json`): `productsapp`. UI: "Very Random Items Shop". Data: dummyjson products (makeup, groceries, etc. — not characters).
- If the project is really a character showcase (e.g. Rick & Morty API), that is a re-scope, not a rename — write an ADR first.

## Open gaps

- No test runner or test files. Filter logic (`trim`/`includes`/reset) is only manually reasoned + build-verified. Recommendation: add Vitest + React Testing Library, or at minimum a `node --test` pure-filter test.
- No pagination, no debounce, search covers `title` only.
- `console.dir(err)` on fetch failure — replace with a logging decision if this grows.
- No image error fallback; `brand` may render empty for unbranded items.

## Where to look next

- Behavior details: `docs/features/*.md`
- Decisions: `docs/ADR/*.md` (0001 stack, 0002 client-side filter, 0003 no-test-framework gap)
