import styles from './EditableDataTable.module.css';
import Frame from '../Layouts/Frame';

const EditableDataTableHeader = ({
  columns,
  sortConfig,
  onSort,
  filters,
  onFilterChange,
  isFilterRowOpen,
}) => {
  const getColumnLayoutStyle = (column) => {
    if (column.width) {
      return {
        flex: `0 0 ${column.width}`,
        width: column.width,
        minWidth: column.minWidth || column.width,
        maxWidth: column.maxWidth || column.width,
      };
    }

    if (column.minWidth && column.maxWidth) {
      return {
        flex: `1 1 ${column.minWidth}`,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
      };
    }

    if (column.minWidth) {
      return {
        flex: `1 1 ${column.minWidth}`,
        minWidth: column.minWidth,
      };
    }

    return {
      flex: '1 1 120px',
      minWidth: '120px',
    };
  };

  const getSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return '';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <Frame direction="vertical" gap={0} className={styles.tableHeader}>
      <Frame
        direction="horizontal"
        gap={0}
        className={styles.dataRow}
        role="row"
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={[
              styles.headerCell,
              column.headerClassName || column.columnClassName,
            ]
              .filter(Boolean)
              .join(' ')}
            style={getColumnLayoutStyle(column)}
            role="columnheader"
          >
            <button
              type="button"
              className={styles.sortButton}
              onClick={() => onSort(column)}
              disabled={column.sortable === false}
            >
              {column.label}
              <span className={styles.sortIndicator}>
                {getSortIndicator(column.key)}
              </span>
            </button>
          </div>
        ))}
      </Frame>

      {isFilterRowOpen && (
        <Frame
          direction="horizontal"
          gap={0}
          className={`${styles.dataRow} ${styles.filterRow}`}
          role="row"
        >
          {columns.map((column) => {
            const isFilterable = column.filterable !== false;

            return (
              <div
                key={`${column.key}-filter`}
                className={[
                  styles.headerCell,
                  column.headerClassName || column.columnClassName,
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={getColumnLayoutStyle(column)}
                role="cell"
              >
                {isFilterable ? (
                  <input
                    type="text"
                    value={filters[column.key] || ''}
                    onChange={(event) =>
                      onFilterChange(column.key, event.target.value)
                    }
                    className={styles.filterInput}
                    placeholder="Filter..."
                    aria-label={`Filter ${column.label}`}
                  />
                ) : (
                  <div className={styles.filterInputPlaceholder} />
                )}
              </div>
            );
          })}
        </Frame>
      )}
    </Frame>
  );
};

export default EditableDataTableHeader;
