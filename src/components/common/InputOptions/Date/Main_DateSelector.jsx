import React, { useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_DateSelector.module.css';
import Sub_DateField from './Sub_DateField';

const DATE_DASH_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_PLAIN_RE = /^(\d{4})(\d{2})(\d{2})$/;

const Main_DateSelector = ({
  // Controlled
  defaultValue, // Date or ISO string
  onChange = () => {}, // onChange(oldValue, newValue)

  // UI
  label,
  dropdownId,
  placeholder = 'Select a date',

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
      const valid = d && !isNaN(d.getTime()) ? stripTime(d) : undefined;
      onChange(currentDate, valid);
    },
    [onChange, currentDate],
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
    return `${yyyy}-${mm}-${dd}`;
  }, [currentDate]);

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
  minDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  maxDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  disableDate: PropTypes.func,
};

export default Main_DateSelector;
