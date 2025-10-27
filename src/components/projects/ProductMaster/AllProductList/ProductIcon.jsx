import styles from './ProductIcon.module.css';

const ProductIcon = ({ url, alt }) => {
  return (
    <div className={styles.productIcon}>
      <img src={url} alt={alt} />
    </div>
  );
};

export default ProductIcon;