import styles from './ProductItem.module.css';
import {
  getLabelsFromLookup,
  mockCategory,
} from '../../../../datas/Options/ProductOptions';
import ProductIcon from './ProductIcon';
import ProductInfo from './ProductInfo';

const ProductItem = ({ product, isSelected, onClick }) => {
  const productName = product.product_names[0].name; // assume the first name is the main one
  const id = product.id;
  const categoryLabels = getLabelsFromLookup(
    product.product_categories.map((c) => c.category_id),
    mockCategory,
  );

  // Extract alibaba ID values
  const alibabaIdValues =
    product.product_alibaba_ids?.map((item) => item.value) || [];

  // Get the first product image (sorted by display_order if available)
  const getProductImage = () => {
    if (!product.product_images || product.product_images.length === 0) {
      return null;
    }
    
    // Sort by display_order and get the first image
    const sortedImages = [...product.product_images].sort((a, b) => {
      const orderA = parseInt(a.display_order) || 0;
      const orderB = parseInt(b.display_order) || 0;
      return orderA - orderB;
    });
    
    return sortedImages[0]?.image_url || sortedImages[0]?.url;
  };

  const imageUrl = getProductImage();

  return (
    <div
      className={`${styles.productItem} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick(product)}
    >
      <ProductIcon url={imageUrl} alt={productName} />
      <ProductInfo
        name={productName}
        id={id}
        categoryLabels={categoryLabels.join(', ')}
        product_alibaba_ids={alibabaIdValues.join(', ')}
      />
    </div>
  );
};

export default ProductItem;
