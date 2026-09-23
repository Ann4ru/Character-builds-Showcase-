// detail modal for a single character, opened from the Characters grid

import { Modal, Badge, ListGroup } from 'react-bootstrap';
import { elementIconUrl, rarityStars } from '../data/hsrAssets';

const asArray = (v) => {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};

function listOrEmpty(values) {
  const items = asArray(values).filter((v) => v !== null && v !== undefined && v !== '');
  if (items.length === 0) {
    return <span className="text-muted">No data yet</span>;
  }
  return (
    <ListGroup>
      {items.map((item, index) => (
        <ListGroup.Item key={`${item}-${index}`}>{item}</ListGroup.Item>
      ))}
    </ListGroup>
  );
}

function CharacterModal({ character, onClose }) {
  if (!character) return null;

  const mainStats = character.mainStats || {};
  const statSlots = [
    { label: 'Body', values: asArray(mainStats.body) },
    { label: 'Feet', values: asArray(mainStats.feet) },
    { label: 'Sphere', values: asArray(mainStats.sphere) },
    { label: 'Rope', values: asArray(mainStats.rope) },
  ];
  const teams = asArray(character.bestTeams)
    .filter((team) => Array.isArray(team) && team.length > 0)
    .slice(0, 3);
  const sources = asArray(character.sources).filter((s) => s !== null && s !== undefined && s !== '');

  return (
    <Modal show={character !== null} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        {character.image ? (
          <img
            src={character.image}
            alt={character.name}
            loading="lazy"
            width={64}
            height={64}
            className="me-3 rounded"
          />
        ) : (
          <span className="text-muted">No data yet</span>
        )}
        <div>
          <Modal.Title>{character.name}</Modal.Title>
          <div className="d-flex flex-wrap gap-1 mt-1">
            {character.element ? (
              <Badge bg="secondary" className="modal-badge">
                <img
                  src={elementIconUrl(character.element)}
                  alt={character.element}
                  loading="lazy"
                  width={16}
                  height={16}
                  className="me-1"
                />
                {character.element}
              </Badge>
            ) : (
              <span className="text-muted">No data yet</span>
            )}
            {character.path ? <Badge bg="secondary" className="modal-badge">{character.path}</Badge> : <span className="text-muted">No data yet</span>}
            {character.rarity ? (
              <Badge bg="secondary" className="modal-badge">{`${rarityStars(character.rarity)} ${character.rarity}`}</Badge>
            ) : (
              <span className="text-muted">No data yet</span>
            )}
            {character.role ? <Badge bg="secondary" className="modal-badge">{character.role}</Badge> : <span className="text-muted">No data yet</span>}
            {character.overallRating ? <Badge bg="secondary" className="modal-badge">{character.overallRating}</Badge> : <span className="text-muted">No data yet</span>}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <h5>Light Cones</h5>
        {listOrEmpty(character.bestLightCones)}

        <h5 className="mt-3">Relics &amp; Ornaments</h5>
        <h6 className="mt-2">Relics</h6>
        {listOrEmpty(character.bestRelics)}
        <h6 className="mt-2">Ornaments</h6>
        {listOrEmpty(character.bestOrnaments)}

        <h5 className="mt-3">Stats</h5>
        {statSlots.map((slot) => (
          <p key={slot.label} className="mb-1">
            <strong>{`${slot.label}: `}</strong>
            {slot.values.length > 0 ? (
              slot.values.join(', ')
            ) : (
              <span className="text-muted">No data yet</span>
            )}
          </p>
        ))}
        <h6 className="mt-2">Sub Stats</h6>
        {listOrEmpty(character.subStats)}

        <h5 className="mt-3">Teams</h5>
        {teams.length === 0 ? (
          <span className="text-muted">No team data yet</span>
        ) : (
          <ol className="mb-0">
            {teams.map((team, index) => (
              <li key={`team-${index}`}>{team.join(', ')}</li>
            ))}
          </ol>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="w-100 text-start">
          <strong>Sources: </strong>
          {sources.length === 0 ? (
            <span className="text-muted">No data yet</span>
          ) : (
            <ul className="mb-0">
              {sources.map((source, index) => (
                <li key={`${source}-${index}`}>
                  <a href={source} target="_blank" rel="noreferrer">
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default CharacterModal;
