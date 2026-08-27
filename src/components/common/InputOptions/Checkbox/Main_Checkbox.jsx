import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_Checkbox.module.css';
import Label from '../../Texts/Label';

const SIZE_BOX = {
  S: 14,
  M: 16,
  L: 20,
};

/**
 * Main_Checkbox Component
 * Accessible, controlled checkbox wrapping the native input.
 *
 * checked: controlled boolean value.
 * onChange: (checked, event) => void — receives the next boolean and the
 *           original change event from the native input.
 * indeterminate: visual "partial" state (for select-all headers); set via
 *           the underlying ref since the native checkbox has no attribute.
 * size: S | M | L — controls box and label font size.
 */
const Main_Checkbox = ({
  checked = false,
  onChange = () => {},
  onClick = () => {},
  label,
  labelPosition = 'right',
  disabled = false,
  indeterminate = false,
  id,
  name,
  ariaLabel,
  size = 'M',
  helperText,
  error = false,
  className = '',
  inputRef,
}) => {
  const normalizedSize = String(size || 'M')
    .trim()
    .toUpperCase();
  const resolvedSize = SIZE_BOX[normalizedSize] ? normalizedSize : 'M';

  const internalRef = useRef(null);
  const resolvedRef = inputRef || internalRef;

  useEffect(() => {
    if (resolvedRef?.current) {
      resolvedRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate, resolvedRef]);

  const handleChange = (event) => {
    if (typeof onChange === 'function') {
      onChange(event.target.checked, event);
    }
  };

  const labelContent = label ? <Label>{label}</Label> : null;

  return (
    <div
      className={`${styles.checkboxContainer} ${
        error ? styles.errorWrapper : ''
      } ${className}`.trim()}
      onClick={onClick}
    >
      <Label
        className={`${styles.fieldRow} ${
          labelPosition === 'left' ? styles.labelLeft : styles.labelRight
        } ${disabled ? styles.disabled : ''}`.trim()}
      >
        {labelPosition === 'left' && labelContent}
        <input
          ref={resolvedRef}
          id={id}
          name={name}
          type="checkbox"
          className={styles.input}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          aria-label={
            ariaLabel || (typeof label === 'string' ? label : undefined)
          }
          data-size={resolvedSize}
        />
        <span className={styles.checkmark} aria-hidden="true" />
        {labelPosition === 'right' && labelContent}
      </Label>
      {helperText && (
        <div
          className={`${styles.helperText} ${
            error ? styles.errorText : ''
          }`.trim()}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

Main_Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  label: PropTypes.node,
  labelPosition: PropTypes.oneOf(['right', 'left']),
  disabled: PropTypes.bool,
  indeterminate: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  ariaLabel: PropTypes.string,
  size: PropTypes.oneOf(['S', 'M', 'L', 's', 'm', 'l']),
  helperText: PropTypes.string,
  error: PropTypes.bool,
  className: PropTypes.string,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};

export default Main_Checkbox;
