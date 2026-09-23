// Search input > filter results
// UI element > logic in Products

import { Form, Button, Row, Col } from 'react-bootstrap';

function SearchBar({ searchText, setSearchText, onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-4 g-2">
        <Col xs={12} md={9}>
          <Form.Control
            type="text"
            placeholder="Search characters..."
            aria-label="Search characters"
            value={searchText} // Value controlled by state
            onChange={(e) => setSearchText(e.target.value)} // Update state when something is typed
          />
        </Col>

        <Col xs={12} md={3}>
          <Button type="submit" className="w-100">Search</Button>
        </Col>
      </Row>
    </Form>
  );
}

export default SearchBar;