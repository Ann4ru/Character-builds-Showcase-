# Search filter

## Trigger

Typing in `SearchBar` updates `searchText`; submitting the form (Search button click or Enter key) calls `onSearch` → `handleSearch` in `Products.jsx`.

## Rules

- Source of truth is `allProducts`; the visible `products` array is replaced, never filtered into itself.
- `query = searchText.trim().toLowerCase()`. Empty query → `setProducts(allProducts)` (full reset).
- Otherwise: `allProducts.filter(p => p.title.toLowerCase().includes(query))`. Case-insensitive, title-only, substring match.
- Zero matches → the shared empty state: neutral `Alert` `No products found`.

## Accessibility and layout

- Input has `placeholder="Search products..."` and `aria-label="Search products"`.
- Submit button is `type="submit"` inside `<Form onSubmit>` (Enter works, no page reload via `preventDefault`).
- Row: input `Col xs=12 md=9`, button `Col xs=12 md=3` (stacks on mobile).

Source: `src/components/Products.jsx` (`handleSearch`), `src/components/SearchBar.jsx`.
