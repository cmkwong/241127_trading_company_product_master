import { useState, cloneElement, Children, useEffect } from 'react';
import styles from './ControlRowBtn.module.css';
import AddNewBtn from './AddNewBtn';
import { v4 as uuidv4 } from 'uuid';
import {
  DRAG_READY_LABEL,
  getDragPlacementUiState,
} from '../../../utils/dragUi';

const ControlRowBtn = (props) => {
  const {
    children,
    rowIds = [],
    onRowIdsChange,
    onRowAdd,
    onRowRemove,
    onRowsReorder,
    initialRowCount = 1,
    draggableRows = false,
  } = props;

  const [draggedRowId, setDraggedRowId] = useState(null);
  const [dragOverRowId, setDragOverRowId] = useState(null);
  const isDragging = Boolean(draggedRowId);

  // Initialize rows state based on provided rowIds or create default rows
  const [rows, setRows] = useState(() => {
    if (rowIds && rowIds.length > 0) {
      // Use provided row IDs
      return rowIds.map((id) => ({ id }));
    } else {
      // Create default rows with generated IDs
      return Array(initialRowCount)
        .fill(null)
        .map(() => {
          const id = uuidv4();
          return {
            id: id,
          };
        });
    }
  });

  // Update rows when rowIds changes
  useEffect(() => {
    if (rowIds && rowIds.length > 0) {
      const newRows = rowIds.map((id) => ({ id }));
      setRows(newRows);
    } else {
      setRows([]);
    }
  }, [rowIds]);

  const handleAddRow = () => {
    // Generate a new unique ID
    const newId = uuidv4();
    const oldRows = rows;
    const newRows = [...oldRows, { id: newId }];
    setRows(newRows);

    // Update parent component with new row IDs
    if (onRowIdsChange) {
      onRowIdsChange(
        oldRows.map((row) => row.id),
        newRows.map((row) => row.id),
      );
    }

    // Call onRowAdd callback if provided
    if (onRowAdd) {
      onRowAdd(newId);
    }
  };

  const handleRemoveRow = (rowId) => {
    // if (rows.length <= 1) return; // Don't remove the last row

    const oldRows = rows;
    const newRows = rows.filter((row) => row.id !== rowId);
    setRows(newRows);

    // Update parent component with new row IDs
    if (onRowIdsChange) {
      onRowIdsChange(
        oldRows.map((row) => row.id),
        newRows.map((row) => row.id),
      );
    }

    // Call onRowRemove callback if provided
    if (onRowRemove) {
      onRowRemove(rowId);
    }
  };

  const handleDragStart = (rowId) => {
    if (!draggableRows) return;
    setDraggedRowId(rowId);
  };

  const handleDragOver = (event, rowId) => {
    if (!draggableRows) return;
    event.preventDefault();
    if (dragOverRowId !== rowId) {
      setDragOverRowId(rowId);
    }
  };

  const handleDrop = (event, targetRowId) => {
    if (!draggableRows) return;
    event.preventDefault();

    if (!draggedRowId || draggedRowId === targetRowId) {
      setDragOverRowId(null);
      return;
    }

    const oldRowIds = rows.map((row) => row.id);
    const draggedIndex = rows.findIndex((row) => row.id === draggedRowId);
    const targetIndex = rows.findIndex((row) => row.id === targetRowId);

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedRowId(null);
      setDragOverRowId(null);
      return;
    }

    const newRows = [...rows];
    const [draggedRow] = newRows.splice(draggedIndex, 1);
    newRows.splice(targetIndex, 0, draggedRow);

    setRows(newRows);

    const newRowIds = newRows.map((row) => row.id);
    if (onRowIdsChange) {
      onRowIdsChange(oldRowIds, newRowIds);
    }
    if (onRowsReorder) {
      onRowsReorder(oldRowIds, newRowIds);
    }

    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  const handleDragEnd = () => {
    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  const renderDragHandleIcon = () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="5" cy="4" r="1.2" />
      <circle cx="11" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="12" r="1.2" />
    </svg>
  );

  const renderMinusIcon = () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10" />
    </svg>
  );

  return (
    <div
      className={`${styles.controlRowWrapper} ${
        isDragging ? styles.controlRowWrapperDragging : ''
      }`}
    >
      {rows.length === 0 ? (
        <div className={styles.emptyRowMessage}>No rows added</div>
      ) : (
        rows.map((row, rowindex) => {
          const { isDraggedItem: isDraggedRow, isDropTarget } =
            getDragPlacementUiState({
              draggedKey: draggedRowId,
              overKey: dragOverRowId,
              currentKey: row.id,
            });

          return (
            <div
              key={row.id}
              className={`${styles.controlRowContainer} ${
                isDropTarget ? styles.dragOverRow : ''
              } ${isDraggedRow ? styles.draggingRow : ''}`}
              onDragOver={(event) => handleDragOver(event, row.id)}
              onDrop={(event) => handleDrop(event, row.id)}
            >
              {draggableRows && (
                <button
                  type="button"
                  draggable
                  className={styles.dragHandleButton}
                  onDragStart={() => handleDragStart(row.id)}
                  onDragEnd={handleDragEnd}
                  title="Drag to reorder"
                  aria-label="Drag to reorder row"
                >
                  {renderDragHandleIcon()}
                </button>
              )}
              {isDropTarget && (
                <div className={styles.dropReadyBadge}>{DRAG_READY_LABEL}</div>
              )}
              <div className={styles.childrenContainer}>
                {Children.map(children, (child, index) => {
                  if (!child) return null;

                  return cloneElement(child, {
                    key: `${row.id}-${index}`,
                    rowindex: rowindex,
                    rowId: row.id,
                  });
                })}
              </div>
              <div className={styles.rowNumberContainer}>
                <span className={styles.rowNumber}>{rowindex + 1}</span>
              </div>
              <div className={styles.buttonsContainer}>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveRow(row.id)}
                  title="Remove row"
                  aria-label={`Remove row ${rowindex + 1}`}
                >
                  {renderMinusIcon()}
                </button>
              </div>
            </div>
          );
        })
      )}

      <AddNewBtn
        className={styles.addButton}
        onClick={handleAddRow}
        text="Add Row"
        aria-label="Add row"
      />
    </div>
  );
};

export default ControlRowBtn;
