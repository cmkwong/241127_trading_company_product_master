import { Fragment } from 'react';
import { useMemo, useState } from 'react';
import Sub_Header from './Sub_Header';
import Sub_TableEmptyRow from './Sub_TableEmptyRow';
import {
  compareCellValues,
  getDefaultRowKey,
  normalizeColumns,
  resolveColumnWidth,
} from './tableShared';
import styles from './Main_ViewTables.module.css';

const INDEX_COLUMN_WIDTH = 48;

const Main_ViewTables = ({
  rows = [],
  columns = [],
  rowKey = getDefaultRowKey,
  emptyMessage = 'No data',
  sortState,
  getSortValue,
  onSort,
  sortIndicator = {},
  showIndexColumn = false,
  headerRowClassName,
  filterRowClassName,
  filterRow,
  rowClassName,
  selectedRowClassName,
  getIsRowSelected,
  renderAfterRow,
  onRowClick,
  onRowDoubleClick,
  setRowRef,
  rowDataAttr = 'data-item-id',
  rowTabIndex = -1,
  colClassNameMap = {},
  renderCell,
  minWidth,
  className,
  tableClassName,
  wrapClassName,
  emptyCellClassName,
  showHeaderSearch = false,
  headerSearchValue,
  onHeaderSearchChange,
  headerSearchPlaceholder = 'Search in table...',
}) => {
  const [internalHeaderSearch, setInternalHeaderSearch] = useState('');
  const normalizedColumns = useMemo(() => normalizeColumns(columns), [columns]);

  const activeHeaderSearch =
    headerSearchValue !== undefined ? headerSearchValue : internalHeaderSearch;

  const handleHeaderSearchChange = (nextValue) => {
    if (typeof onHeaderSearchChange === 'function') {
      onHeaderSearchChange(nextValue);
      return;
    }
    setInternalHeaderSearch(nextValue);
  };

  const resolveRowKey = (row, index) =>
    typeof rowKey === 'function'
      ? String(rowKey(row, index))
      : String(row?.[rowKey]);

  const displayRows = useMemo(() => {
    const baseRows =
      showHeaderSearch && String(activeHeaderSearch || '').trim()
        ? rows.filter((row) => {
            const query = String(activeHeaderSearch).trim().toLowerCase();
            return normalizedColumns.some((column) => {
              const value = row?.[column.key];
              return String(value ?? '')
                .toLowerCase()
                .includes(query);
            });
          })
        : rows;

    if (!sortState?.columnKey) return baseRows;

    const direction = sortState.direction === 'desc' ? -1 : 1;
    const column = normalizedColumns.find(
      (candidate) => candidate.key === sortState.columnKey,
    );

    if (!column) return baseRows;

    return baseRows
      .map((row, index) => ({ row, index }))
      .sort((left, right) => {
        const leftValue =
          typeof getSortValue === 'function'
            ? getSortValue(column, left.row)
            : left.row?.[column.key];
        const rightValue =
          typeof getSortValue === 'function'
            ? getSortValue(column, right.row)
            : right.row?.[column.key];

        const result = compareCellValues(leftValue, rightValue);
        if (result !== 0) return result * direction;
        return left.index - right.index;
      })
      .map(({ row }) => row);
  }, [
    rows,
    normalizedColumns,
    sortState,
    getSortValue,
    showHeaderSearch,
    activeHeaderSearch,
  ]);

  const totalWidth = useMemo(() => {
    const columnWidthSum = normalizedColumns.reduce(
      (sum, column) => sum + resolveColumnWidth(column),
      0,
    );
    return showIndexColumn
      ? columnWidthSum + INDEX_COLUMN_WIDTH
      : columnWidthSum;
  }, [normalizedColumns, showIndexColumn]);

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div
        className={[styles.tableScroll, wrapClassName]
          .filter(Boolean)
          .join(' ')}
      >
        <table
          className={[styles.table, tableClassName].filter(Boolean).join(' ')}
          style={{
            ...(minWidth ? { minWidth } : {}),
            width: `${totalWidth}px`,
          }}
        >
          <colgroup>
            {showIndexColumn ? (
              <col style={{ width: INDEX_COLUMN_WIDTH }} />
            ) : null}
            {normalizedColumns.map((column) => (
              <col
                key={column.key}
                style={{ width: `${resolveColumnWidth(column)}px` }}
              />
            ))}
          </colgroup>

          <thead>
            <Sub_Header
              columns={normalizedColumns}
              showIndexColumn={showIndexColumn}
              indexHeaderLabel="#"
              indexHeaderClassName={styles.indexHeader}
              headerRowClassName={headerRowClassName}
              headerCellClassName={styles.headerCell}
              sortableHeaderClassName={styles.sortableHeader}
              headerLabelClassName={styles.headerLabel}
              sortIndicatorClassName={styles.sortIndicator}
              sortIndicatorMap={sortIndicator}
              sortState={sortState}
              onSort={onSort}
              showSearchBar={showHeaderSearch}
              searchValue={activeHeaderSearch}
              onSearchChange={handleHeaderSearchChange}
              searchPlaceholder={headerSearchPlaceholder}
              searchRowClassName={styles.searchHeaderRow}
              searchCellClassName={styles.searchHeaderCell}
              searchInputClassName={styles.searchInput}
              extraHeaderRow={
                filterRow ? (
                  <tr className={filterRowClassName || styles.filterRow}>
                    {showIndexColumn ? (
                      <th className={styles.indexHeader} />
                    ) : null}
                    {filterRow}
                  </tr>
                ) : null
              }
            />
          </thead>

          <tbody>
            {displayRows.length > 0 ? (
              displayRows.map((row, rowIndex) => {
                const key = resolveRowKey(row, rowIndex);
                const isSelected =
                  typeof getIsRowSelected === 'function'
                    ? getIsRowSelected(row, rowIndex, key)
                    : false;

                const combinedRowClassName = [
                  rowClassName ? rowClassName(row, rowIndex, key) : '',
                  isSelected ? selectedRowClassName : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <Fragment key={key}>
                    <tr
                      ref={(element) => setRowRef?.(key, element)}
                      {...(rowDataAttr ? { [rowDataAttr]: key } : {})}
                      tabIndex={rowTabIndex}
                      className={combinedRowClassName}
                      onClick={() => onRowClick?.(row, rowIndex, key)}
                      onDoubleClick={(event) =>
                        onRowDoubleClick?.(event, row, rowIndex, key)
                      }
                    >
                      {showIndexColumn ? (
                        <td className={styles.indexCell}>{rowIndex + 1}</td>
                      ) : null}
                      {normalizedColumns.map((column, columnIndex) => (
                        <td
                          key={`${key}-${column.key}`}
                          className={[
                            styles.cell,
                            colClassNameMap[column.key] || '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {renderCell?.({
                            row,
                            rowIndex,
                            rowKey: key,
                            column,
                            columnIndex,
                          }) ?? row?.[column.key]}
                        </td>
                      ))}
                    </tr>
                    {renderAfterRow?.(row, rowIndex, key)}
                  </Fragment>
                );
              })
            ) : (
              <Sub_TableEmptyRow
                className={emptyCellClassName || styles.emptyCell}
                colSpan={
                  (normalizedColumns.length || 1) + (showIndexColumn ? 1 : 0)
                }
                message={emptyMessage}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Main_ViewTables;
