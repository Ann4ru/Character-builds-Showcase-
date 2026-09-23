// how a single character is displayed

import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { elementIconUrl, rarityStars } from '../data/hsrAssets';

function Character({ character, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const rarityClass = character.rarity === '5-star' ? 'rarity-5' : character.rarity === '4-star' ? 'rarity-4' : '';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(character);
    }
  };

  return (
    <Card
      className={`h-100 character-card shadow-sm ${rarityClass}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(character)}
      onKeyDown={handleKeyDown}
    >
      {imgError ? (
        <div className="character-placeholder" aria-hidden="true">
          {character.name.charAt(0)}
        </div>
      ) : (
        <Card.Img
          src={character.image}
          alt={character.name}
          className="character-image"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}

      <Card.Body className="d-flex flex-column">
        <Card.Title>{character.name}</Card.Title>

        <Card.Text className="mb-1">
          {character.element ? (
            <>
              <img
                src={elementIconUrl(character.element)}
                alt={character.element}
                loading="lazy"
              />
              {' '}{character.element}
            </>
          ) : (
            <span className="text-muted">No data yet</span>
          )}
        </Card.Text>

        <Card.Text className="mb-1">{character.path}</Card.Text>

        <Card.Text className="mb-0">
          {rarityStars(character.rarity)}{' '}{character.rarity}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Character;
