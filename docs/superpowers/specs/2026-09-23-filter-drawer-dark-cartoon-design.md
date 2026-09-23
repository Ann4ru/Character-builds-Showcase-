# Design: Filter Drawer + Dark Pink Cartoon Restyle

Date: 2026-09-23. Status: approved. User asked to write plan first.

## Goal
Small styling refresh: left overlay filter drawer with collapsible left-aligned sections, icon-only filter button, forced dark + pink accent with cartoonish cards, path icons in cards/modal/filters alongside element icons.

## Decisions (from brainstorming)
- Drawer: Bootstrap `Offcanvas` overlay from left (backdrop + Escape + close button). No layout push.
- Theme: forced dark (`--bg #16171d`, surface `#1f2028`, text `#f3f4f6`, accent pink `#ff4d8d`). Light `prefers-color-scheme` branch removed or kept only as fallback.
- Cartoon: `border-radius: 16px`, 3px borders, offset hard shadow `4px 4px 0`, hover `translateY(-4px) rotate(-0.5deg)`, chunky badges/buttons.
- Icons: new `pathIconUrl(path)` in `hsrAssets.js` mirroring `elementIconUrl` on sunderarmor CDN, lowercase-normalized, with `onError` fallback to plain text. Applies to `Character.jsx`, `CharacterModal.jsx`, `FilterPanel.jsx` (element + path groups only).

## Scope
- `src/components/FilterPanel.jsx` — icon button + Offcanvas + Accordion, left-aligned, `Clear all` in header.
- `src/components/Characters.jsx` — composition only, no filter logic change.
- `src/components/Character.jsx`, `CharacterModal.jsx` — add path icon, keep null-safe placeholders.
- `src/data/hsrAssets.js` — add `pathIconUrl`.
- `src/index.css`, `src/App.css` — forced-dark tokens + cartoon card styles, flat top-level `@media` only.
- Docs: `ARCHITECTURE.md` rendering section + relevant `docs/features/*` if behavior text changes.

## Non-goals
- No new UI libs, TypeScript, test frameworks, or bundled icon assets (no ADR needed).
- No filter semantics change (OR within group, AND across groups, source of truth `allCharacters`).
- No commit without explicit ask (AGENTS.md overrides skill default).

## Self-review
- No TBDs. No contradictions with ARCHITECTURE.md invariants. Single-plan scope. Icon 404 fallback explicit.
