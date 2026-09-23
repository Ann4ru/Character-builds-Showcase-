// Search input > filter results
// UI element > logic in Products

import { Form, Button, Row, Col } from 'react-bootstrap';

function SearchBar({ searchText, setSearchText, onSearch }) {
  return (
    <Row className="mb-4 g-2">
      <Col md={8}>
        <Form.Control
          type="text"
          placeholder="Search products..."
          value={searchText} // Value controlled by state
          onChange={(e) => setSearchText(e.target.value)} // Update state when something is typed
        />
      </Col>

      <Col md={2}>
        <Button className="w-100" onClick={onSearch}>Search</Button>
      </Col>
      
    </Row>
  );
}

export default SearchBar;