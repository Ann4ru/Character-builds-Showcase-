// Collapsible filter panel: toggle button with selection-count badge,
// one checkbox group per enum key, plus Clear all.

import { useState } from 'react';
import { Button, Badge, Form } from 'react-bootstrap';

// Group key -> title. Order here defines render order.
const GROUP_TITLES = {
  paths: 'Path',
  elements: 'Element',
  rarities: 'Rarity',
  ratings: 'Tier',
  roles: 'Role',
};

const GROUP_ORDER = Object.keys(GROUP_TITLES);

function FilterPanel({ filters, onChange, enums }) {
  const [open, setOpen] = useState(false);

  // Derive groups from the enums prop (never hardcoded value lists);
  // the constant above supplies only order + titles.
  const groups = GROUP_ORDER.filter((key) => Array.isArray(enums?.[key])).map(
    (key) => ({ key, title: GROUP_TITLES[key], values: enums[key] })
  );

  const selectedCount = groups.reduce(
    (total, group) => total + (filters[group.key]?.length ?? 0),
    0
  );

  const toggleValue = (group, value) => {
    const current = filters[group] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [group]: next });
  };

  const handleClear = () => {
    const reset = Object.fromEntries(GROUP_ORDER.map((key) => [key, []]));
    onChange(reset);
  };

  return (
    <div>
      <Button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Filters
        {selectedCount > 0 && (
          <Badge bg="light" text="dark" className="ms-2">
            {selectedCount}
          </Badge>
        )}
      </Button>

      {open && (
        <div className="mt-3">
          {groups.map((group) => (
            <Form.Group key={group.key} className="mb-3" controlId={`filter-${group.key}`}>
              <Form.Label>{group.title}</Form.Label>
              {group.values.map((value) => (
                <Form.Check
                  key={value}
                  type="checkbox"
                  id={`filter-${group.key}-${value}`}
                  label={value}
                  checked={filters[group.key]?.includes(value) ?? false}
                  onChange={() => toggleValue(group.key, value)}
                />
              ))}
            </Form.Group>
          ))}

          <Button type="button" variant="secondary" onClick={handleClear}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
