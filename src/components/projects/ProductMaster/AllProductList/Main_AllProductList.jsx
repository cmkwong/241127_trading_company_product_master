import { useState, useEffect, useCallback } from 'react';
import styles from './Main_AllProductList.module.css';
import SearchBar from './SearchBar';
import ProductList from './ProductList';
import { useProductContext } from '../../../../store/ProductContext';

const Main_AllProductList = ({ onSelectProduct }) => {
  const { getProductData, products, createNewProduct } = useProductContext();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Update filtered products when products from context or search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = products.filter(
      (product) =>
        (typeof product.product_names === 'string' &&
          product.product_names.toLowerCase().includes(lowerSearchTerm)) ||
        (Array.isArray(product.product_names) &&
          product.product_names.some((name) =>
            name.name.toLowerCase().includes(lowerSearchTerm),
          )) ||
        product.id.toLowerCase().includes(lowerSearchTerm) ||
        (Array.isArray(product.product_alibaba_ids) &&
          product.product_alibaba_ids.some((id) =>
            typeof id === 'string'
              ? id.toLowerCase().includes(lowerSearchTerm)
              : id.value && id.value.toLowerCase().includes(lowerSearchTerm),
          )) ||
        (Array.isArray(product.product_categories) &&
          product.product_categories.some((cat) =>
            typeof cat === 'string' || typeof cat === 'number'
              ? String(cat).toLowerCase().includes(lowerSearchTerm)
              : false,
          )),
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleProductSelect = useCallback(
    (product) => {
      setSelectedProduct(product);

      // Use the getProductData function to load all product data
      getProductData('root', { id: product.id }, true);

      // Call the parent component's handler if provided
      if (onSelectProduct) {
        onSelectProduct(product);
      }
    },
    [getProductData, onSelectProduct],
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleCreateProduct = () => {
    createNewProduct();
  };

  return (
    <div className={styles.productListContainer}>
      <div className={styles.searchAndCreateContainer}>
        <SearchBar value={searchTerm} onChange={handleSearchChange} />
        <button
          className={styles.createButton}
          onClick={handleCreateProduct}
          title="Create New Product"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      <ProductList
        products={filteredProducts}
        selectedProductId={selectedProduct?.id}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default Main_AllProductList;
