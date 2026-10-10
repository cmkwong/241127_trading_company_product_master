import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_TextField.module.css';
import Sub_TextField from './Sub_TextField.jsx';
import Label from '../../Texts/Label';

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
    onClick,
    onKeyDown,
    inputRef,

    // Uncontrolled defaults
    defaultValue = '',

    // UI
    label,
    labelPosition = 'top',
    labelSize = 'S',
    labelWeight = 'medium',
    labelColor,
    labelIcon,
    labelClassName = '',
    inputId,
    placeholder = 'Enter text...',
    type = 'text',
    disabled = false,
    required = false,
    maxLength,
    minLength,
    pattern,
    autoComplete,
    autoFocus = false,
    className = '',
    size = 'default',
    height,
    helperText,
    error = false,
    inputSuffix,
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
          <Label
            htmlFor={inputId}
            text={label}
            size={labelSize}
            weight={labelWeight}
            color={labelColor || (error ? '#dc2626' : 'var(--color-primary)')}
            required={required}
            icon={labelIcon}
            className={`${
              labelPosition === 'left'
                ? styles.fieldLabelLeft
                : styles.fieldLabel
            } ${labelClassName}`.trim()}
          />
        )}
        <div className={styles.inputWrapper}>
          <Sub_TextField
            ref={inputRef}
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
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={className}
            size={size}
            height={height}
            onFocus={onFocus}
            onBlur={onBlur}
            onClick={onClick}
            onKeyDown={onKeyDown}
          />
          {inputSuffix}
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
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),

  // Uncontrolled defaults
  value: PropTypes.string,

  // UI
  label: PropTypes.string,
  labelPosition: PropTypes.oneOf(['top', 'left']),
  labelSize: PropTypes.oneOf(['XL', 'L', 'M', 'S', 'XS', 'xl', 'l', 'm', 's', 'xs']),
  labelWeight: PropTypes.oneOf(['regular', 'medium', 'semibold', 'bold']),
  labelColor: PropTypes.string,
  labelIcon: PropTypes.node,
  labelClassName: PropTypes.string,
  inputId: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['default', 'large']),
  height: PropTypes.oneOf(['s', 'm', 'l', 'xl', 'S', 'M', 'L', 'XL']),
  helperText: PropTypes.string,
  error: PropTypes.bool,
  inputSuffix: PropTypes.node,
};

export default Main_TextField;
