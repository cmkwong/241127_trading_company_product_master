import { useState, useEffect, useCallback } from 'react';
import styles from './Main_AllProductList.module.css';
import SearchBar from './SearchBar';
import ProductList from './ProductList';
import { mockProducts } from '../../../../datas/Products/mockProducts';
import { useProductContext } from '../../../../store/ProductContext';

const Main_AllProductList = ({ onSelectProduct, productsList }) => {
  const { updateData } = useProductContext();
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

      // Format product name for the form
      // If the selected product has a string productName, convert it to the array format
      let formattedProductName;
      if (typeof product.productName === 'string') {
        formattedProductName = [{ id: 1, name: product.productName, type: 1 }];
      } else if (Array.isArray(product.productName)) {
        formattedProductName = product.productName;
      } else {
        formattedProductName = [{ id: 1, name: '', type: 1 }];
      }

      // Format alibaba IDs for the form
      let formattedAlibabaIds;
      if (Array.isArray(product.alibabaIds)) {
        formattedAlibabaIds = product.alibabaIds.map((id, index) => ({
          id: index + 1,
          value: typeof id === 'string' ? id : id.value || '',
          link: typeof id === 'object' && id.link ? id.link : '',
        }));
      } else {
        formattedAlibabaIds = [{ id: 1, value: '', link: '' }];
      }

      // Update the global state with the selected product data
      updateData('id', product.id);
      updateData('productId', product.productId);
      updateData('productName', formattedProductName);
      updateData('category', product.category || []);
      updateData('alibabaIds', formattedAlibabaIds);
      updateData(
        'iconUrl',
        product.iconUrl || 'https://via.placeholder.com/50'
      );

      // Call the parent component's handler if provided
      if (onSelectProduct) {
        onSelectProduct(product);
      }
    },
    [updateData, onSelectProduct]
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
