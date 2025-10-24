import { useState, useEffect, cloneElement, Children } from 'react';
import styles from './ControlRowBtn.module.css';

const ControlRowBtn = (props) => {
  const { children, initialRowCount = 1 } = props;
  const [rows, setRows] = useState(
    Array(initialRowCount)
      .fill(null)
      .map(() => ({
        id: Math.random().toString(36).slice(2, 8),
      }))
  );

  const handleAddRow = () => {
    setRows([...rows, { id: Math.random().toString(36).slice(2, 8) }]);
  };

  const handleRemoveRow = (rowId) => {
    if (rows.length <= 1) return; // Don't remove the last row
    setRows(rows.filter((row) => row.id !== rowId));
  };

  return (
    <div className={styles.controlRowWrapper}>
      {rows.map((row) => (
        <div key={row.id} className={styles.controlRowContainer}>
          <div className={styles.buttonsContainer}>
            <button className={styles.addButton} onClick={handleAddRow}>
              +
            </button>
            <button
              className={styles.removeButton}
              onClick={() => handleRemoveRow(row.id)}
            >
              -
            </button>
          </div>
          <div className={styles.childrenContainer}>
            {Children.map(children, (child) =>
              child
                ? cloneElement(child, {
                    key: `${row.id}-${child.key || Math.random()}`,
                  })
                : null
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ControlRowBtn;
