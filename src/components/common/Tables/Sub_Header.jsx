const Sub_Header = ({
  columns = [],
  showIndexColumn = false,
  indexHeaderLabel = '#',
  indexHeaderClassName,
  headerRowClassName,
  headerCellClassName,
  sortableHeaderClassName,
  headerLabelClassName,
  sortIndicatorClassName,
  sortIndicatorMap,
  colResizeHandleClassName,
  crossHoverColClassName,
  hoverColumnKey,
  sortState,
  onSort,
  onResizeStart,
  showSearchBar = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchRowClassName,
  searchCellClassName,
  searchInputClassName,
  extraHeaderRow,
}) => {
  const getClassName = (column) => {
    const sortable = column.sortable !== false;
    return [
      headerCellClassName,
      sortable ? sortableHeaderClassName : '',
      hoverColumnKey === column.key ? crossHoverColClassName : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <>
      <tr className={headerRowClassName}>
        {showIndexColumn ? (
          <th className={indexHeaderClassName} aria-label="Row index">
            {indexHeaderLabel}
          </th>
        ) : null}

        {columns.map((column) => {
          const sortable = column.sortable !== false;
          const activeDir =
            sortState?.columnKey === column.key ? sortState.direction : null;
          const indicator =
            sortIndicatorMap?.[column.key] ??
            (activeDir === 'asc' ? '▲' : activeDir === 'desc' ? '▼' : '');

          return (
            <th
              key={column.key}
              className={getClassName(column)}
              aria-sort={
                activeDir === 'asc'
                  ? 'ascending'
                  : activeDir === 'desc'
                    ? 'descending'
                    : undefined
              }
              onMouseDown={() => onSort?.(column)}
            >
              <span className={headerLabelClassName}>
                {column.label ?? column.key}
              </span>
              {indicator ? (
                <span className={sortIndicatorClassName}>{indicator}</span>
              ) : null}
              {onResizeStart ? (
                <span
                  className={colResizeHandleClassName}
                  onMouseDown={(event) => onResizeStart(column, event)}
                />
              ) : null}
            </th>
          );
        })}
      </tr>

      {showSearchBar ? (
        <tr className={searchRowClassName}>
          <th
            className={searchCellClassName}
            colSpan={columns.length + (showIndexColumn ? 1 : 0)}
          >
            <input
              type="text"
              className={searchInputClassName}
              value={searchValue}
              placeholder={searchPlaceholder}
              onChange={(event) => onSearchChange?.(event.target.value)}
              aria-label="Table search"
            />
          </th>
        </tr>
      ) : null}

      {extraHeaderRow || null}
    </>
  );
};

export default Sub_Header;
