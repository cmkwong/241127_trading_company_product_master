import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './CursorPreservingInput.module.css';

/**
 * CursorPreservingInput Component
 *
 * A text input component that preserves cursor position when typing
 * in the middle of text in controlled input scenarios.
 */
const CursorPreservingInput = (props) => {
  const {
    id,
    value = '',
    onChange,
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
    style,
    name,
    autoComplete = 'off',
    ...otherProps
  } = props;

  const inputRef = useRef(null);
  const cursorPositionRef = useRef(null);

  // Store cursor position when input changes
  const handleChange = (e) => {
    if (onChange) {
      // Save the current cursor position
      cursorPositionRef.current = e.target.selectionStart;
      onChange(e.target.value);
    }
  };

  // Restore cursor position after render
  useEffect(() => {
    if (
      inputRef.current &&
      cursorPositionRef.current !== null &&
      document.activeElement === inputRef.current &&
      inputRef.current.value.length >= cursorPositionRef.current
    ) {
      inputRef.current.setSelectionRange(
        cursorPositionRef.current,
        cursorPositionRef.current
      );
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      id={id}
      className={`${styles.input} ${className}`}
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
      style={style}
      name={name}
      autoComplete={autoComplete}
      {...otherProps}
      data-testid="cursor-preserving-input"
    />
  );
};

CursorPreservingInput.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
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
  style: PropTypes.object,
  name: PropTypes.string,
  autoComplete: PropTypes.string,
};

export default CursorPreservingInput;
