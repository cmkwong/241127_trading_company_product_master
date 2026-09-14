import styles from './Button.module.css';

const Button = ({
  text,
  onClick,
  className = '',
  active = false,
  disabled = false,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={`${styles.button} ${active ? styles.buttonActive : ''} ${
        disabled ? styles.buttonDisabled : ''
      } ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
