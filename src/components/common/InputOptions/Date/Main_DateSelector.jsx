import React, { useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_DateSelector.module.css';
import Sub_DateField from './Sub_DateField';

const DATE_DASH_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_PLAIN_RE = /^(\d{4})(\d{2})(\d{2})$/;
const DATE_TIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)$/;
const DATE_TIME_WITH_ZONE_RE =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i;

const Main_DateSelector = ({
  // Controlled
  defaultValue, // Date or ISO string
  onChange = () => {}, // onChange(oldValue, newValue)

  // UI
  label,
  dropdownId,
  placeholder = 'Select a date',
  disabled = false,
  enableTime = false,
  includeSeconds = false,

  // Bounds
  minDate, // Date or ISO string
  maxDate, // Date or ISO string
  disableDate, // (date: Date) => boolean
}) => {
  const makeId = (prefix = 'date-selector') =>
    `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(
      36,
    )}`;

  const autoIdRef = useRef(dropdownId || makeId('date-selector'));
  const resolvedId = dropdownId || autoIdRef.current;

  const toDate = useCallback((d) => {
    if (!d) return undefined;
    if (d instanceof Date) return isNaN(d.getTime()) ? undefined : d;

    if (typeof d === 'string') {
      const value = d.trim();

      const zonedDateTimeMatch = value.match(DATE_TIME_WITH_ZONE_RE);
      if (zonedDateTimeMatch) {
        const year = Number(zonedDateTimeMatch[1]);
        const month = Number(zonedDateTimeMatch[2]);
        const day = Number(zonedDateTimeMatch[3]);
        const hh = Number(zonedDateTimeMatch[4] || 0);
        const min = Number(zonedDateTimeMatch[5] || 0);
        const sec = Number(zonedDateTimeMatch[6] || 0);

        // Treat incoming datetime as local wall-clock time.
        // This avoids UTC offset auto-conversion (e.g., +8 hours shift).
        const localDate = new Date(year, month - 1, day, hh, min, sec, 0);

        if (
          localDate.getFullYear() === year &&
          localDate.getMonth() === month - 1 &&
          localDate.getDate() === day
        ) {
          return localDate;
        }
      }

      const dateTimeMatch = value.match(DATE_TIME_RE);
      if (dateTimeMatch) {
        const year = Number(dateTimeMatch[1]);
        const month = Number(dateTimeMatch[2]);
        const day = Number(dateTimeMatch[3]);
        const hh = Number(dateTimeMatch[4] || 0);
        const min = Number(dateTimeMatch[5] || 0);
        const sec = Number(dateTimeMatch[6] || 0);
        const localDate = new Date(year, month - 1, day, hh, min, sec, 0);

        if (
          localDate.getFullYear() === year &&
          localDate.getMonth() === month - 1 &&
          localDate.getDate() === day
        ) {
          return localDate;
        }
      }

      let m = value.match(DATE_DASH_RE);
      if (!m) m = value.match(DATE_PLAIN_RE);

      if (m) {
        const year = Number(m[1]);
        const month = Number(m[2]);
        const day = Number(m[3]);
        const localDate = new Date(year, month - 1, day);

        if (
          localDate.getFullYear() === year &&
          localDate.getMonth() === month - 1 &&
          localDate.getDate() === day
        ) {
          return localDate;
        }
      }
    }

    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, []);

  const currentDate = toDate(defaultValue);

  const stripTime = (d) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  };

  const emitChange = useCallback(
    (d) => {
      const valid =
        d && !isNaN(d.getTime())
          ? enableTime
            ? new Date(d)
            : stripTime(d)
          : undefined;
      onChange(currentDate, valid);
    },
    [onChange, currentDate, enableTime],
  );

  const setDate = useCallback(
    (d) => {
      emitChange(d);
    },
    [emitChange],
  );

  const displayValue = useMemo(() => {
    if (!currentDate) return '';
    const yyyy = String(currentDate.getFullYear());
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    if (!enableTime) {
      return `${yyyy}-${mm}-${dd}`;
    }

    const hh = String(currentDate.getHours()).padStart(2, '0');
    const min = String(currentDate.getMinutes()).padStart(2, '0');
    const ss = String(currentDate.getSeconds()).padStart(2, '0');
    return includeSeconds
      ? `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
      : `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }, [currentDate, enableTime, includeSeconds]);

  const fieldProps = useMemo(
    () => ({
      id: resolvedId,
      defaultValue: currentDate,
      displayValue,
      onSelect: setDate,
      placeholder,
      minDate: toDate(minDate),
      maxDate: toDate(maxDate),
      disableDate,
      label,
      disabled,
      enableTime,
      includeSeconds,
    }),
    [
      resolvedId,
      currentDate,
      displayValue,
      setDate,
      placeholder,
      minDate,
      maxDate,
      disableDate,
      toDate,
      label,
      disabled,
      enableTime,
      includeSeconds,
    ],
  );

  // Note: We do NOT wrap this in another label; you already provide label in the container.
  return (
    <div className={styles.container} data-testid="date-selector">
      <Sub_DateField {...fieldProps} />
    </div>
  );
};

Main_DateSelector.propTypes = {
  defaultValue: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
  ]),
  onChange: PropTypes.func, // onChange(oldValue, newValue)
  label: PropTypes.string,
  dropdownId: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  enableTime: PropTypes.bool,
  includeSeconds: PropTypes.bool,
  minDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  maxDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  disableDate: PropTypes.func,
};

export default Main_DateSelector;
