import { useState, cloneElement, Children, useEffect } from 'react';
import styles from './ControlRowBtn.module.css';

const ControlRowBtn = (props) => {
  const { children, setRowCount, initialRowCount = 1, onRowsChange } = props;

  // Initialize rows state based on initialRowCount
  const [rows, setRows] = useState(
    Array(initialRowCount)
      .fill(null)
      .map(() => ({
        id: Math.random().toString(36).slice(2, 8),
      }))
  );

  // Update rows when initialRowCount changes
  useEffect(() => {
    if (rows.length !== initialRowCount) {
      const newRows = Array(initialRowCount)
        .fill(null)
        .map((_, index) => {
          // Try to preserve existing row IDs when possible
          return index < rows.length
            ? rows[index]
            : { id: Math.random().toString(36).slice(2, 8) };
        });

      setRows(newRows);
    }
  }, [initialRowCount]);

  const handleAddRow = () => {
    const newRows = [...rows, { id: Math.random().toString(36).slice(2, 8) }];
    setRows(newRows);
    if (setRowCount) {
      setRowCount(newRows.length);
    }

    // Notify parent component about row change
    if (onRowsChange) {
      onRowsChange(newRows.length);
    }
  };

  const handleRemoveRow = (rowId) => {
    if (rows.length <= 1) return; // Don't remove the last row
    const newRows = rows.filter((row) => row.id !== rowId);
    setRows(newRows);
    if (setRowCount) {
      setRowCount(newRows.length);
    }

    // Notify parent component about row change
    if (onRowsChange) {
      onRowsChange(newRows.length);
    }
  };

  return (
    <div className={styles.controlRowWrapper}>
      {rows.map((row, rowindex) => {
        const isLastRow = rowindex === rows.length - 1;

        return (
          <div key={row.id} className={styles.controlRowContainer}>
            <div className={styles.buttonsContainer}>
              <button
                className={styles.removeButton}
                onClick={() => handleRemoveRow(row.id)}
              >
                -
              </button>
              {/* Only show add button in the last row */}
              {isLastRow && (
                <button className={styles.addButton} onClick={handleAddRow}>
                  +
                </button>
              )}
            </div>
            <div className={styles.childrenContainer}>
              {Children.map(children, (child, index) => {
                if (!child) return null;

                // Generate a stable key for this child component and pass rowindex
                return cloneElement(child, {
                  key: `${row.id}-${index}`,
                  rowindex: rowindex, // Pass rowindex to child
                });
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ControlRowBtn;
