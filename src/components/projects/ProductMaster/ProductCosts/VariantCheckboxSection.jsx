import styles from './VariantCheckboxSection.module.css';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';

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

        <AddNewBtn
          onClick={onAddNew}
          ariaLabel={`Add new ${title.toLowerCase()}`}
          title={`Add New ${title}`}
        />
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
