# 0001 — React + Vite + Bootstrap stack

Date: 2026-09-23 (recorded retroactively; stack predates this docs pass)
Status: Accepted

## Context

Scaffolded from the Vite React template. Needed a fast static grid UI with minimal custom CSS.

## Decision

Keep React 19 + Vite 8 for build/dev, React-Bootstrap 2 + Bootstrap 5 for layout/cards/alerts, Axios for the single GET request.

## Consequences

- Fast dev loop, single static `dist/` output, no backend.
- Bootstrap CSS dominates bundle (~232 kB CSS). Acceptable for this size; revisit if custom design grows.
- Do not add another UI library, TypeScript, or a data-fetching library without a new ADR.
