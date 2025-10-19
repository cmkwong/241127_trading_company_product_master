import styles from './Sub_SuggestTextField.module.css';

const Sub_SuggestTextField = (props) => {
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

export default Sub_SuggestTextField;
