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
      {text}
    </button>
  );
};

export default DeleteBtn;
