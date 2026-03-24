import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_DateField.module.css';
import Sub_DateInputField from './Sub_DateInputField';
import Sub_DateCalendarPopover from './Sub_DateCalendarPopover';
import {
  buildCalendar,
  formatDate,
  parseDateInput,
  stripTime,
} from './dateHelpers';

const Sub_DateField = ({
  id,
  defaultValue,
  displayValue,
  onSelect,
  placeholder,
  minDate,
  maxDate,
  disableDate,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(displayValue || '');
  const [inputInvalid, setInputInvalid] = useState(false);
  const [viewDate, setViewDate] = useState(() =>
    stripTime(defaultValue || new Date()),
  );
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (defaultValue) setViewDate(stripTime(defaultValue));
  }, [defaultValue]);

  useEffect(() => {
    setInputValue(displayValue || '');
    setInputInvalid(false);
  }, [displayValue]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      const target = e.target;
      const clickedInsideField = containerRef.current.contains(target);
      const clickedInsidePopover = popoverRef.current?.contains(target);
      if (!clickedInsideField && !clickedInsidePopover) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const updatePopoverPosition = useCallback(() => {
    const anchor = containerRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    setPopoverPosition({
      top: rect.bottom + 6,
      left: rect.left,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePopoverPosition();

    const onEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);
    document.addEventListener('keydown', onEscape);

    return () => {
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open, updatePopoverPosition]);

  const prevMonth = useCallback(() => {
    setViewDate((d) => {
      const nd = new Date(d);
      nd.setMonth(nd.getMonth() - 1);
      return stripTime(nd);
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate((d) => {
      const nd = new Date(d);
      nd.setMonth(nd.getMonth() + 1);
      return stripTime(nd);
    });
  }, []);

  const isDateDisabled = useCallback(
    (d) => {
      if (!d) return false;
      const day = stripTime(d);
      if (minDate && day < stripTime(minDate)) return true;
      if (maxDate && day > stripTime(maxDate)) return true;
      if (disableDate && disableDate(day)) return true;
      return false;
    },
    [minDate, maxDate, disableDate],
  );

  const { monthLabel, weeks } = useMemo(
    () => buildCalendar(viewDate),
    [viewDate],
  );

  const applyTextDate = useCallback(
    (rawValue) => {
      const text = String(rawValue || '').trim();

      if (!text) {
        onSelect(undefined);
        setInputValue('');
        setInputInvalid(false);
        return true;
      }

      const parsed = parseDateInput(text);
      if (!parsed || isDateDisabled(parsed)) {
        setInputInvalid(true);
        return false;
      }

      const normalized = formatDate(parsed);
      setInputValue(normalized);
      setViewDate(parsed);
      onSelect(parsed);
      setInputInvalid(false);
      return true;
    },
    [onSelect, isDateDisabled],
  );

  const handleInputBlur = useCallback(() => {
    const ok = applyTextDate(inputValue);
    if (!ok) {
      setInputValue(displayValue || '');
      setInputInvalid(false);
    }
  }, [applyTextDate, inputValue, displayValue]);

  const handleInputKeyDown = useCallback(
    (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();

      const ok = applyTextDate(inputValue);
      if (!ok) {
        setInputValue(displayValue || '');
        setInputInvalid(false);
      }
    },
    [applyTextDate, inputValue, displayValue],
  );

  const handleSelectFromCalendar = useCallback(
    (date) => {
      setInputValue(formatDate(date));
      setInputInvalid(false);
      setViewDate(stripTime(date));
      onSelect(date);
      setOpen(false);
    },
    [onSelect],
  );

  return (
    <div className={styles.fieldContainer} ref={containerRef}>
      <Sub_DateInputField
        id={id}
        inputValue={inputValue}
        inputInvalid={inputInvalid}
        placeholder={placeholder}
        open={open}
        onInputChange={(event) => {
          setInputValue(event.target.value);
          if (inputInvalid) setInputInvalid(false);
        }}
        onInputBlur={handleInputBlur}
        onInputKeyDown={handleInputKeyDown}
        onToggleCalendar={() => setOpen((v) => !v)}
      />
      {inputInvalid && (
        <div id={`${id}-date-help`} className={styles.errorText}>
          Use YYYY-MM-DD or YYYYMMDD.
        </div>
      )}
      <Sub_DateCalendarPopover
        open={open}
        popoverRef={popoverRef}
        label={label}
        popoverPosition={popoverPosition}
        monthLabel={monthLabel}
        id={id}
        weeks={weeks}
        defaultValue={defaultValue}
        isDateDisabled={isDateDisabled}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onSelectDate={handleSelectFromCalendar}
      />
    </div>
  );
};

Sub_DateField.propTypes = {
  id: PropTypes.string.isRequired,
  defaultValue: PropTypes.instanceOf(Date),
  displayValue: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  disableDate: PropTypes.func,
  label: PropTypes.string,
};

export default Sub_DateField;
