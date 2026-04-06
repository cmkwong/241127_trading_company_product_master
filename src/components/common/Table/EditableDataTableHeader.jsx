import styles from './EditableDataTable.module.css';

const EditableDataTableHeader = ({
  columns,
  sortConfig,
  onSort,
  filters,
  onFilterChange,
}) => {
  const getSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return '';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
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
              onClick={() => onSort(column)}
              disabled={column.sortable === false}
            >
              {column.label}
              <span className={styles.sortIndicator}>
                {getSortIndicator(column.key)}
              </span>
            </button>
          </th>
        ))}
      </tr>
      <tr className={styles.filterRow}>
        {columns.map((column) => {
          const isFilterable = column.filterable !== false;

          return (
            <th
              key={`${column.key}-filter`}
              className={column.headerClassName || column.columnClassName}
              style={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
              }}
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
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default EditableDataTableHeader;
