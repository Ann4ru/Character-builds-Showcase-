# Character modal

## Trigger

Clicking (or Enter/Space on a focused) character card sets `selected`; `CharacterModal` renders while `selected !== null`. Closing (× button, backdrop click, Escape via Bootstrap Modal, or `onClose`) resets `selected` to null.

## Rules

- Bootstrap `Modal` with `size="lg"`. Returns null when `character` is null, so no modal DOM exists without a selection.
- Header: 64px thumbnail (`alt=name`, `loading="lazy"`, rendered only when `character.image` is set), `Modal.Title` with the name, badges for element (with 16px icon), path, rarity (`★★★★★ 5-star` / `★★★★ 4-star`), role, tier (`overallRating`).
- Build section: `Light Cones` list, `Relics & Ornaments` (with `Relics` / `Ornaments` subheads), `Stats` (one line per slot — Body, Feet, Sphere, Rope — joined with `, `), `Sub Stats` list.
- Teams section: up to 3 teams (`slice(0, 3)`), rendered as an ordered list with members joined by `, `; non-array or empty entries are skipped.
- Footer: `Sources: ` with a link list (`target="_blank"`, `rel="noreferrer"`).
- Placeholders: any null/empty field renders a muted `No data yet` span instead of breaking layout; an empty team list renders `No team data yet`. Mixed `mainStats` shapes (string vs array) are tolerated via an `asArray` normalizer.

## Sections and copy

| Section | Heading | Empty copy |
|---|---|---|
| Light cones | `Light Cones` | `No data yet` |
| Relics | `Relics` (under `Relics & Ornaments`) | `No data yet` |
| Ornaments | `Ornaments` (under `Relics & Ornaments`) | `No data yet` |
| Main stats | `Stats` + `Body:` / `Feet:` / `Sphere:` / `Rope:` lines | `No data yet` per slot |
| Sub stats | `Sub Stats` | `No data yet` |
| Teams | `Teams` | `No team data yet` |
| Sources | `Sources:` (footer) | `No data yet` |

Source: `src/components/CharacterModal.jsx`, `src/components/Characters.jsx` (`selected` state).
