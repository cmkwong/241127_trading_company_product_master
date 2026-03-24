import PropTypes from 'prop-types';
import styles from './Sub_DateField.module.css';

const Sub_DateInputField = ({
  id,
  inputValue,
  inputInvalid,
  placeholder,
  open,
  onInputChange,
  onInputBlur,
  onInputKeyDown,
  onToggleCalendar,
}) => {
  return (
    <div className={styles.inputWrap}>
      <input
        id={id}
        type="text"
        className={`${styles.input} ${inputInvalid ? styles.inputInvalid : ''}`}
        value={inputValue}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="off"
        aria-invalid={inputInvalid}
        aria-describedby={inputInvalid ? `${id}-date-help` : undefined}
        onChange={onInputChange}
        onBlur={onInputBlur}
        onKeyDown={onInputKeyDown}
      />
      <button
        type="button"
        className={styles.calendarButton}
        aria-label="Open calendar"
        aria-haspopup="dialog"
        aria-expanded={open}
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
  onInputChange: PropTypes.func.isRequired,
  onInputBlur: PropTypes.func.isRequired,
  onInputKeyDown: PropTypes.func.isRequired,
  onToggleCalendar: PropTypes.func.isRequired,
};

export default Sub_DateInputField;
