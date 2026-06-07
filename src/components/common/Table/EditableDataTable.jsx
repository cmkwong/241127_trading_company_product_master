import { useCallback, useEffect, useMemo, useState } from 'react';
import EditableDataTableBody from './EditableDataTableBody';
import EditableDataTableHeader from './EditableDataTableHeader';
import styles from './EditableDataTable.module.css';

const getDefaultRowKey = (row, index) => row?.id || index;
const COLUMN_SIZE_MAP = {
  S: 90,
  M: 130,
  L: 350,
  XL: 600,
  XXL: 800,
};

const toCssWidth = (value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return `${value}px`;
  }

  return String(value);
};

const EditableDataTable = ({
  rows = [],
  columns = [],
  rowKey = getDefaultRowKey,
  emptyMessage = 'No data',
  onFillCellChange,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnFilters, setColumnFilters] = useState({});
  const [isFilterRowOpen, setIsFilterRowOpen] = useState(false);
  const [fillDrag, setFillDrag] = useState(null);
  const [fillHoverIndex, setFillHoverIndex] = useState(null);

  const normalizedColumns = useMemo(() => {
    return columns.map((column) => {
      const normalizedSizeKey = String(column?.size || '')
        .trim()
        .toUpperCase();
      const mappedSize = COLUMN_SIZE_MAP[normalizedSizeKey];

      const resolvedWidth =
        toCssWidth(column?.width) ||
        (mappedSize ? `${mappedSize}px` : undefined);
      const resolvedMinWidth =
        toCssWidth(column?.minWidth) ||
        (mappedSize ? `${mappedSize}px` : undefined);
      const resolvedMaxWidth =
        toCssWidth(column?.maxWidth) ||
        (mappedSize ? `${mappedSize}px` : undefined);

      return {
        ...column,
        width: resolvedWidth,
        minWidth: resolvedMinWidth,
        maxWidth: resolvedMaxWidth,
      };
    });
  }, [columns]);

  const primaryColumns = useMemo(() => {
    const rows = normalizedColumns.filter((column) => !column?.nextRow);
    return rows.length > 0 ? rows : normalizedColumns;
  }, [normalizedColumns]);

  const tailColumns = useMemo(() => {
    return normalizedColumns.filter((column) => column?.nextRow);
  }, [normalizedColumns]);

  const filteredRows = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([, value]) =>
      String(value || '').trim(),
    );

    if (activeFilters.length === 0) {
      return rows;
    }

    return rows.filter((row) => {
      return activeFilters.every(([columnKey, query]) => {
        const column = normalizedColumns.find((item) => item.key === columnKey);
        if (!column) {
          return true;
        }

        const getFilterValue =
          column.getFilterValue ||
          column.getSortValue ||
          ((target) => target?.[column.key]);

        const value = getFilterValue(row);
        return String(value ?? '')
          .toLowerCase()
          .includes(String(query).trim().toLowerCase());
      });
    });
  }, [rows, normalizedColumns, columnFilters]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return filteredRows;

    const column = normalizedColumns.find(
      (item) => item.key === sortConfig.key,
    );
    if (!column) return filteredRows;

    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    const sortType = column.sortType || 'string';

    return [...filteredRows].sort((a, b) => {
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
  }, [filteredRows, normalizedColumns, sortConfig]);

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

  const handleFilterChange = useCallback((columnKey, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  }, []);

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
      <div className={styles.tableControlsRow}>
        <button
          type="button"
          className={styles.filterCollapseButton}
          onClick={() => setIsFilterRowOpen((prev) => !prev)}
          title={isFilterRowOpen ? 'Collapse filter row' : 'Expand filter row'}
          aria-label={
            isFilterRowOpen ? 'Collapse filter row' : 'Expand filter row'
          }
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isFilterRowOpen ? (
              <polyline points="18 15 12 9 6 15" />
            ) : (
              <polyline points="6 9 12 15 18 9" />
            )}
          </svg>
        </button>
      </div>

      <table className={styles.dataTable}>
        <EditableDataTableHeader
          columns={primaryColumns}
          sortConfig={sortConfig}
          onSort={handleSort}
          filters={columnFilters}
          onFilterChange={handleFilterChange}
          isFilterRowOpen={isFilterRowOpen}
        />
        <EditableDataTableBody
          rows={sortedRows}
          columns={primaryColumns}
          tailColumns={tailColumns}
          rowKey={rowKey}
          emptyMessage={emptyMessage}
          getFillCellClassName={getFillCellClassName}
          handleCellMouseEnter={handleCellMouseEnter}
          wrapWithFill={wrapWithFill}
        />
      </table>
    </div>
  );
};

export default EditableDataTable;
