import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_TextField.module.css';
import Sub_TextField from './Sub_TextField.jsx';

/**
 * Main_TextField Component
 * A wrapper component for the text input field with label and additional features
 */
const Main_TextField = (props) => {
  const {
    // Controlled props
    value: controlledValue,

    // Callbacks
    onChange = () => {},

    // Uncontrolled defaults
    defaultValue = '',

    // UI
    label,
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

  // Internal state for uncontrolled mode
  const [innerValue, setInnerValue] = useState(defaultValue);

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;

  // Resolve current value
  const inputValue = isControlled ? controlledValue : innerValue;

  // Handle input change
  const handleInputChange = useCallback(
    (newValue) => {
      if (!isControlled) {
        setInnerValue(newValue);
      }
      onChange(newValue);
    },
    [isControlled, onChange]
  );

  return (
    <div
      className={`${styles.textFieldContainer} ${error ? styles.error : ''}`}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={`${styles.label} ${required ? styles.required : ''}`}
        >
          {label}
        </label>
      )}
      <Sub_TextField
        id={inputId}
        value={inputValue}
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
      />
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
  // Controlled props
  value: PropTypes.string,

  // Callbacks
  onChange: PropTypes.func,

  // Uncontrolled defaults
  defaultValue: PropTypes.string,

  // UI
  label: PropTypes.string,
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
