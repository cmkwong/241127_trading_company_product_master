import styles from './SearchSideBarList.module.css';

const SearchSideBarListInfo = ({ title, rows = [] }) => {
  return (
    <div className={styles.itemInfo}>
      <h3 className={styles.itemTitle}>{title}</h3>
      <div className={styles.itemDetails}>
        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} className={styles.detailItem}>
            <span className={styles.detailLabel}>{row.label}</span>
            <span className={styles.detailValue}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchSideBarListInfo;
