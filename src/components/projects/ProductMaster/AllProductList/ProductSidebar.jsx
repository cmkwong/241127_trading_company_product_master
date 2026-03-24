import { useState, useEffect, useCallback } from 'react';
import styles from './ProductSidebar.module.css';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';

const ProductSidebar = ({ onSelectProduct, isCollapsed, onToggleCollapse }) => {
  const { getProductData, products, createNewProduct, selectedProductId } =
    useProductContext();
  const { category } = useMasterContext();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const currentProductList = Array.isArray(products)
      ? products
      : products?.products || [];

    if (!searchTerm.trim()) {
      setFilteredProducts(currentProductList);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = currentProductList.filter(
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

  // Handle product selection
  const handleProductSelect = useCallback(
    (product) => {
      const getProductDataSuccess = getProductData(product.id);
      if (!getProductDataSuccess) return;

      // On mobile, collapse the sidebar after selection
      if (windowWidth <= 768) {
        onToggleCollapse(true);
      }

      // Pass the selected product to the parent component
      if (onSelectProduct) {
        onSelectProduct(product);
      }
    },
    [getProductData, windowWidth, onToggleCollapse, onSelectProduct],
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleCreateProduct = () => {
    createNewProduct();
  };

  const getProductName = useCallback(
    (product) => product?.product_names?.[0]?.name || '',
    [],
  );

  const getProductRows = useCallback(
    (product) => {
      const categoryLabels =
        product?.product_categories
          ?.map((c) => c.category_id)
          .map((categoryId) => {
            const item = category.find(
              (lookupItem) => lookupItem.id === categoryId,
            );
            return item?.label || item?.name || `Unknown (${categoryId})`;
          }) || [];

      const alibabaIdValues =
        product?.product_alibaba_ids
          ?.map((item) => item.value)
          .filter(Boolean) || [];

      return [
        { label: 'ID:', value: product?.id || '' },
        { label: 'Categories:', value: categoryLabels.join(', ') },
        { label: 'Alibaba:', value: alibabaIdValues.join(', ') },
      ];
    },
    [category],
  );

  // Track window resize for responsive behavior
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <>
      <div
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      >
        <SearchSideBarList
          items={filteredProducts}
          selectedItemId={selectedProductId}
          onSelectItem={handleProductSelect}
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search products..."
          onCreate={handleCreateProduct}
          createButtonTitle="Create New Product"
          createButtonAriaLabel="Create New Product"
          noResultsMessage="No products found"
          getItemId={(product) => product.id}
          getItemTitle={getProductName}
          getItemRows={getProductRows}
          getItemIconUrl={(product) => product.icon_url}
          getItemIconAlt={getProductName}
        />
      </div>

      {/* Toggle button for sidebar */}
      <div
        className={`${styles.sidebarToggle} ${
          isCollapsed ? styles.collapsed : ''
        }`}
        onClick={() => onToggleCollapse(!isCollapsed)}
      >
        {isCollapsed ? '›' : '‹'}
      </div>
    </>
  );
};

export default ProductSidebar;
