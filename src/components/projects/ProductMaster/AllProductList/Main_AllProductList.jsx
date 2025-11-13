import { useState, useEffect, useCallback } from 'react';
import styles from './Main_AllProductList.module.css';
import SearchBar from './SearchBar';
import ProductList from './ProductList';
import { useProductContext } from '../../../../store/ProductContext';

const Main_AllProductList = ({ onSelectProduct }) => {
  const { loadProductById, products } = useProductContext();
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
        (typeof product.productNames === 'string' &&
          product.productNames.toLowerCase().includes(lowerSearchTerm)) ||
        (Array.isArray(product.productNames) &&
          product.productNames.some((name) =>
            name.name.toLowerCase().includes(lowerSearchTerm)
          )) ||
        product.productId.toLowerCase().includes(lowerSearchTerm) ||
        (Array.isArray(product.alibabaIds) &&
          product.alibabaIds.some((id) =>
            typeof id === 'string'
              ? id.toLowerCase().includes(lowerSearchTerm)
              : id.value && id.value.toLowerCase().includes(lowerSearchTerm)
          )) ||
        (Array.isArray(product.category) &&
          product.category.some((cat) =>
            typeof cat === 'string' || typeof cat === 'number'
              ? String(cat).toLowerCase().includes(lowerSearchTerm)
              : false
          ))
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleProductSelect = useCallback(
    (product) => {
      setSelectedProduct(product);

      // Use the loadProductById function to load all product data
      loadProductById(product.id);

      // Call the parent component's handler if provided
      if (onSelectProduct) {
        onSelectProduct(product);
      }
    },
    [loadProductById, onSelectProduct]
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  return (
    <div className={styles.productListContainer}>
      <SearchBar value={searchTerm} onChange={handleSearchChange} />
      <ProductList
        products={filteredProducts}
        selectedProductId={selectedProduct?.id}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default Main_AllProductList;
