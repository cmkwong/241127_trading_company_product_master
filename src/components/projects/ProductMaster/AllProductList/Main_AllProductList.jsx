import { useState, useEffect, useCallback } from 'react';
import styles from './Main_AllProductList.module.css';
import SearchBar from './SearchBar';
import ProductList from './ProductList';
import { mockProducts } from '../../../../datas/Products/mockProducts';
import { useProductContext } from '../../../../store/ProductContext';

const Main_AllProductList = ({ onSelectProduct, productsList }) => {
  const { loadProductById } = useProductContext();
  const [products, setProducts] = useState(productsList || mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Update products when productsList prop changes
  useEffect(() => {
    if (productsList) {
      setProducts(productsList);

      // Also update filtered products, preserving any search filter
      if (searchTerm.trim()) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = productsList.filter(
          (product) =>
            product.productName.toLowerCase().includes(lowerSearchTerm) ||
            product.productId.toLowerCase().includes(lowerSearchTerm) ||
            product.alibabaIds.some((id) =>
              id.toLowerCase().includes(lowerSearchTerm)
            ) ||
            product.category.some((cat) =>
              cat.toLowerCase().includes(lowerSearchTerm)
            )
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(productsList);
      }
    }
  }, [productsList, searchTerm]);

  // Filter products when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.productName.toLowerCase().includes(lowerSearchTerm) ||
        product.productId.toLowerCase().includes(lowerSearchTerm) ||
        product.alibabaIds.some((id) =>
          id.toLowerCase().includes(lowerSearchTerm)
        ) ||
        product.category.some((cat) =>
          cat.toLowerCase().includes(lowerSearchTerm)
        )
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleProductSelect = useCallback(
    (product) => {
      setSelectedProduct(product);

      // Use the new loadProductById function instead of updating each field individually
      loadProductById(product.id, products);

      // Call the parent component's handler if provided
      if (onSelectProduct) {
        onSelectProduct(product);
      }
    },
    [loadProductById, onSelectProduct, products]
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
