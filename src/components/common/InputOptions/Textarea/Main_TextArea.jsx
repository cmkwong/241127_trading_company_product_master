import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_TextArea.module.css';
import Sub_RemarkField from './Sub_TextArea';
import Label from '../../Texts/Label';

// Lazy-loaded so Quill and its global stylesheet are only pulled in
// when a consumer opts into rich text mode (richText=true).
const Sub_RichTextArea = lazy(() => import('./Sub_RichTextArea'));

const Main_TextArea = (props) => {
  const {
    // Callbacks
    onChange = () => {},

    // Uncontrolled
    defaultValue = '',

    // UI/behavior
    label,
    labelPosition = 'top',
    labelSize = 'S',
    labelWeight = 'medium',
    labelColor,
    labelIcon,
    labelClassName = '',
    textareaId,
    placeholder = 'Enter remarks...',
    rows = 4,
    maxLength,
    fullHeight = false,
    disabled = false,
    readOnly = false,
    resize = 'vertical',
    autoFocus = false,

    // Rich text mode (opt-in, default off)
    richText = false,
    richTextToolbar,

    // Accessibility
    ariaLabel,
    ariaDescribedBy,
  } = props;

  const makeId = (prefix = 'remark') =>
    `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(
      36,
    )}`;

  const autoIdRef = useRef(textareaId || makeId('remark'));
  const resolvedId = textareaId || autoIdRef.current;

  // Simple uncontrolled state
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (newValue) => {
    const oldValue = value;
    setValue(newValue);
    onChange(oldValue, newValue);
  };

  return (
    <div
      className={`${styles.container} ${fullHeight ? styles.fullHeight : ''}`}
      data-testid="remark-textarea"
    >
      <div
        className={`${styles.fieldRow} ${
          labelPosition === 'left' ? styles.labelLeft : styles.labelTop
        }`}
      >
        {label && (
          <Label
            htmlFor={resolvedId}
            text={label}
            size={labelSize}
            weight={labelWeight}
            color={labelColor}
            icon={labelIcon}
            className={`${
              labelPosition === 'left'
                ? styles.fieldLabelLeft
                : styles.fieldLabel
            } ${labelClassName}`.trim()}
          />
        )}
        {richText ? (
          <Suspense
            fallback={<div className={styles.richFallback} aria-hidden="true" />}
          >
            <Sub_RichTextArea
              id={resolvedId}
              value={value}
              onValueChange={handleChange}
              placeholder={placeholder}
              maxLength={maxLength}
              fullHeight={fullHeight}
              disabled={disabled}
              readOnly={readOnly}
              autoFocus={autoFocus}
              ariaLabel={ariaLabel}
              ariaDescribedBy={ariaDescribedBy}
              toolbar={richTextToolbar}
            />
          </Suspense>
        ) : (
          <Sub_RemarkField
            id={resolvedId}
            value={value}
            onValueChange={handleChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            fullHeight={fullHeight}
            disabled={disabled}
            readOnly={readOnly}
            resize={resize}
            autoFocus={autoFocus}
            ariaLabel={ariaLabel}
            ariaDescribedBy={ariaDescribedBy}
          />
        )}
      </div>
    </div>
  );
};

Main_TextArea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
  label: PropTypes.string,
  labelPosition: PropTypes.oneOf(['top', 'left']),
  labelSize: PropTypes.oneOf(['XL', 'L', 'M', 'S', 'XS', 'xl', 'l', 'm', 's', 'xs']),
  labelWeight: PropTypes.oneOf(['regular', 'medium', 'semibold', 'bold']),
  labelColor: PropTypes.string,
  labelIcon: PropTypes.node,
  labelClassName: PropTypes.string,
  textareaId: PropTypes.string,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  fullHeight: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  resize: PropTypes.oneOf(['none', 'vertical', 'horizontal', 'both']),
  autoFocus: PropTypes.bool,
  richText: PropTypes.bool,
  richTextToolbar: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
};

export default Main_TextArea;
