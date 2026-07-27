import styles from './DeleteBtn.module.css';

const DeleteBtn = ({
  onClick,
  text = 'Delete',
  ariaLabel,
  title,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      className={`${styles.deleteBtn} ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel || text}
      title={title || text}
      disabled={disabled}
    >
      <svg className={styles.deleteIcon} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.5 4.5h9M6 2.5h4M5 4.5l.5 8h5l.5-8M7 7v3M9 7v3" />
      </svg>
      {text}
    </button>
  );
};

export default DeleteBtn;
