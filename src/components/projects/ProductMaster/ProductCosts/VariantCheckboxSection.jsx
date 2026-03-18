import styles from './VariantCheckboxSection.module.css';

const VariantCheckboxSection = ({
  title,
  options,
  selectedIds,
  getLabel,
  onToggle,
  onAddNew,
}) => {
  return (
    <div className={styles.controlBlock}>
      <div className={styles.groupHeader}>
        <div className={styles.titleWrap}>
          <div className={styles.groupTitle}>{title}</div>
          <div className={styles.countBadge}>{options.length}</div>
        </div>

        <button
          type="button"
          className={styles.addNewBtn}
          onClick={onAddNew}
          aria-label={`Add new ${title.toLowerCase()}`}
          title={`Add New ${title}`}
        >
          <svg
            className={styles.addNewIcon}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 4.5V15.5M4.5 10H15.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Add New
        </button>
      </div>

      <div className={styles.checkboxWrap}>
        {options.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <label
              key={item.id}
              className={`${styles.checkboxItem} ${checked ? styles.checked : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={checked}
                onChange={(e) => onToggle(item.id, e.target.checked)}
              />
              <span className={styles.checkboxLabel}>{getLabel(item)}</span>
            </label>
          );
        })}

        {options.length === 0 && (
          <div className={styles.emptyHint}>No options yet. Click Add New.</div>
        )}
      </div>
    </div>
  );
};

export default VariantCheckboxSection;
