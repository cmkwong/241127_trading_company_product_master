import { useState, cloneElement, Children, useEffect } from 'react';
import styles from './ControlRowBtn.module.css';

const ControlRowBtn = (props) => {
  const {
    children,
    rowIds = [],
    setRowIds,
    onRowAdd,
    onRowRemove,
    initialRowCount = 1,
  } = props;

  // Initialize rows state based on provided rowIds or create default rows
  const [rows, setRows] = useState(() => {
    if (rowIds && rowIds.length > 0) {
      // Use provided row IDs
      return rowIds.map((id) => ({ id }));
    } else {
      // Create default rows with generated IDs
      return Array(initialRowCount)
        .fill(null)
        .map(() => ({
          id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        }));
    }
  });

  // Update rows when rowIds changes
  useEffect(() => {
    if (rowIds && rowIds.length > 0) {
      const newRows = rowIds.map((id) => ({ id }));
      setRows(newRows);
    }
  }, [rowIds]);

  const handleAddRow = () => {
    // Generate a new unique ID
    const newId = `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newRows = [...rows, { id: newId }];
    setRows(newRows);

    // Update parent component with new row IDs
    if (setRowIds) {
      setRowIds(newRows.map((row) => row.id));
    }

    // Call onRowAdd callback if provided
    if (onRowAdd) {
      onRowAdd(newId);
    }
  };

  const handleRemoveRow = (rowId) => {
    if (rows.length <= 1) return; // Don't remove the last row

    const newRows = rows.filter((row) => row.id !== rowId);
    setRows(newRows);

    // Update parent component with new row IDs
    if (setRowIds) {
      setRowIds(newRows.map((row) => row.id));
    }

    // Call onRowRemove callback if provided
    if (onRowRemove) {
      onRowRemove(rowId);
    }
  };

  return (
    <div className={styles.controlRowWrapper}>
      {rows.map((row, rowindex) => {
        const isLastRow = rowindex === rows.length - 1;

        return (
          <div key={row.id} className={styles.controlRowContainer}>
            <div className={styles.rowNumberContainer}>
              <span className={styles.rowNumber}>{rowindex + 1}</span>
            </div>
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

                // Pass both rowindex and rowId to child
                return cloneElement(child, {
                  key: `${row.id}-${index}`,
                  rowindex: rowindex,
                  rowId: row.id,
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
