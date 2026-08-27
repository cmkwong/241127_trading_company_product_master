import PropTypes from 'prop-types';
import styles from './Sub_DateField.module.css';
import Main_TextField from '../TextField/Main_TextField';

const Sub_DateInputField = ({
  id,
  inputValue,
  inputInvalid,
  placeholder,
  open,
  disabled = false,
  onInputChange,
  onInputBlur,
  onInputKeyDown,
  onToggleCalendar,
}) => {
  return (
    <div className={styles.inputWrap}>
      <div className={styles.dateFieldWrap}>
        <Main_TextField
          defaultValue={inputValue}
          onChange={onInputChange}
          inputId={id}
          placeholder={placeholder}
          type="text"
          disabled={disabled}
          autoComplete="off"
          error={inputInvalid}
          helperText={inputInvalid ? 'Use YYYY-MM-DD or YYYYMMDD.' : ''}
          onBlur={onInputBlur}
          onKeyDown={onInputKeyDown}
          className={styles.dateFieldInput}
        />
      </div>
      <button
        type="button"
        className={styles.calendarButton}
        aria-label="Open calendar"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={onToggleCalendar}
      >
        <svg
          className={styles.calendarIcon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 3V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 3V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
};

Sub_DateInputField.propTypes = {
  id: PropTypes.string.isRequired,
  inputValue: PropTypes.string.isRequired,
  inputInvalid: PropTypes.bool.isRequired,
  placeholder: PropTypes.string,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onInputChange: PropTypes.func.isRequired, // (oldValue, newValue)
  onInputBlur: PropTypes.func.isRequired,
  onInputKeyDown: PropTypes.func.isRequired,
  onToggleCalendar: PropTypes.func.isRequired,
};

export default Sub_DateInputField;
