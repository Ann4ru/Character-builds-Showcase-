# Character search + filter

Supersedes `search-filter.md` (products version, kept for history).

## Trigger

Typing in `SearchBar` updates `searchText` live (the visible list re-derives on every keystroke via `useMemo`); submitting the form (Search button click or Enter key) calls `onSearch`, currently a no-op. Toggling a checkbox in `FilterPanel` updates `filters`.

## Rules

- Source of truth is `allCharacters`; `applyFilters(allCharacters, searchText, filters)` computes the visible list. State is never filtered into itself.
- Search: `query = searchText.trim().toLowerCase()`, substring match on `name`, case-insensitive. Empty/whitespace-only query constrains nothing.
- Filters: within one group selections combine with OR (element ice OR wind); across groups with AND; the search query ANDs with all filters. An empty group constrains nothing.
- Group-to-field mapping: `paths→path`, `elements→element`, `rarities→rarity`, `ratings→overallRating`, `roles→role`. Option lists derive from the JSON `enums`, so enum changes never require UI edits.
- Combined example: query `a` + role `sustain` matches only sustain characters whose name contains "a".
- Panel: collapsed by default behind a `Filters` toggle button (`aria-expanded`); shows a count badge (`Filters (3)`) when selections exist; expands to one checkbox group per enum key (`Path`, `Element`, `Rarity`, `Tier`, `Role`); `Clear all` resets every group.
- Zero matches → the shared empty state: neutral `Alert` `No characters found`.

## Accessibility and layout

- Input has `placeholder="Search characters..."` and `aria-label="Search characters"`.
- Submit button is `type="submit"` inside `<Form onSubmit>` (Enter works, no page reload via `preventDefault`).
- Row: input `Col xs=12 md=9`, button `Col xs=12 md=3` (stacks on mobile).
- Filter checkboxes are real `Form.Check` inputs with labels; toggle button carries `aria-expanded`.

Source: `src/data/characterFilters.js` (`matchesQuery`, `matchesFilters`, `applyFilters`), `src/components/Characters.jsx`, `src/components/SearchBar.jsx`, `src/components/FilterPanel.jsx`.
