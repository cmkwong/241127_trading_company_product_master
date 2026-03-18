import styles from './AddNewBtn.module.css';

const AddNewBtn = ({
  onClick,
  text = 'Add New',
  ariaLabel,
  title,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`${styles.addNewBtn} ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel || text}
      title={title || text}
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
      {text}
    </button>
  );
};

export default AddNewBtn;
