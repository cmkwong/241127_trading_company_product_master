import Header from '../../common/Texts/Header';
import Label from '../../common/Texts/Label';
import styles from './CategoryPanel.module.css';

const CategoryPanel = ({ categories, activeId, onSelect }) => {
  return (
    <section className={styles.categoryPanel}>
      <button type="button" className={styles.allCategoriesButton}>
        <span className={styles.gridIcon} aria-hidden="true">
          <svg viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="4" height="4" fill="currentColor" />
            <rect x="9" y="1" width="4" height="4" fill="currentColor" />
            <rect x="1" y="9" width="4" height="4" fill="currentColor" />
            <rect x="9" y="9" width="4" height="4" fill="currentColor" />
          </svg>
        </span>
        <Header as="h3" size="S" color="#ffffff" weight="medium">
          All Categories
        </Header>
      </button>

      <div className={styles.listScroller}>
        {categories.map((category) => {
          const isActive = category.id === activeId;

          return (
            <button
              key={category.id}
              type="button"
              className={`${styles.categoryRow} ${isActive ? styles.categoryRowActive : ''}`}
              onClick={() => onSelect(category.id)}
            >
              <Label className={styles.categoryName} size="S" weight="medium">
                {category.name}
              </Label>
              <Label className={styles.categoryHint} size="XS" weight="regular">
                {category.keywords}
              </Label>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryPanel;
