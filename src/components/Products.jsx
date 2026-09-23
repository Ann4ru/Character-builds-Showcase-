// fetch products, loading, errors, search, refresh

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import Product from './Product';
import SearchBar from './SearchBar';

function Products() {
    // saves the current (filtered) list of products
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [searchText, setSearchText] = useState(''); // Value is just updated, not stored in the searchBar

    const getProducts = async () => {
        setLoading(true);
        setErr('');

        try {
            const response = await axios.get('https://dummyjson.com/products');
            setProducts(response.data.products);
            setAllProducts(response.data.products);
        } catch (err) {
            console.dir(err)
            setErr('Error while loading products');
            setProducts([]);
            setAllProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // UseEffect loads data from the API
    useEffect(() => {
        getProducts();
    }, []);

    // searches among the complete list of products (allProducts)
    // Checks if any of the products titles has a correspondence with the input in the search bar
    // Gives back the filtered array of products > no corresponding titles > show message
    const handleSearch = () => {
        const query = searchText.trim().toLowerCase();
        if (!query) {
            setProducts(allProducts);
            return;
        }

        const filteredProducts = allProducts.filter((product) =>
            product.title.toLowerCase().includes(query)
        );

        setProducts(filteredProducts);
    };

    return (
        <Container className="py-4">
            <div className='text-center'>
                <div className="text-center mb-4">
                    <h1>Very-random-items shop</h1>
                    <p>(Seriously, make-up and chicken?)</p>
                </div>
                <div className="d-flex justify-content-center align-items-center mb-4 flex-wrap gap-2">
                    <p>All products</p>
                    <Button onClick={getProducts}>Refresh</Button>
                </div>
            </div>


            <SearchBar
                searchText={searchText}
                setSearchText={setSearchText}
                onSearch={handleSearch}
            />

            {/* If loading is true show spinner */}
            {loading && (
                <div className="text-center my-4">
                    <Spinner animation="border" role="status" className="me-2" />
                    <span>Loading products...</span>
                </div>
            )}

            {/* If there is an error, show it */}
            {err && <Alert variant="danger">{err}</Alert>}

            {/* If loading is false, there is no error and the products array is empty, show message */}
            {!loading && !err && products.length === 0 && (
                <Alert>No products found</Alert>
            )}

            <Row className="g-4">
                {!loading && !err &&
                    // map() goes through every item of the array 'Products'
                    // For each element it creates a product(card)
                    products.map((product) => (
                        <Col key={product.id} sm={12} md={6} lg={4}>
                            <Product product={product} />
                        </Col>
                    ))}
            </Row>
        </Container>
    );
}

export default Products;