import styles from './ProductIcon.module.css';

const ProductIcon = ({ url, alt }) => {
  return (
    <div className={styles.productIcon}>
      {url ? (
        <img src={url} alt={alt} />
      ) : (
        <div className={styles.placeholderIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ProductIcon;