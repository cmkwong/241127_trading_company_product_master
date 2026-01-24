import styles from './ProductInfo.module.css';

const ProductInfo = ({ name, id, categoryLabels, product_alibaba_ids }) => {
  return (
    <div className={styles.productInfo}>
      {/* Product Name - Larger and more prominent */}
      <h3 className={styles.productName}>{name}</h3>

      {/* Product Details - Organized in a grid layout */}
      <div className={styles.productDetails}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>ID:</span>
          <span className={styles.detailValue}>{id}</span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Categories:</span>
          <span className={styles.detailValue}>{categoryLabels}</span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Alibaba:</span>
          <span className={styles.detailValue}>{product_alibaba_ids}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
