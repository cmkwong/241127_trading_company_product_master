import styles from './InputField.module.css';

const InputField = (props) => {
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
  );
};

export default InputField;
