# AGENTS.md — Working agreements for character-showcase

Applies to humans and AI agents editing this repo. User instructions in chat override this file; this file overrides default behavior.

## Commands (PowerShell 5.1, win32)

```powershell
npm install
npm run dev          # dev server
npm run build        # must pass before any "done" claim
& .\node_modules\.bin\eslint.cmd .   # lint; must be exit 0 (npm run lint works only after install)
```

- Do not use `&&` to chain commands (PowerShell 5.1). Use `; if ($?) { ... }`.
- Do not `cd` inside commands; pass `workdir` instead.
- Never commit, push, or open PRs unless explicitly asked.

## File map — where things go

- `src/components/Products.jsx` — data fetching + list state. All API logic lives here, nowhere else.
- `src/components/Product.jsx` — pure presentational card. No fetching, no state.
- `src/components/SearchBar.jsx` — controlled input + `<Form onSubmit>`. Filtering logic stays in `Products.jsx`.
- `src/App.jsx` — composition only (`<Products />`).
- `src/App.css` — product-card styles. `src/index.css` — theme tokens + `#root` layout.
- Docs: `README.md` (overview), `ARCHITECTURE.md` (design), `CONTEXT.md` (state), `docs/ADR/` (decisions), `docs/features/` (behavior).

## Conventions

- Keep components small and single-purpose. Follow existing `.jsx` + react-bootstrap patterns; do not introduce new UI libs, TypeScript, or test frameworks without an ADR.
- Search source of truth is `allProducts`; visible list is `products`. Never filter `products` into itself.
- User-facing strings: title-case headings, plain-sentence alerts (`Error while loading products`, `No products found`).
- CSS: flat `@media` queries at top level in `*.css` (no nesting). Bootstrap utilities over custom CSS where possible (`text-center`, not `text-align-center`).
- Accessibility: inputs need `aria-label`, images need `alt`, buttons inside forms need explicit `type`.

## Definition of done

1. `eslint` exit 0 (full output read, not partial).
2. `npm run build` exit 0 (full output read).
3. No new console errors; loading / error / empty states still reachable.
4. Docs updated if behavior, API, or structure changed (`README.md` + relevant `docs/features/*`).

## Do not

- Add dependencies, rename the package, or restructure folders without asking.
- Fix symptoms without root cause (see systematic-debugging: reproduce, trace, single hypothesis, minimal fix, verify).
- Claim "passes / fixed / done" without fresh command output in the same turn.
