# ARCHITECTURE.md — character-showcase design

## Goal

Single-page product browser: fetch once, display as responsive card grid, filter by title, recover from failures via refresh.

## Components

```
App (src/App.jsx)
 └─ Products (src/components/Products.jsx) — container
     ├─ SearchBar (src/components/SearchBar.jsx) — controlled input
     └─ Product[] (src/components/Product.jsx) — presentational card
```

| Component | Responsibility | Must not |
|---|---|---|
| `Products` | `axios.get` to dummyjson, owns `products`, `allProducts`, `loading`, `err`, `searchText`; defines `getProducts` + `handleSearch` | Render card internals, own input DOM |
| `SearchBar` | Controlled `Form.Control` (`value`/`onChange`), `<Form onSubmit>` → `onSearch()` | Filter, fetch, hold product data |
| `Product` | Render `Card` from `product` prop (`thumbnail`, `title`, `brand`, `price`, `description`) | Fetch, filter, manage state |

`App.jsx` and `main.jsx` are composition/bootstrap only.

## State and data flow

State in `Products.jsx`:

- `products` — visible (filtered) list. Rendered in `<Row>` grid.
- `allProducts` — immutable-until-refresh source of truth for search.
- `loading` (bool), `err` (string), `searchText` (string).

Flow:

1. Mount → `useEffect([])` → `getProducts()`.
2. `getProducts`: `loading=true`, `err=''` → `axios.get('https://dummyjson.com/products')` → set both lists → `loading=false`. On throw: `console.dir(err)`, `err='Error while loading products'`, clear both lists, `loading=false`.
3. `handleSearch`: `query = searchText.trim().toLowerCase()`; empty → `setProducts(allProducts)`; else `allProducts.filter(p => p.title.toLowerCase().includes(query))`.
4. Render gates: spinner if `loading`; danger `Alert` if `err`; neutral `Alert` if `!loading && !err && products.length === 0`; grid only if `!loading && !err`.

Invariant: search always reads `allProducts`, never `products`. Refresh always refetches and repopulates both.

## Rendering and style

- Layout: `Container.py-4`, header `text-center`, refresh row (`d-flex justify-content-center`), grid `Row.g-4` with `Col sm=12 md=6 lg=4`.
- Search row: `Form > Row.mb-4.g-2`, `Col xs=12 md=9` input + `Col xs=12 md=3` submit button (`type="submit"`, `w-100`).
- Cards: `Card.h-100.product-card.shadow-sm`, `Card.Img.product-image` (`height: 280px; object-fit: cover; loading="lazy"`), body column with title, muted brand subtitle, bold price, `flex-grow-1` description.
- Theme: CSS variables in `src/index.css` (`--text`, `--bg`, `--accent`, dark-mode via `prefers-color-scheme`), `#root` centered max-width 1126px. All `@media` queries are top-level (no CSS nesting).

## External contract

- `GET https://dummyjson.com/products` → `{ products: [{ id, title, brand, price, description, thumbnail }] }`.
- No pagination, no auth, no POST. Grid keys on `product.id`.

## Failure modes

| Condition | UI |
|---|---|
| Fetch in flight | Spinner + "Loading products..." |
| Fetch throws / offline | Danger alert `Error while loading products`, grid hidden, `Refresh` still available |
| Fetch returns empty / filter matches nothing | Neutral alert `No products found` |
| Whitespace-only query | Treated as empty → full list restored |
