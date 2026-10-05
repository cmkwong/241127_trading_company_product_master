import styles from './RemoveRowBtn.module.css';

const FIGMA_REMOVE_ICON = '/assets/figma/icon-cross-red.svg';

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
      <img
        src={FIGMA_REMOVE_ICON}
        alt=""
        className={styles.removeRowBtnIcon}
        aria-hidden="true"
      />
    </button>
  );
};

export default RemoveRowBtn;
