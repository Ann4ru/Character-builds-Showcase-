# 0003 — No test framework yet (accepted gap)

Date: 2026-09-23
Status: Accepted (gap, not goal)

## Context

The repo has no test runner, no `*.test.*` files, and `package.json` has no `test` script. The 2026-09-23 fixes (search trim/reset, form submit, CSS class) were verified by fresh `eslint` (exit 0) + `npm run build` (exit 0) only.

## Decision

Ship the docs + minimal fixes without adding a framework in this pass. Do not claim logic is test-covered.

## Consequences

- Filter edge cases (empty, whitespace, case, no-match) have no regression net.
- Next step when tests are wanted: add Vitest + React Testing Library (or `node --test` for a pure filter helper), covering `handleSearch` and the loading/error/empty gates. Record that in a new ADR and in `CONTEXT.md`.
