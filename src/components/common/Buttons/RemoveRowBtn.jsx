import styles from './RemoveRowBtn.module.css';

const RemoveRowBtn = ({
  onClick,
  ariaLabel = 'Remove row',
  title,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      className={`${styles.removeRowBtn} ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      disabled={disabled}
    >
      <span className={styles.removeRowBtnIcon} aria-hidden="true" />
    </button>
  );
};

export default RemoveRowBtn;
