// Icon-button filter drawer: left Offcanvas with collapsible
// checkbox sections per enum key, plus Clear all.

import { useState } from 'react';
import { Accordion, Badge, Button, Form, Offcanvas } from 'react-bootstrap';
import { elementIconUrl, pathIconUrl } from '../data/hsrAssets';

// Group key -> title. Order here defines render order.
const GROUP_TITLES = {
  paths: 'Path',
  elements: 'Element',
  rarities: 'Rarity',
  ratings: 'Tier',
  roles: 'Role',
};

const GROUP_ORDER = Object.keys(GROUP_TITLES);

function groupIcon(groupKey, value) {
  if (groupKey === 'elements') return elementIconUrl(value);
  if (groupKey === 'paths') return pathIconUrl(value);
  return null;
}

function labelWithIcon(groupKey, value) {
  const icon = groupIcon(groupKey, value);
  if (!icon) return value;
  return (
    <span className="d-inline-flex align-items-center gap-2">
      <img
        src={icon}
        width={20}
        height={20}
        loading="lazy"
        alt=""
        aria-hidden="true"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
      {value}
    </span>
  );
}

function FilterPanel({ filters, onChange, enums }) {
  const [show, setShow] = useState(false);

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
      <Button
        type="button"
        variant="primary"
        className="filter-icon-btn"
        aria-label="Open filters"
        aria-expanded={show}
        onClick={() => setShow(true)}
      >
        <span aria-hidden="true">☰</span>
        {selectedCount > 0 && (
          <Badge bg="light" text="dark" className="ms-2">
            {selectedCount}
          </Badge>
        )}
      </Button>

      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        placement="start"
        aria-label="Filters"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="text-start">
          <Accordion defaultActiveKey="0" className="text-start">
            {groups.map((group, index) => (
              <Accordion.Item key={group.key} eventKey={String(index)}>
                <Accordion.Header>{group.title}</Accordion.Header>
                <Accordion.Body>
                  <Form.Group
                    className="mb-3"
                    controlId={`filter-${group.key}`}
                  >
                    {group.values.map((value) => (
                      <Form.Check
                        key={value}
                        type="checkbox"
                        id={`filter-${group.key}-${value}`}
                        label={labelWithIcon(group.key, value)}
                        checked={filters[group.key]?.includes(value) ?? false}
                        onChange={() => toggleValue(group.key, value)}
                      />
                    ))}
                  </Form.Group>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>

          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={handleClear}
          >
            Clear all
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default FilterPanel;
