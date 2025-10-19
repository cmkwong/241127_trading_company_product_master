import styles from './TextField.module.css';

const TextField = (props) => {
  const {
    reference,
    onClick,
    onBlur,
    onKeyDown,
    onChange,
    defaultValue,
    value,
  } = props;
  return (
    <div className={styles.inputContainer}>
      <input
        className={styles.inputField}
        type="text"
        ref={reference}
        onClick={onClick}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onChange={onChange}
        defaultValue={defaultValue}
        value={value}
      />
    </div>
  );
};

export default TextField;
