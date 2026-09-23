# Refresh and error recovery

## Trigger

`Refresh` button (`Products.jsx`, next to the "All products" label).

## Rules

- Calls the same `getProducts()` as mount: `loading=true`, `err=''` → refetch → repopulate both lists.
- On failure: `err='Error while loading products'`, both lists cleared, `console.dir(err)` for debugging.
- The button stays available in every state (loading, error, empty, ready), so recovery never requires a page reload.

## UI

- While refetching: spinner replaces the grid.
- After a failed refetch: danger alert persists; user can retry.
- After a successful refetch following a search: the full list returns (any active filter is discarded — search must be re-submitted).

Source: `src/components/Products.jsx:17-38,58-61`.
