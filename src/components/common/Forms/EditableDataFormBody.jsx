import { useState } from 'react';
import Frame from '../Layouts/Frame';
import RemoveRowBtn from '../Buttons/RemoveRowBtn';
import styles from './EditableDataForm.module.css';

const EditableDataFormBody = ({
  rows,
  rowGroups = [],
  rowKey,
  emptyMessage,
  getFillCellClassName,
  handleCellMouseEnter,
  wrapWithFill,
  onRemoveRow,
  showRowBadge = false,
  draggableRows = false,
  onRowsReorder,
}) => {
  const getRowItemStyle = (column) => {
    const minWidth =
      column?.rowItemMinWidth || column?.minWidth || column?.width || '220px';
    const maxWidth = column?.rowItemMaxWidth || column?.maxWidth || undefined;

    return {
      '--row-item-min-width': minWidth,
      ...(maxWidth ? { '--row-item-max-width': maxWidth } : {}),
    };
  };

  const resolveRowKey = (row, index) =>
    typeof rowKey === 'function'
      ? String(rowKey(row, index))
      : String(row?.[rowKey]);

  const showRemoveRow = typeof onRemoveRow === 'function';

  const [draggedRowKey, setDraggedRowKey] = useState(null);
  const [dragOverRowKey, setDragOverRowKey] = useState(null);

  const handleDragStart = (rowKeyValue) => {
    if (!draggableRows) return;
    setDraggedRowKey(rowKeyValue);
  };

  const handleDragOver = (event, rowKeyValue) => {
    if (!draggableRows) return;
    event.preventDefault();
    if (dragOverRowKey !== rowKeyValue) {
      setDragOverRowKey(rowKeyValue);
    }
  };

  const handleDrop = (event, targetRowKey) => {
    if (!draggableRows) return;
    event.preventDefault();

    if (!draggedRowKey || draggedRowKey === targetRowKey) {
      setDraggedRowKey(null);
      setDragOverRowKey(null);
      return;
    }

    const rowKeys = rows.map((row, index) => resolveRowKey(row, index));
    const draggedIndex = rowKeys.indexOf(draggedRowKey);
    const targetIndex = rowKeys.indexOf(targetRowKey);

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedRowKey(null);
      setDragOverRowKey(null);
      return;
    }

    const newRowKeys = [...rowKeys];
    newRowKeys.splice(draggedIndex, 1);
    newRowKeys.splice(targetIndex, 0, draggedRowKey);

    if (typeof onRowsReorder === 'function') {
      onRowsReorder(newRowKeys);
    }

    setDraggedRowKey(null);
    setDragOverRowKey(null);
  };

  const handleDragEnd = () => {
    setDraggedRowKey(null);
    setDragOverRowKey(null);
  };

  if (rows.length === 0) {
    return (
      <div className={styles.tableBody} role="rowgroup">
        <div className={styles.emptyRow}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <Frame
      direction="vertical"
      gap={0}
      className={styles.tableBody}
      role="rowgroup"
    >
      {rows.map((row, rowIndex) => {
        const rowKeyValue = resolveRowKey(row, rowIndex);
        const isDropTarget = draggableRows && dragOverRowKey === rowKeyValue;
        const isDraggedRow = draggableRows && draggedRowKey === rowKeyValue;

        return (
        <div
          key={rowKeyValue}
          className={[
            styles.RowWrap,
            isDropTarget ? styles.dragOver : '',
            isDraggedRow ? styles.draggingRow : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onDragOver={
            draggableRows
              ? (event) => handleDragOver(event, rowKeyValue)
              : undefined
          }
          onDrop={
            draggableRows
              ? (event) => handleDrop(event, rowKeyValue)
              : undefined
          }
        >
          {draggableRows && (
            <button
              type="button"
              draggable
              className={styles.dragHandle}
              onDragStart={() => handleDragStart(rowKeyValue)}
              onDragEnd={handleDragEnd}
              title="Drag to reorder"
              aria-label="Drag to reorder row"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="5" cy="4" r="1.2" />
                <circle cx="11" cy="4" r="1.2" />
                <circle cx="5" cy="8" r="1.2" />
                <circle cx="11" cy="8" r="1.2" />
                <circle cx="5" cy="12" r="1.2" />
                <circle cx="11" cy="12" r="1.2" />
              </svg>
            </button>
          )}

          {rowGroups.map((group, groupIndex) => (
            <div
              key={`${rowKeyValue}-row-${String(groupIndex)}`}
              className={styles.RowTr}
              role="row"
            >
              <div
                className={[
                  styles.RowCell,
                  groupIndex === 0 && showRemoveRow
                    ? styles.RowCellReserveRemove
                    : '',
                  groupIndex === 0 && draggableRows
                    ? styles.RowCellReserveDrag
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="cell"
              >
                <div className={styles.RowGrid}>
                  {group.map((column) => {
                    const fillField = column.fillField;
                    const cellClassName =
                      fillField && typeof getFillCellClassName === 'function'
                        ? getFillCellClassName(fillField, rowIndex)
                        : '';

                    const content = column.renderCell
                      ? column.renderCell(row, {
                          rowIndex,
                          wrapWithFill,
                        })
                      : row?.[column.key];

                    return (
                      <div
                        key={column.key}
                        className={[
                          styles.RowItem,
                          cellClassName,
                          column.cellClassName || column.columnClassName,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={getRowItemStyle(column)}
                        onMouseEnter={
                          fillField &&
                          typeof handleCellMouseEnter === 'function'
                            ? () => handleCellMouseEnter(fillField, rowIndex)
                            : undefined
                        }
                      >
                        <div className={styles.RowLabel}>
                          {column.label ?? column.key}
                        </div>
                        <div className={styles.RowValue}>{content}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {showRowBadge && (
            <div className={styles.rowBadge}>
              <span className={styles.rowBadgeText}>{rowIndex + 1}</span>
            </div>
          )}

          {showRemoveRow && (
            <RemoveRowBtn
              className={[
                styles.RowRemoveBtn,
                showRowBadge ? styles.RowRemoveBtnWithBadge : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onRemoveRow(row, rowIndex)}
              ariaLabel={`Remove row ${rowIndex + 1}`}
            />
          )}
        </div>
        );
      })}
    </Frame>
  );
};

export default EditableDataFormBody;
