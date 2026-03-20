import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './EditableDataTable.module.css';

const getDefaultRowKey = (row, index) => row?.id || index;

const EditableDataTable = ({
  rows = [],
  columns = [],
  rowKey = getDefaultRowKey,
  emptyMessage = 'No data',
  onFillCellChange,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [fillDrag, setFillDrag] = useState(null);
  const [fillHoverIndex, setFillHoverIndex] = useState(null);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return rows;

    const column = columns.find((item) => item.key === sortConfig.key);
    if (!column) return rows;

    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    const sortType = column.sortType || 'string';

    return [...rows].sort((a, b) => {
      const aValue = column.getSortValue
        ? column.getSortValue(a)
        : a?.[column.key];
      const bValue = column.getSortValue
        ? column.getSortValue(b)
        : b?.[column.key];

      if (sortType === 'number') {
        const aNum = Number(aValue);
        const bNum = Number(bValue);

        if (Number.isNaN(aNum) && Number.isNaN(bNum)) return 0;
        if (Number.isNaN(aNum)) return 1;
        if (Number.isNaN(bNum)) return -1;
        return (aNum - bNum) * dir;
      }

      return String(aValue ?? '').localeCompare(String(bValue ?? '')) * dir;
    });
  }, [rows, columns, sortConfig]);

  const applyFill = useCallback(() => {
    if (
      !fillDrag ||
      fillHoverIndex === null ||
      fillHoverIndex === undefined ||
      typeof onFillCellChange !== 'function'
    ) {
      return;
    }

    const { field, sourceIndex, value } = fillDrag;
    if (sourceIndex === fillHoverIndex) return;

    const start = Math.min(sourceIndex, fillHoverIndex);
    const end = Math.max(sourceIndex, fillHoverIndex);

    for (let index = start; index <= end; index += 1) {
      if (index === sourceIndex) continue;
      onFillCellChange(sortedRows[index], field, value);
    }
  }, [fillDrag, fillHoverIndex, onFillCellChange, sortedRows]);

  useEffect(() => {
    const handleMouseUp = () => {
      applyFill();
      setFillDrag(null);
      setFillHoverIndex(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [applyFill]);

  const handleSort = (column) => {
    if (column.sortable === false) return;

    setSortConfig((prev) => {
      if (prev.key === column.key) {
        return {
          key: column.key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        key: column.key,
        direction: 'asc',
      };
    });
  };

  const getSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return '';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const startFillDrag = (field, sourceIndex, value, event) => {
    event.preventDefault();
    event.stopPropagation();
    setFillDrag({ field, sourceIndex, value });
    setFillHoverIndex(sourceIndex);
  };

  const handleCellMouseEnter = (field, rowIndex) => {
    if (!fillDrag || fillDrag.field !== field) return;
    setFillHoverIndex(rowIndex);
  };

  const getFillCellClassName = (field, rowIndex) => {
    if (
      !fillDrag ||
      fillHoverIndex === null ||
      fillHoverIndex === undefined ||
      fillDrag.field !== field
    ) {
      return '';
    }

    const start = Math.min(fillDrag.sourceIndex, fillHoverIndex);
    const end = Math.max(fillDrag.sourceIndex, fillHoverIndex);
    const inRange = rowIndex >= start && rowIndex <= end;

    if (!inRange) return '';
    if (rowIndex === fillDrag.sourceIndex) {
      return `${styles.fillPreviewCell} ${styles.fillPreviewSource}`;
    }

    return styles.fillPreviewCell;
  };

  const wrapWithFill = (children, field, rowIndex, value) => (
    <div className={styles.cellControlWrap}>
      {children}
      <button
        type="button"
        className={styles.fillHandle}
        onMouseDown={(event) => startFillDrag(field, rowIndex, value, event)}
        title="Drag to fill"
        aria-label="Drag to fill"
      />
    </div>
  );

  return (
    <div className={styles.tableWrap}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.headerClassName || column.columnClassName}
                style={{
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                }}
              >
                <button
                  type="button"
                  className={styles.sortButton}
                  onClick={() => handleSort(column)}
                >
                  {column.label}
                  <span className={styles.sortIndicator}>
                    {getSortIndicator(column.key)}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyRow}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedRows.map((row, rowIndex) => (
              <tr
                key={
                  typeof rowKey === 'function'
                    ? rowKey(row, rowIndex)
                    : row?.[rowKey]
                }
              >
                {columns.map((column) => {
                  const fillField = column.fillField;
                  const tdClassName = fillField
                    ? getFillCellClassName(fillField, rowIndex)
                    : '';

                  const content = column.renderCell
                    ? column.renderCell(row, {
                        rowIndex,
                        wrapWithFill,
                      })
                    : row?.[column.key];

                  return (
                    <td
                      key={column.key}
                      className={[
                        tdClassName,
                        column.cellClassName || column.columnClassName,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                      onMouseEnter={
                        fillField
                          ? () => handleCellMouseEnter(fillField, rowIndex)
                          : undefined
                      }
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EditableDataTable;
