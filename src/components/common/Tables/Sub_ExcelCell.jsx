import { useEffect, useState } from 'react';
import styles from './Sub_ExcelCell.module.css';

const toStringValue = (value) => (value == null ? '' : String(value));

/**
 * Bare, Excel-style cell editor. Fills the surrounding `<td>` and has no chrome
 * of its own — focus is expressed by the parent cell's inset ring.
 */
const Sub_ExcelCell = ({ type = 'text', value, onCommit }) => {
  const inputType = type === 'number' ? 'number' : 'text';
  const [internalValue, setInternalValue] = useState(toStringValue(value));

  useEffect(() => {
    setInternalValue(toStringValue(value));
  }, [value]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setInternalValue(nextValue);
    if (typeof onCommit === 'function') {
      onCommit(nextValue);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      setInternalValue(toStringValue(value));
      event.currentTarget.blur();
    }
  };

  return (
    <input
      className={styles.excelInput}
      type={inputType}
      value={internalValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      spellCheck={false}
    />
  );
};

export default Sub_ExcelCell;
