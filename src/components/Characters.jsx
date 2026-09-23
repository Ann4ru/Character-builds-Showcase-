// fetch characters, loading, errors, search, filters, modal

import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { repository } from '../data/CharacterRepository';
import { applyFilters } from '../data/characterFilters';
import db from '../assets/hsr_character_library_starter.json' with { type: 'json' };
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import Character from './Character';
import CharacterModal from './CharacterModal';

function Characters() {
    // source of truth, set only on load; visible list is derived via useMemo
    const [allCharacters, setAllCharacters] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({ paths: [], elements: [], rarities: [], ratings: [], roles: [] });
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    // UseEffect loads data from the repository
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErr('');
            try {
                setAllCharacters(await repository.getAll());
            } catch (e) {
                console.dir(e);
                setErr('Error while loading characters');
                setAllCharacters([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // derive the visible list (never filter state into itself)
    const visible = useMemo(
        () => applyFilters(allCharacters, searchText, filters),
        [allCharacters, searchText, filters]
    );

    return (
        <Container fluid className="py-4">
            <div className="text-center mb-4">
                <h1>Star Rail Character Library</h1>
                <p>{`${visible.length} of ${allCharacters.length} characters`}</p>
            </div>

            <Row>
                <Col md={3}>
                    <FilterPanel filters={filters} onChange={setFilters} enums={db.enums} />
                </Col>

                <Col md={9}>
                    <SearchBar
                        searchText={searchText}
                        setSearchText={setSearchText}
                        onSearch={() => {}}
                    />

                    {/* If loading is true show spinner */}
                    {loading && (
                        <div className="text-center my-4">
                            <Spinner animation="border" role="status" className="me-2" />
                            <span>Loading characters...</span>
                        </div>
                    )}

                    {/* If there is an error, show it */}
                    {err && <Alert variant="danger">{err}</Alert>}

                    {/* If loading is false, there is no error and the visible array is empty, show message */}
                    {!loading && !err && visible.length === 0 && (
                        <Alert>No characters found</Alert>
                    )}

                    <Row className="g-4 justify-content-center">
                        {!loading && !err &&
                            // map() goes through every item of the visible array
                            // For each element it creates a character (card)
                            visible.map((c) => (
                                <Col key={c.name} className="character-col">
                                    <Character character={c} onSelect={setSelected} />
                                </Col>
                            ))}
                    </Row>
                </Col>
            </Row>

            <CharacterModal character={selected} onClose={() => setSelected(null)} />
        </Container>
    );
}

export default Characters;
