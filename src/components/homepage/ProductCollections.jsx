import Header from '../common/Texts/Header';
import Label from '../common/Texts/Label';
import styles from './ProductCollections.module.css';

const MiniSection = ({ title, items }) => {
  return (
    <section className={styles.collectionSection}>
      <div className={styles.sectionTopRow}>
        <Header as="h3" size="S" color="#0c1e36" weight="semibold">
          {title}
        </Header>
        <button type="button" className={styles.moreLink}>
          More
        </button>
      </div>

      <div className={styles.miniGrid}>
        {items.map((item) => (
          <button key={item.id} type="button" className={styles.miniCard}>
            <img
              src={item.image}
              alt="Product item"
              className={styles.miniImage}
            />
            <div className={styles.miniInfo}>
              <Label size="S" weight="bold" className={styles.miniPrice}>
                ${item.price.toFixed(2)}
              </Label>
              <Label size="XS" weight="regular" className={styles.miniMoq}>
                MOQ: {item.moq}
              </Label>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

const ProductCollections = ({ recommendationItems, newArrivalItems }) => {
  return (
    <div className={styles.collectionsWrap}>
      <MiniSection title="Recommendation" items={recommendationItems} />
      <MiniSection title="New Arrivals" items={newArrivalItems} />
    </div>
  );
};

export default ProductCollections;
