# 0002 — Client-side title filtering

Date: 2026-09-23
Status: Accepted

## Context

The API returns the full list in one `GET /products`. A search box must narrow the visible grid without extra requests.

## Decision

Keep two arrays in `Products.jsx`: `allProducts` (source of truth, set only on fetch) and `products` (visible). `handleSearch` computes `query = searchText.trim().toLowerCase()`; empty query restores the full list; otherwise `allProducts.filter(p => p.title.toLowerCase().includes(query))`.

## Consequences

- No extra network traffic; instant filter; simple invariant (never filter `products` into itself).
- Search covers `title` only, is substring-based, and runs on submit (no live/debounced search).
- Whitespace-only input is treated as empty (full list), not as zero matches.
