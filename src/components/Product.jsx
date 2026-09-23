// how a single product is displayed

import { Card } from 'react-bootstrap';

function Product({ product }) {
  return (
    <Card className="h-100 product-card shadow-sm">
      <Card.Img
        src={product.thumbnail}
        alt={product.title}
        className="product-image"
      />

      <Card.Body className="d-flex flex-column">
        <Card.Title>{product.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {product.brand}
        </Card.Subtitle>

        <Card.Text className="product-price">
          ${product.price}
        </Card.Text>

        <Card.Text className="flex-grow-1">
          {product.description}
        </Card.Text>

      </Card.Body>
    </Card>
  );
}

export default Product;