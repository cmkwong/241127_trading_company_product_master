import styles from './AddNewBtn.module.css';

const AddNewBtn = ({
  onClick,
  text = 'Add New',
  ariaLabel,
  title,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      className={`${styles.addNewBtn} ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel || text}
      title={title || text}
      disabled={disabled}
    >
      <svg
        className={styles.addNewIcon}
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 1.5V12.5M1.5 7H12.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {text}
    </button>
  );
};

export default AddNewBtn;
