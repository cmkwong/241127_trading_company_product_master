import { useState, useEffect } from 'react';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';
import styles from './Main_AllProductList.module.css';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';

// Mock data for products - in a real app, this would come from an API
const mockProducts = [
  {
    id: '1',
    productName: 'Elizabeth Collar Pet Grooming Shield',
    productId: 'PET-001',
    category: ['Pet Accessories', 'Dog Supplies'],
    alibabaIds: ['ALI-12345', 'ALI-67890'],
    iconUrl: 'https://via.placeholder.com/50',
  },
  {
    id: '2',
    productName: 'High Quality Wholesale Pet Dog Toys',
    productId: 'PET-002',
    category: ['Pet Toys', 'Dog Supplies'],
    alibabaIds: ['ALI-23456'],
    iconUrl: 'https://via.placeholder.com/50',
  },
  {
    id: '3',
    productName: 'Waterproof Foldable Seat Protector',
    productId: 'PET-003',
    category: ['Pet Accessories', 'Car Accessories'],
    alibabaIds: ['ALI-34567', 'ALI-45678'],
    iconUrl: 'https://via.placeholder.com/50',
  },
  {
    id: '4',
    productName: 'Pet Water Dispenser Automatic',
    productId: 'PET-004',
    category: ['Pet Feeders', 'Cat Supplies'],
    alibabaIds: ['ALI-56789'],
    iconUrl: 'https://via.placeholder.com/50',
  },
  {
    id: '5',
    productName: 'Pet plush toy simulation duck',
    productId: 'PET-005',
    category: ['Pet Toys', 'Dog Supplies'],
    alibabaIds: ['ALI-67890'],
    iconUrl: 'https://via.placeholder.com/50',
  },
  // Add more mock products to test scrolling
  {
    id: '6',
    productName: 'Durable Plush Eggplant Cat Chew Toy',
    productId: 'PET-006',
    category: ['Pet Toys', 'Cat Supplies'],
    alibabaIds: ['ALI-78901'],
    iconUrl: 'https://via.placeholder.com/50',
  },
  {
    id: '7',
    productName: 'USB Interactive Cat Toys Laser Pen',
    productId: 'PET-007',
    category: ['Pet Toys', 'Cat Supplies'],
    alibabaIds: ['ALI-89012'],
    iconUrl: 'https://via.placeholder.com/50',
  },
  {
    id: '8',
    productName: 'Stainless Steel Blade Free Nail Clipper',
    productId: 'PET-008',
    category: ['Pet Grooming', 'Dog Supplies'],
    alibabaIds: ['ALI-90123'],
    iconUrl: 'https://via.placeholder.com/50',
  },
];

const ProductListItem = ({ product, isSelected, onClick }) => {
  return (
    <div
      className={`${styles.productItem} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick(product)}
    >
      <div className={styles.productIcon}>
        <img src={product.iconUrl} alt={product.productName} />
      </div>
      <div className={styles.productInfo}>
        <div className={styles.productName}>{product.productName}</div>
        <div className={styles.productMeta}>
          <div className={styles.productId}>ID: {product.productId}</div>
          <div className={styles.categories}>{product.category.join(', ')}</div>
        </div>
        <div className={styles.alibabaIds}>
          Alibaba: {product.alibabaIds.join(', ')}
        </div>
      </div>
    </div>
  );
};

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
    updateData('productName', product.productName);
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
      <div className={styles.searchContainer}>
        <Main_TextField
          placeholder="Search products..."
          onChange={handleSearchChange}
          defaultValue={searchTerm}
        />
      </div>

      <div className={styles.productList}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              isSelected={selectedProduct && selectedProduct.id === product.id}
              onClick={handleProductSelect}
            />
          ))
        ) : (
          <div className={styles.noResults}>No products found</div>
        )}
      </div>
    </div>
  );
};

export default Main_AllProductList;
