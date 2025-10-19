import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_RemarkField.module.css';

const Sub_RemarkField = ({
  id,
  value,
  onValueChange,
  placeholder,
  rows,
  maxLength,
  disabled,
  readOnly,
  resize = 'vertical',
  autoFocus,
  ariaLabel,
  ariaDescribedBy,
}) => {
  const textareaStyle = useMemo(() => {
    const map = {
      none: 'none',
      vertical: 'vertical',
      horizontal: 'horizontal',
      both: 'both',
    };
    return { resize: map[resize] || 'vertical' };
  }, [resize]);

  const handleChange = useCallback(
    (e) => onValueChange(e.target.value),
    [onValueChange]
  );

  return (
    <div className={styles.fieldContainer}>
      <textarea
        id={id}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        style={textareaStyle}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      {typeof maxLength === 'number' && (
        <div className={styles.counter}>
          {value?.length || 0}/{maxLength}
        </div>
      )}
    </div>
  );
};

Sub_RemarkField.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  onValueChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  resize: PropTypes.oneOf(['none', 'vertical', 'horizontal', 'both']),
  autoFocus: PropTypes.bool,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
};

export default Sub_RemarkField;
