import { useRef, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_TextField.module.css';
/**
 * Sub_TextField Component
 * A simple text input field component with cursor position preservation
 */
const Sub_TextField = forwardRef((props, externalRef) => {
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

  const isLinkType = type === 'link';

  const internalRef = useRef(null);
  const cursorPositionRef = useRef(null);
  const previousValueRef = useRef(value);

  // Combine external and internal refs
  const inputRef = externalRef || internalRef;

  // Store cursor position when input changes
  const handleChange = (e) => {
    if (onInputChange) {
      const oldValue = previousValueRef.current;
      const newValue = e.target.value;

      // Save the current cursor position
      cursorPositionRef.current = e.target.selectionStart;

      // Update previous value
      previousValueRef.current = newValue;

      onInputChange(oldValue, newValue);
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
        cursorPositionRef.current,
      );
    }
  }, [value, inputRef]);

  const normalizeLink = (rawValue) => {
    if (!rawValue || typeof rawValue !== 'string') return '';
    const trimmed = rawValue.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleOpenLink = () => {
    const url = normalizeLink(value);
    if (!url) return;

    try {
      const parsed = new URL(url);
      window.open(parsed.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      // Ignore invalid URL input
    }
  };

  const inputElement = (
    <input
      ref={inputRef}
      id={id}
      className={`${styles.textField} ${className}`}
      type={isLinkType ? 'text' : type}
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

  if (!isLinkType) {
    return inputElement;
  }

  return (
    <div className={styles.linkInputContainer}>
      {inputElement}
      <button
        type="button"
        className={styles.openLinkButton}
        onClick={handleOpenLink}
        disabled={disabled || !value?.trim()}
        title="Open link"
        aria-label="Open link"
      >
        <svg
          className={styles.openLinkIcon}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 13L13 7M9 7H13V11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 9.5V13.5H10.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
});
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

// Add displayName for better debugging
Sub_TextField.displayName = 'Sub_TextField';
export default Sub_TextField;
