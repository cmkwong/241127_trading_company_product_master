import { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_TextArea.module.css';
import Sub_RemarkField from './Sub_TextArea';

const Main_TextArea = (props) => {
  const {
    // Controlled
    value: controlledValue,
    onChange = () => {}, // onChange({ value, length })

    // Uncontrolled
    defaultValue = '',

    // UI/behavior
    textareaId,
    placeholder = 'Enter remarks...',
    rows = 4,
    maxLength,
    disabled = false,
    readOnly = false,
    resize = 'vertical',
    autoFocus = false,

    // Accessibility
    ariaLabel,
    ariaDescribedBy,
  } = props;

  const makeId = (prefix = 'remark') =>
    `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(
      36
    )}`;

  const autoIdRef = useRef(textareaId || makeId('remark'));
  const resolvedId = textareaId || autoIdRef.current;

  const isControlled = controlledValue !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : innerValue;

  const handleChange = useCallback(
    (nextValue) => {
      if (!isControlled) setInnerValue(nextValue);
      onChange({ value: nextValue, length: nextValue.length });
    },
    [isControlled, onChange]
  );

  return (
    <div className={styles.container} data-testid="remark-textarea">
      <Sub_RemarkField
        id={resolvedId}
        value={currentValue}
        onValueChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        resize={resize}
        autoFocus={autoFocus}
        ariaLabel={ariaLabel}
        ariaDescribedBy={ariaDescribedBy}
      />
    </div>
  );
};

Main_TextArea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
  textareaId: PropTypes.string,
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

export default Main_TextArea;
