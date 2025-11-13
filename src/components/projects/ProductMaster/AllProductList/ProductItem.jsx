import styles from './ProductItem.module.css';
import {
  getLabelsFromLookup,
  mockCategory,
} from '../../../../datas/Options/ProductOptions';
import ProductIcon from './ProductIcon';
import ProductInfo from './ProductInfo';

const ProductItem = ({ product, isSelected, onClick }) => {
  const productName = product.productNames[0].name;
  const productId = product.productId;
  const categoryLabels = getLabelsFromLookup(product.category, mockCategory);

  // Extract alibaba ID values
  const alibabaIdValues = product.alibabaIds.map((item) => item.value);

  return (
    <div
      className={`${styles.productItem} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick(product)}
    >
      <ProductIcon url={product.iconUrl} alt={productName} />
      <ProductInfo
        name={productName}
        id={productId}
        categoryLabels={categoryLabels.join(', ')}
        alibabaIds={alibabaIdValues.join(', ')}
      />
    </div>
  );
};

export default ProductItem;
