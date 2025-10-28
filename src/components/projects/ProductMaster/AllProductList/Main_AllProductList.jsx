import { useState, useEffect } from 'react';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';
import styles from './Main_AllProductList.module.css';
import SearchBar from './SearchBar';
import ProductList from './ProductList';
import { mockProducts } from '../../../../datas/Products/mockProducts';

const Main_AllProductList = ({ onSelectProduct }) => {
  const { updateData } = useSavePageData();
  const [products] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleProductSelect = (product) => {
    setSelectedProduct(product);

    // Update the global state with the selected product data
    updateData('productName', product.productName[0].name);
    updateData('productId', product.productId);
    updateData('category', product.category);
    updateData('alibabaIds', product.alibabaIds);

    // Call the parent component's handler if provided
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

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
