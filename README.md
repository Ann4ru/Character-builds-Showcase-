# Very Random Items Shop (character-showcase)

A small React + Vite product browser. Fetches products from `https://dummyjson.com/products` and renders them as Bootstrap cards with search, refresh, loading, and error states.

> Note: the repo folder is `character-showcase` and `package.json` still names the package `productsapp`. The UI title is "Very Random Items Shop". See `CONTEXT.md` for this naming drift.

## Stack

- React 19 + React DOM (`src/main.jsx`, `src/App.jsx`)
- Vite 8 (dev server + production build)
- React-Bootstrap 2 + Bootstrap 5 (layout, cards, alerts)
- Axios (HTTP to dummyjson API)
- ESLint 9 (flat config, react-hooks + react-refresh)

## Getting started

```bash
npm install
npm run dev      # local dev server (see Vite output for port)
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
npm run lint     # eslint .
```

No environment variables. No backend. The only runtime dependency is network access to `https://dummyjson.com/products`.

## Project structure

```
index.html                  # title: "Very Random Items Shop", mounts #root
vite.config.js              # @vitejs/plugin-react
eslint.config.js            # flat config, ignores dist/
src/
  main.jsx                  # StrictMode root render
  App.jsx                   # renders <Products />
  App.css                   # product-card styles
  index.css                 # theme tokens, layout (#root max-width 1126px)
  components/
    Products.jsx            # fetch, state, search wiring, loading/error/empty UI
    Product.jsx             # single Bootstrap card (thumbnail, brand, price, description)
    SearchBar.jsx           # controlled input + submit; Enter key supported
  assets/                   # empty
public/
  favicon.svg
  icons.svg
```

## How it works

1. `Products.jsx` mounts -> `getProducts()` sets `loading=true`, clears `err`, calls `axios.get('https://dummyjson.com/products')`.
2. On success, both `products` (visible) and `allProducts` (search source) are set from `response.data.products`.
3. On failure, `err = 'Error while loading products'`, both lists are cleared, and a danger `Alert` is shown. `Refresh` re-calls `getProducts()`.
4. Search filters `allProducts` by `title.toLowerCase().includes(query)` where `query = searchText.trim().toLowerCase()`. Empty query resets to the full list.
5. UI states: spinner while `loading`, danger alert on `err`, "No products found" alert when not loading, no error, and zero products. The grid only renders when `!loading && !err`.

## API contract

- Endpoint: `GET https://dummyjson.com/products`
- Consumed shape: `{ products: [{ id, title, brand, price, description, thumbnail }] }`
- No pagination, no auth, full list fetched once per refresh.

## Known limitations

- No test runner (no `*.test.*`, no vitest/jest script). See `docs/ADR/0003-no-test-framework.md`.
- Client-side title-only search; no description/brand search, no debounce, no server-side query.
- `console.dir(err)` on fetch failure (dev aid, leaks nothing sensitive but noisy).
- No image fallback if `thumbnail` 404s; images use native `loading="lazy"`.

## Docs map

- `ARCHITECTURE.md` — component responsibilities and data flow
- `CONTEXT.md` — current state, recent fixes, open gaps
- `AGENTS.md` — working agreements for humans and AI agents
- `docs/ADR/` — architecture decision records
- `docs/features/` — per-feature behavior notes
