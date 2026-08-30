import Header from '../../common/Texts/Header';
import HomeProductCard from './HomeProductCard';
import styles from './ProductsSection.module.css';

const ProductsSection = ({ products }) => {
  return (
    <section className={styles.productsSection}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <Header as="h2" size="M" color="#0c1e36" weight="bold">
            EXPORTER & MANUFACTURER DIRECT DIRECTORY
          </Header>
          <span className={styles.pulse} aria-hidden="true" />
        </div>
        <button type="button" className={styles.sortButton}>
          Sort by: Hot Selling
        </button>
      </div>

      <div className={styles.gridScroller}>
        <div className={styles.productsGrid}>
          {products.map((item) => (
            <HomeProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
