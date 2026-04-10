import styles from './SearchSideBarList.module.css';

const SIDEBAR_KEYWORD_MAX_CHARS = 100;

const normalizeRowLabel = (label) =>
  String(label || '')
    .replace(/:\s*$/, '')
    .trim()
    .toLowerCase();

const getSidebarRowDisplay = (row) => {
  const rawValue = row?.value;
  const label = normalizeRowLabel(row?.label);
  const valueText =
    typeof rawValue === 'string' || typeof rawValue === 'number'
      ? String(rawValue)
      : '';

  if (!label.includes('keyword')) {
    return {
      displayValue: rawValue,
      fullText: valueText,
      isTruncated: false,
    };
  }

  if (!valueText || valueText.length <= SIDEBAR_KEYWORD_MAX_CHARS) {
    return {
      displayValue: valueText,
      fullText: valueText,
      isTruncated: false,
    };
  }

  return {
    displayValue: `${valueText.slice(0, SIDEBAR_KEYWORD_MAX_CHARS)}...`,
    fullText: valueText,
    isTruncated: true,
  };
};

const SearchSideBarListInfo = ({ title, rows = [] }) => {
  return (
    <div className={styles.itemInfo}>
      <h3 className={styles.itemTitle}>{title}</h3>
      <div className={styles.itemDetails}>
        {rows.map((row, index) => {
          const rowView = getSidebarRowDisplay(row);

          return (
            <div key={`${row.label}-${index}`} className={styles.detailItem}>
              <span className={styles.detailLabel}>{row.label}</span>
              <span
                className={styles.detailValue}
                title={rowView.isTruncated ? rowView.fullText : undefined}
              >
                {rowView.displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchSideBarListInfo;
