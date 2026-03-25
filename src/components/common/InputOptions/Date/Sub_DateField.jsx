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
  disabled = false,
  enableTime = false,
  includeSeconds = false,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(displayValue || '');
  const [inputInvalid, setInputInvalid] = useState(false);
  const [viewDate, setViewDate] = useState(() =>
    stripTime(defaultValue || new Date()),
  );
  const [timeValue, setTimeValue] = useState(() => {
    if (!defaultValue || isNaN(defaultValue.getTime())) return '00:00';
    const hh = String(defaultValue.getHours()).padStart(2, '0');
    const mm = String(defaultValue.getMinutes()).padStart(2, '0');
    const ss = String(defaultValue.getSeconds()).padStart(2, '0');
    return includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  });
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (defaultValue) setViewDate(stripTime(defaultValue));
  }, [defaultValue]);

  useEffect(() => {
    if (!enableTime) return;
    if (!defaultValue || isNaN(defaultValue.getTime())) {
      setTimeValue('00:00');
      return;
    }
    const hh = String(defaultValue.getHours()).padStart(2, '0');
    const mm = String(defaultValue.getMinutes()).padStart(2, '0');
    const ss = String(defaultValue.getSeconds()).padStart(2, '0');
    setTimeValue(includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`);
  }, [defaultValue, enableTime, includeSeconds]);

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

      let parsed;

      if (enableTime) {
        const dateTimeMatch = text.match(
          /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
        );
        if (dateTimeMatch) {
          const year = Number(dateTimeMatch[1]);
          const month = Number(dateTimeMatch[2]);
          const day = Number(dateTimeMatch[3]);
          const hh = Number(dateTimeMatch[4] ?? timeValue.split(':')[0] ?? 0);
          const mm = Number(dateTimeMatch[5] ?? timeValue.split(':')[1] ?? 0);
          const ss = Number(dateTimeMatch[6] ?? timeValue.split(':')[2] ?? 0);

          if (
            month >= 1 &&
            month <= 12 &&
            day >= 1 &&
            day <= 31 &&
            hh >= 0 &&
            hh <= 23 &&
            mm >= 0 &&
            mm <= 59 &&
            ss >= 0 &&
            ss <= 59
          ) {
            const fullDate = new Date(year, month - 1, day, hh, mm, ss, 0);
            if (
              fullDate.getFullYear() === year &&
              fullDate.getMonth() === month - 1 &&
              fullDate.getDate() === day
            ) {
              parsed = fullDate;
            }
          }
        }
      }

      if (!parsed) {
        parsed = parseDateInput(text);
        if (parsed && enableTime) {
          const [hhText = '00', mmText = '00', ssText = '00'] = String(
            timeValue || '00:00',
          )
            .split(':')
            .map((v) => String(v || '00'));
          parsed.setHours(Number(hhText), Number(mmText), Number(ssText), 0);
        }
      }

      if (!parsed || isDateDisabled(parsed)) {
        setInputInvalid(true);
        return false;
      }

      const normalized = enableTime
        ? includeSeconds
          ? `${formatDate(parsed)} ${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}:${String(parsed.getSeconds()).padStart(2, '0')}`
          : `${formatDate(parsed)} ${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
        : formatDate(parsed);
      setInputValue(normalized);
      setViewDate(parsed);
      if (enableTime) {
        const hh = String(parsed.getHours()).padStart(2, '0');
        const mm = String(parsed.getMinutes()).padStart(2, '0');
        const ss = String(parsed.getSeconds()).padStart(2, '0');
        setTimeValue(includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`);
      }
      onSelect(parsed);
      setInputInvalid(false);
      return true;
    },
    [onSelect, isDateDisabled, enableTime, includeSeconds, timeValue],
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
      const selectedDate = new Date(date);
      if (enableTime) {
        const [hhText = '00', mmText = '00', ssText = '00'] = String(
          timeValue || '00:00',
        )
          .split(':')
          .map((v) => String(v || '00'));
        selectedDate.setHours(
          Number(hhText),
          Number(mmText),
          Number(ssText),
          0,
        );
      }

      setInputValue(
        enableTime
          ? includeSeconds
            ? `${formatDate(selectedDate)} ${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}:${String(selectedDate.getSeconds()).padStart(2, '0')}`
            : `${formatDate(selectedDate)} ${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}`
          : formatDate(selectedDate),
      );
      setInputInvalid(false);
      setViewDate(stripTime(date));
      onSelect(selectedDate);
      setOpen(false);
    },
    [onSelect, enableTime, includeSeconds, timeValue],
  );

  const handleTimeChange = useCallback(
    (event) => {
      const nextTime = String(event.target.value || '00:00');
      setTimeValue(nextTime);

      const baseDate = defaultValue
        ? new Date(defaultValue)
        : parseDateInput(inputValue || displayValue || '');
      if (!baseDate || isNaN(baseDate.getTime())) {
        return;
      }

      const [hhText = '00', mmText = '00', ssText = '00'] = nextTime
        .split(':')
        .map((v) => String(v || '00'));
      baseDate.setHours(Number(hhText), Number(mmText), Number(ssText), 0);

      setInputValue(
        includeSeconds
          ? `${formatDate(baseDate)} ${String(baseDate.getHours()).padStart(2, '0')}:${String(baseDate.getMinutes()).padStart(2, '0')}:${String(baseDate.getSeconds()).padStart(2, '0')}`
          : `${formatDate(baseDate)} ${String(baseDate.getHours()).padStart(2, '0')}:${String(baseDate.getMinutes()).padStart(2, '0')}`,
      );
      onSelect(baseDate);
    },
    [defaultValue, inputValue, displayValue, includeSeconds, onSelect],
  );

  return (
    <div className={styles.fieldContainer} ref={containerRef}>
      <Sub_DateInputField
        id={id}
        inputValue={inputValue}
        inputInvalid={inputInvalid}
        placeholder={placeholder}
        open={open}
        disabled={disabled}
        onInputChange={(event) => {
          setInputValue(event.target.value);
          if (inputInvalid) setInputInvalid(false);
        }}
        onInputBlur={handleInputBlur}
        onInputKeyDown={handleInputKeyDown}
        onToggleCalendar={() => {
          if (!disabled) {
            setOpen((v) => !v);
          }
        }}
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
        enableTime={enableTime}
        includeSeconds={includeSeconds}
        timeValue={timeValue}
        onTimeChange={handleTimeChange}
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
  disabled: PropTypes.bool,
  enableTime: PropTypes.bool,
  includeSeconds: PropTypes.bool,
};

export default Sub_DateField;
