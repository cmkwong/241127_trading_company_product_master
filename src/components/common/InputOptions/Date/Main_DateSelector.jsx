import React, { useMemo, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_DateSelector.module.css';
import Sub_DateField from './Sub_DateField';

const Main_DateSelector = ({
  // Controlled
  value: controlledDate, // Date or ISO string
  onChange = () => {}, // onChange({ date, isoString })

  // Uncontrolled
  defaultValue, // Date or ISO string

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
      36
    )}`;

  const autoIdRef = useRef(dropdownId || makeId('date-selector'));
  const resolvedId = dropdownId || autoIdRef.current;

  const toDate = useCallback((d) => {
    if (!d) return undefined;
    if (d instanceof Date) return isNaN(d.getTime()) ? undefined : d;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, []);

  const isControlled = controlledDate !== undefined;
  const [innerDate, setInnerDate] = useState(() => toDate(defaultValue));

  const currentDate = isControlled ? toDate(controlledDate) : innerDate;

  const stripTime = (d) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  };

  const emitChange = useCallback(
    (d) => {
      const valid = d && !isNaN(d.getTime()) ? stripTime(d) : undefined;
      const isoString = valid ? valid.toISOString().slice(0, 10) : '';
      onChange({ date: valid, isoString });
    },
    [onChange]
  );

  const setDate = useCallback(
    (d) => {
      if (isControlled) {
        emitChange(d);
      } else {
        setInnerDate(d ? stripTime(d) : undefined);
        emitChange(d);
      }
    },
    [isControlled, emitChange]
  );

  const displayValue = useMemo(() => {
    if (!currentDate) return '';
    return currentDate.toISOString().slice(0, 10);
  }, [currentDate]);

  const fieldProps = useMemo(
    () => ({
      id: resolvedId,
      value: currentDate,
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
    ]
  );

  // Note: We do NOT wrap this in another label; you already provide label in the container.
  return (
    <div className={styles.container} data-testid="date-selector">
      <Sub_DateField {...fieldProps} />
    </div>
  );
};

Main_DateSelector.propTypes = {
  value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  onChange: PropTypes.func, // onChange({ date, isoString })
  defaultValue: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
  ]),
  label: PropTypes.string,
  dropdownId: PropTypes.string,
  placeholder: PropTypes.string,
  minDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  maxDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  disableDate: PropTypes.func,
};

export default Main_DateSelector;
