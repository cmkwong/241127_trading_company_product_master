import { useRef } from 'react';
import styles from './Sub_TagTextField.module.css';

const Sub_TagTextField = (props) => {
  const {
    reference,
    onClick,
    onBlur,
    onKeyDown,
    onChange,
    defaultValue,
    value,
  } = props;

  const previousValueRef = useRef(value || defaultValue || '');

  const handleChange = (e) => {
    if (onChange) {
      const oldValue = previousValueRef.current;
      const newValue = e.target.value;

      // Update previous value
      previousValueRef.current = newValue;

      onChange(oldValue, newValue);
    }
  };

  return (
    <div className={styles.inputContainer}>
      <input
        className={styles.inputField}
        type="text"
        ref={reference}
        onClick={onClick}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onChange={handleChange}
        defaultValue={defaultValue}
        value={value}
      />
    </div>
  );
};

export default Sub_TagTextField;
