import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_DateField.module.css';

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const Sub_DateField = ({
  id,
  value,
  displayValue,
  onSelect,
  placeholder,
  minDate,
  maxDate,
  disableDate,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() =>
    stripTime(value || new Date())
  );
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) setViewDate(stripTime(value));
  }, [value]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

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
    [minDate, maxDate, disableDate]
  );

  const { monthLabel, weeks } = useMemo(
    () => buildCalendar(viewDate),
    [viewDate]
  );

  return (
    <div className={styles.fieldContainer} ref={containerRef}>
      <button
        id={id}
        type="button"
        className={styles.button}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {displayValue || placeholder}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label || 'Date picker'}
          className={styles.popover}
        >
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className={styles.monthLabel}>{monthLabel}</div>
            <button
              type="button"
              className={styles.navBtn}
              onClick={nextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className={styles.grid} role="grid" aria-labelledby={id}>
            <div className={styles.weekHeader} role="row">
              {weekdays.map((d) => (
                <div key={d} className={styles.weekday} role="columnheader">
                  {d}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className={styles.week} role="row">
                {week.map((cell, ci) => {
                  if (!cell)
                    return <div key={ci} className={styles.dayCellEmpty} />;
                  const { date, isToday, isCurrentMonth } = cell;
                  const disabled = isDateDisabled(date);
                  const selected = value && sameDay(value, date);

                  const classNames = [
                    styles.dayCell,
                    !isCurrentMonth && styles.outside,
                    isToday && styles.today,
                    selected && styles.selected,
                    disabled && styles.disabled,
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      key={ci}
                      type="button"
                      className={classNames}
                      onClick={() => {
                        if (!disabled) {
                          onSelect(date);
                          setOpen(false);
                        }
                      }}
                      aria-pressed={selected}
                      aria-disabled={disabled}
                      disabled={disabled}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

Sub_DateField.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.instanceOf(Date),
  displayValue: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  disableDate: PropTypes.func,
  label: PropTypes.string,
};

export default Sub_DateField;

// Helpers
function stripTime(d) {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendar(viewDate) {
  const base = stripTime(viewDate || new Date());
  const year = base.getFullYear();
  const month = base.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const startWeekday = start.getDay();
  const totalDays = end.getDate();

  const monthLabel = base.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      isToday: sameDay(date, new Date()),
      isCurrentMonth: true,
    });
  }
  while (days.length % 7 !== 0) days.push(null);

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return { monthLabel, weeks };
}
