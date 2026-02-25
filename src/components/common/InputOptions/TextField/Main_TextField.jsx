import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_TextField.module.css';
import Sub_TextField from './Sub_TextField.jsx';

/**
 * Main_TextField Component
 * A wrapper component for the text input field with label and additional features
 */
const Main_TextField = (props) => {
  const {
    // Callbacks
    onChange = () => {},
    onFocus,
    onBlur,

    // Uncontrolled defaults
    defaultValue = '',

    // UI
    label,
    labelPosition = 'top',
    inputId,
    placeholder = 'Enter text...',
    type = 'text',
    disabled = false,
    required = false,
    maxLength,
    minLength,
    pattern,
    autoFocus = false,
    className = '',
    helperText,
    error = false,
  } = props;

  // Internal state
  // this useState will not run again when the value prop changes, so we need to use useEffect to update it when the value prop changes
  const [internalValue, setInternalValue] = useState(defaultValue);

  useEffect(() => {
    setInternalValue(defaultValue);
  }, [defaultValue]);

  // Handle input change
  const handleInputChange = useCallback(
    (ov, nv) => {
      setInternalValue(nv);
      onChange(ov, nv);
    },
    [onChange],
  );

  return (
    <div
      className={`${styles.textFieldContainer} ${error ? styles.error : ''}`}
    >
      <div
        className={`${styles.fieldRow} ${
          labelPosition === 'left' ? styles.labelLeft : styles.labelTop
        }`}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={`${styles.label} ${required ? styles.required : ''}`}
          >
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <Sub_TextField
            id={inputId}
            value={internalValue}
            onInputChange={handleInputChange}
            placeholder={placeholder}
            type={type}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            autoFocus={autoFocus}
            className={className}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      </div>
      {helperText && (
        <div
          className={`${styles.helperText} ${error ? styles.errorText : ''}`}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

Main_TextField.propTypes = {
  // Callbacks
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,

  // Uncontrolled defaults
  value: PropTypes.string,

  // UI
  label: PropTypes.string,
  labelPosition: PropTypes.oneOf(['top', 'left']),
  inputId: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.bool,
};

export default Main_TextField;
