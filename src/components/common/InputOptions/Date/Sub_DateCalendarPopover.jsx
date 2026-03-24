import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Sub_DateField.module.css';
import { sameDay } from './dateHelpers';

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const Sub_DateCalendarPopover = ({
  open,
  popoverRef,
  label,
  popoverPosition,
  monthLabel,
  id,
  weeks,
  defaultValue,
  isDateDisabled,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}) => {
  if (!open) return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={label || 'Date picker'}
      className={styles.popover}
      style={{
        top: `${popoverPosition.top}px`,
        left: `${popoverPosition.left}px`,
      }}
    >
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={onPrevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className={styles.monthLabel}>{monthLabel}</div>
        <button
          type="button"
          className={styles.navBtn}
          onClick={onNextMonth}
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
              const selected = defaultValue && sameDay(defaultValue, date);

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
                    if (!disabled) onSelectDate(date);
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
    </div>,
    document.body,
  );
};

Sub_DateCalendarPopover.propTypes = {
  open: PropTypes.bool.isRequired,
  popoverRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  label: PropTypes.string,
  popoverPosition: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  monthLabel: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  weeks: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.oneOf([null]),
        PropTypes.shape({
          date: PropTypes.instanceOf(Date).isRequired,
          isToday: PropTypes.bool.isRequired,
          isCurrentMonth: PropTypes.bool.isRequired,
        }),
      ]),
    ),
  ).isRequired,
  defaultValue: PropTypes.instanceOf(Date),
  isDateDisabled: PropTypes.func.isRequired,
  onPrevMonth: PropTypes.func.isRequired,
  onNextMonth: PropTypes.func.isRequired,
  onSelectDate: PropTypes.func.isRequired,
};

export default Sub_DateCalendarPopover;
