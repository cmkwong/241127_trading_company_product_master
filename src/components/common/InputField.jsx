import styles from './InputField.module.css';

const InputField = (props) => {
  const { reference, onClick, onBlur, onKeyDown, onChange } = props;
  return (
    <input
      className={styles.inputField}
      type="text"
      ref={reference}
      onClick={onClick}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onChange={onChange}
    />
  );
};

export default InputField;
