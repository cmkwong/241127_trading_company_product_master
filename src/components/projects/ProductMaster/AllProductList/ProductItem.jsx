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

  // Use icon_url for the product list thumbnail
  const imageUrl = product.icon_url;

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
