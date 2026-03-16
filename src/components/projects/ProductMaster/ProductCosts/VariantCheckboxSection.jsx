import AddStackBtn from '../../../common/AddStackBtn';
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
        <div className={styles.groupTitle}>{title}</div>
        <AddStackBtn txt="Add New" handleClick={onAddNew} />
      </div>

      <div className={styles.checkboxWrap}>
        {options.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <label key={item.id} className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggle(item.id, e.target.checked)}
              />
              <span>{getLabel(item)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default VariantCheckboxSection;
