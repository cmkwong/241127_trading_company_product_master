import styles from './Main_AllProductList.module.css';

const ProductItem = ({ product, isSelected, onClick }) => {
  return (
    <div
      className={`${styles.productItem} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick(product)}
    >
      <ProductIcon url={product.iconUrl} alt={product.productName[0].name} />
      <ProductInfo
        name={product.productName[0].name}
        id={product.productId}
        categories={product.category}
        alibabaIds={product.alibabaIds}
      />
    </div>
  );
};

const ProductIcon = ({ url, alt }) => {
  return (
    <div className={styles.productIcon}>
      <img src={url} alt={alt} />
    </div>
  );
};

const ProductInfo = ({ name, id, categories, alibabaIds }) => {
  return (
    <div className={styles.productInfo}>
      <div className={styles.productName}>{name}</div>
      <div className={styles.productMeta}>
        <div className={styles.productId}>ID: {id}</div>
        <div className={styles.categories}>{categories.join(', ')}</div>
      </div>
      <div className={styles.alibabaIds}>Alibaba: {alibabaIds.join(', ')}</div>
    </div>
  );
};

export default ProductItem;
