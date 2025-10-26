import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_TextField.module.css';

/**
 * Sub_TextField Component
 * A simple text input field component
 */
const Sub_TextField = (props) => {
  const {
    id,
    value = '',
    onInputChange,
    placeholder = 'Enter text...',
    type = 'text',
    disabled = false,
    required = false,
    maxLength,
    minLength,
    pattern,
    autoFocus = false,
    className = '',
    onFocus,
    onBlur,
  } = props;

  const handleChange = (e) => {
    if (onInputChange) {
      onInputChange(e.target.value);
    }
  };

  return (
    <input
      id={id}
      className={`${styles.textField} ${className}`}
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      maxLength={maxLength}
      minLength={minLength}
      pattern={pattern}
      autoFocus={autoFocus}
      onFocus={onFocus}
      onBlur={onBlur}
      data-testid="sub-text-field"
    />
  );
};

Sub_TextField.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  onInputChange: PropTypes.func,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

export default Sub_TextField;
