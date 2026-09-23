# Product listing

## Trigger

App mount (`Products.jsx` `useEffect([])`) or `Refresh` button.

## Rules

- `GET https://dummyjson.com/products` via Axios; response `data.products` populates both `products` and `allProducts`.
- Grid: `Row.g-4`, cards at `Col sm=12 md=6 lg=4`, keyed by `product.id`.
- Card (`Product.jsx`): `thumbnail` (`alt=title`, `loading="lazy"`), `title`, `brand` (muted subtitle), `price` (`$` prefix, bold), `description`.

## UI states

| State | Condition | UI |
|---|---|---|
| Loading | `loading === true` | Spinner + "Loading products..." |
| Error | `err !== ''` | Danger `Alert`: `Error while loading products`; grid hidden |
| Empty | `!loading && !err && products.length === 0` | Neutral `Alert`: `No products found` |
| Ready | `!loading && !err && products.length > 0` | Card grid |

Source: `src/components/Products.jsx:17-38`, `src/components/Product.jsx`.
