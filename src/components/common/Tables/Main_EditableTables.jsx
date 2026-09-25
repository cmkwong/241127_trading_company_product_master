import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AddNewBtn from '../Buttons/AddNewBtn';
import Sub_ExcelCell from './Sub_ExcelCell';
import styles from './Main_EditableTables.module.css';

const COLUMN_SIZE_MAP = {
  S: 90,
  M: 130,
  L: 220,
  XL: 360,
  XXL: 560,
};

const INDEX_COLUMN_WIDTH = 48;
const DEFAULT_COLUMN_WIDTH = '180px';
const MIN_COLUMN_WIDTH = 60;

const toCssWidth = (value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return `${value}px`;
  }

  return String(value);
};

const toNumericWidth = (value) => {
  const parsed = parseFloat(String(value || '').replace(/px/gi, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const isNumericValue = (value) => {
  if (typeof value === 'number') return true;
  if (typeof value === 'string' && value.trim() !== '') {
    return Number.isFinite(Number(value));
  }
  return false;
};

const compareCellValues = (a, b) => {
  const aBlank = a === null || a === undefined || a === '';
  const bBlank = b === null || b === undefined || b === '';
  if (aBlank && bBlank) return 0;
  if (aBlank) return 1;
  if (bBlank) return -1;

  if (isNumericValue(a) && isNumericValue(b)) {
    return Number(a) - Number(b);
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

const CELL_FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const getDefaultRowKey = (row, index) => row?.id ?? index;

/**
 * Excel-like editable grid.
 *
 * Columns: `{ key, label, renderCell(row, { rowIndex }), size, width, fillable,
 *   fillField, getFillValue(row) }`
 * Callbacks: `onCellChange(rowKey, columnKey, value)` (fill-drag copy and
 *   double-click fill-down),
 *   `onInsertRowAfter(row, rowIndex)`, `onDeleteRow(row, rowIndex)` (context menu),
 *   `onAddRow` (footer button).
 */
const Main_EditableTables = ({
  rows = [],
  columns = [],
  rowKey = getDefaultRowKey,
  emptyMessage = 'No data',
  canEdit = true,
  onCellChange,
  onInsertRowAfter,
  onDeleteRow,
  onAddRow,
  addRowText = 'Add New',
  addRowDisabled = false,
  addRowHint,
  minColumnWidth = MIN_COLUMN_WIDTH,
}) => {
  const [activeCell, setActiveCell] = useState(null); // { rowIndex, columnKey }
  const [fillDrag, setFillDrag] = useState(null); // { columnKey, sourceRowIndex, value }
  const [fillHoverIndex, setFillHoverIndex] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, row, rowIndex }
  const [sortState, setSortState] = useState(null); // { columnKey, direction }
  const [colWidths, setColWidths] = useState({}); // { [columnKey]: number }
  const [hoverCell, setHoverCell] = useState(null); // { rowIndex, columnKey }
  const menuRef = useRef(null);
  const resizeStartRef = useRef(null);

  const showAddRow = typeof onAddRow === 'function';
  const showContextMenu =
    typeof onInsertRowAfter === 'function' || typeof onDeleteRow === 'function';

  const resolveRowKey = useCallback(
    (row, index) =>
      typeof rowKey === 'function'
        ? String(rowKey(row, index))
        : String(row?.[rowKey]),
    [rowKey],
  );

  const normalizedColumns = useMemo(
    () =>
      columns.map((column) => {
        const sizeKey = String(column?.size || '').trim().toUpperCase();
        const mappedSize = COLUMN_SIZE_MAP[sizeKey];
        const width =
          toCssWidth(column?.width) ||
          (mappedSize ? `${mappedSize}px` : DEFAULT_COLUMN_WIDTH);

        return { ...column, width };
      }),
    [columns],
  );

  const isFillableColumn = useCallback(
    (column) => column?.fillable !== false,
    [],
  );

  const getFillValue = useCallback((column, row) => {
    if (typeof column?.getFillValue === 'function') {
      return column.getFillValue(row);
    }
    if (column?.fillField != null) {
      return row?.[column.fillField];
    }
    return row?.[column.key];
  }, []);

  const getCellValue = useCallback((column, row) => {
    if (typeof column?.getCellValue === 'function') {
      return column.getCellValue(row);
    }
    if (column?.fillField != null) {
      return row?.[column.fillField];
    }
    return row?.[column.key];
  }, []);

  const getSortValue = useCallback(
    (column, row) => {
      if (typeof column?.getSortValue === 'function') {
        return column.getSortValue(row);
      }
      return getCellValue(column, row);
    },
    [getCellValue],
  );

  const isColumnEditable = useCallback((column, row) => {
    if (typeof column?.editable === 'function') return column.editable(row);
    if (column?.editable === false) return false;
    return true;
  }, []);

  const resolveColumnWidth = useCallback(
    (column) => {
      if (colWidths[column.key] != null) return colWidths[column.key];
      return toNumericWidth(column.width) ?? 180;
    },
    [colWidths],
  );

  const displayRows = useMemo(() => {
    if (!sortState) return rows;

    const column = normalizedColumns.find(
      (candidate) => candidate.key === sortState.columnKey,
    );
    if (!column) return rows;

    const direction = sortState.direction === 'desc' ? -1 : 1;

    return rows
      .map((row, index) => ({ row, index }))
      .sort((x, y) => {
        const cmp = compareCellValues(
          getSortValue(column, x.row),
          getSortValue(column, y.row),
        );
        if (cmp !== 0) return cmp * direction;
        return x.index - y.index;
      })
      .map(({ row }) => row);
  }, [rows, normalizedColumns, sortState, getSortValue]);

  const handleSortClick = useCallback((column) => {
    if (column?.sortable === false) return;
    setSortState((prev) => {
      if (prev && prev.columnKey === column.key) {
        if (prev.direction === 'asc') {
          return { columnKey: column.key, direction: 'desc' };
        }
        return null;
      }
      return { columnKey: column.key, direction: 'asc' };
    });
  }, []);

  const startResize = useCallback(
    (column, event) => {
      event.preventDefault();
      event.stopPropagation();
      resizeStartRef.current = {
        columnKey: column.key,
        startX: event.clientX,
        startWidth: resolveColumnWidth(column),
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [resolveColumnWidth],
  );

  useEffect(() => {
    const handleMouseMove = (event) => {
      const resize = resizeStartRef.current;
      if (!resize) return;

      const nextWidth = Math.max(
        minColumnWidth,
        resize.startWidth + (event.clientX - resize.startX),
      );
      setColWidths((prev) => ({ ...prev, [resize.columnKey]: nextWidth }));
    };

    const handleMouseUp = () => {
      resizeStartRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minColumnWidth]);

  const totalWidth = useMemo(
    () =>
      INDEX_COLUMN_WIDTH +
      normalizedColumns.reduce(
        (sum, column) => sum + resolveColumnWidth(column),
        0,
      ),
    [normalizedColumns, resolveColumnWidth],
  );

  const startFillDrag = useCallback(
    (column, rowIndex, row, event) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !canEdit ||
        !isFillableColumn(column) ||
        typeof onCellChange !== 'function'
      ) {
        return;
      }

      const value = getFillValue(column, row);
      setFillDrag({ columnKey: column.key, sourceRowIndex: rowIndex, value });
      setFillHoverIndex(rowIndex);
    },
    [canEdit, isFillableColumn, onCellChange, getFillValue],
  );

  const applyFill = useCallback(() => {
    if (
      !fillDrag ||
      fillHoverIndex === null ||
      fillHoverIndex === undefined ||
      typeof onCellChange !== 'function'
    ) {
      return;
    }

    const { columnKey, sourceRowIndex, value } = fillDrag;
    if (sourceRowIndex === fillHoverIndex) return;

    const start = Math.min(sourceRowIndex, fillHoverIndex);
    const end = Math.max(sourceRowIndex, fillHoverIndex);

    for (let index = start; index <= end; index += 1) {
      if (index === sourceRowIndex) continue;
      onCellChange(resolveRowKey(displayRows[index], index), columnKey, value);
    }
  }, [fillDrag, fillHoverIndex, onCellChange, resolveRowKey, displayRows]);

  // Excel-like: double-clicking the fill handle copies the source value down
  // through every remaining row (to the end of the table).
  const fillDownToEnd = useCallback(
    (column, rowIndex, row) => {
      if (
        !canEdit ||
        !isFillableColumn(column) ||
        typeof onCellChange !== 'function'
      ) {
        return;
      }

      const lastIndex = displayRows.length - 1;
      if (lastIndex <= rowIndex) return;

      const value = getFillValue(column, row);

      for (let index = rowIndex + 1; index <= lastIndex; index += 1) {
        onCellChange(resolveRowKey(displayRows[index], index), column.key, value);
      }
    },
    [
      canEdit,
      isFillableColumn,
      onCellChange,
      displayRows,
      getFillValue,
      resolveRowKey,
    ],
  );

  useEffect(() => {
    const handleMouseUp = () => {
      applyFill();
      setFillDrag(null);
      setFillHoverIndex(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [applyFill]);

  const handleCellMouseEnter = (columnKey, rowIndex) => {
    if (!fillDrag || fillDrag.columnKey !== columnKey) return;
    setFillHoverIndex(rowIndex);
  };

  // Excel-like cross highlight: remember which cell is hovered so its whole
  // row and column can be tinted. Short-circuit when unchanged to avoid
  // re-rendering the grid on every pixel move within the same cell.
  const handleCellHover = useCallback((columnKey, rowIndex) => {
    setHoverCell((prev) =>
      prev && prev.rowIndex === rowIndex && prev.columnKey === columnKey
        ? prev
        : { rowIndex, columnKey },
    );
  }, []);

  const getFillCellClassName = (columnKey, rowIndex) => {
    if (
      !fillDrag ||
      fillHoverIndex === null ||
      fillHoverIndex === undefined ||
      fillDrag.columnKey !== columnKey
    ) {
      return '';
    }

    const start = Math.min(fillDrag.sourceRowIndex, fillHoverIndex);
    const end = Math.max(fillDrag.sourceRowIndex, fillHoverIndex);
    const inRange = rowIndex >= start && rowIndex <= end;

    if (!inRange) return '';
    if (rowIndex === fillDrag.sourceRowIndex) {
      return `${styles.fillPreviewCell} ${styles.fillPreviewSource}`;
    }
    return styles.fillPreviewCell;
  };

  const openContextMenu = useCallback(
    (event, rowIndex) => {
      if (!showContextMenu) return;
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        row: displayRows[rowIndex],
        rowIndex,
      });
    },
    [showContextMenu, displayRows],
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    if (!contextMenu) return undefined;

    const handleMouseDown = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      closeContextMenu();
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeContextMenu();
    };
    const handleScroll = () => closeContextMenu();
    const handleResize = () => closeContextMenu();

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [contextMenu, closeContextMenu]);

  const isCellActive = (rowIndex, columnKey) =>
    activeCell?.rowIndex === rowIndex && activeCell?.columnKey === columnKey;

  const canShowFillHandle = (column) =>
    canEdit &&
    isFillableColumn(column) &&
    typeof onCellChange === 'function';

  const getCellControl = (cell) => cell?.querySelector(CELL_FOCUSABLE_SELECTOR);

  const findAdjacentTabCell = (table, rowIndex, colIndex, direction) => {
    const totalRows = displayRows.length;
    const totalCols = normalizedColumns.length;
    if (totalRows === 0 || totalCols === 0) return null;

    let r = rowIndex;
    let c = colIndex + direction;

    for (let step = 0; step < totalRows * totalCols; step += 1) {
      if (c < 0) {
        r -= 1;
        c = totalCols - 1;
      } else if (c >= totalCols) {
        r += 1;
        c = 0;
      }

      if (r < 0 || r >= totalRows) return null;

      const cell = table.querySelector(
        `td[data-row-index="${r}"][data-col-index="${c}"]`,
      );
      if (cell && getCellControl(cell)) return cell;

      c += direction;
    }

    return null;
  };

  const handleTableKeyDown = (event) => {
    if (event.key !== 'Tab') return;

    const cell = event.target?.closest?.('td[data-col-index]');
    if (!cell) return;

    const table = event.currentTarget;
    if (!table.contains(cell)) return;

    const rowIndex = Number(cell.getAttribute('data-row-index'));
    const colIndex = Number(cell.getAttribute('data-col-index'));
    const direction = event.shiftKey ? -1 : 1;

    const targetCell = findAdjacentTabCell(
      table,
      rowIndex,
      colIndex,
      direction,
    );
    if (!targetCell) return;

    const control = getCellControl(targetCell);
    if (!control) return;

    event.preventDefault();

    const targetRowIndex = Number(targetCell.getAttribute('data-row-index'));
    const targetColIndex = Number(targetCell.getAttribute('data-col-index'));
    const targetColumn = normalizedColumns[targetColIndex];

    control.focus();
    if (typeof control.select === 'function') {
      control.select();
    }
    setActiveCell({ rowIndex: targetRowIndex, columnKey: targetColumn?.key });
  };

  return (
    <div className={styles.root}>
      <div className={styles.tableScroll}>
        <table
          className={styles.table}
          role="grid"
          style={{ width: `${totalWidth}px` }}
          onKeyDown={handleTableKeyDown}
          onMouseLeave={() => setHoverCell(null)}
        >
          <colgroup>
            <col style={{ width: INDEX_COLUMN_WIDTH }} />
            {normalizedColumns.map((column) => (
              <col
                key={column.key}
                style={{ width: `${resolveColumnWidth(column)}px` }}
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              <th className={styles.indexHeader} aria-label="Row index">
                #
              </th>
              {normalizedColumns.map((column) => {
                const sortable = column.sortable !== false;
                const activeDir =
                  sortState?.columnKey === column.key
                    ? sortState.direction
                    : null;
                const colHovered = hoverCell?.columnKey === column.key;

                return (
                  <th
                    key={column.key}
                    className={[
                      styles.headerCell,
                      sortable ? styles.sortableHeader : '',
                      colHovered ? styles.crossHoverCol : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-sort={
                      activeDir === 'asc'
                        ? 'ascending'
                        : activeDir === 'desc'
                          ? 'descending'
                          : undefined
                    }
                    onMouseDown={() => handleSortClick(column)}
                  >
                    <span className={styles.headerLabel}>
                      {column.label ?? column.key}
                    </span>
                    {activeDir && (
                      <span className={styles.sortIndicator}>
                        {activeDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                    <span
                      className={styles.colResizeHandle}
                      onMouseDown={(event) => startResize(column, event)}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className={styles.emptyCell}
                  colSpan={normalizedColumns.length + 1}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayRows.map((row, rowIndex) => {
                const rowHovered = hoverCell?.rowIndex === rowIndex;
                return (
                <tr key={resolveRowKey(row, rowIndex)} className={styles.row}>
                  <td
                    className={[
                      styles.indexCell,
                      rowHovered ? styles.crossHoverRow : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {rowIndex + 1}
                  </td>
                  {normalizedColumns.map((column, columnIndex) => {
                    const isActive = isCellActive(rowIndex, column.key);
                    const fillClass = getFillCellClassName(column.key, rowIndex);
                    const cellEditable =
                      canEdit && isColumnEditable(column, row);
                    const colHovered = hoverCell?.columnKey === column.key;

                    let content;
                    if (column.renderCell) {
                      content = column.renderCell(row, { rowIndex });
                    } else if (
                      cellEditable &&
                      typeof onCellChange === 'function'
                    ) {
                      content = (
                        <Sub_ExcelCell
                          type={column.type}
                          value={getCellValue(column, row)}
                          onCommit={(nextValue) =>
                            onCellChange(
                              resolveRowKey(row, rowIndex),
                              column.key,
                              nextValue,
                            )
                          }
                        />
                      );
                    } else {
                      content = getCellValue(column, row);
                    }

                    const showHandle = isActive && canShowFillHandle(column);

                    return (
                      <td
                        key={column.key}
                        data-row-index={rowIndex}
                        data-col-index={columnIndex}
                        className={[
                          styles.cell,
                          isActive ? styles.cellActive : '',
                          fillClass,
                          rowHovered || colHovered ? styles.crossHover : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onMouseDown={() =>
                          setActiveCell({ rowIndex, columnKey: column.key })
                        }
                        onMouseEnter={() => {
                          handleCellMouseEnter(column.key, rowIndex);
                          handleCellHover(column.key, rowIndex);
                        }}
                        onContextMenu={(event) =>
                          openContextMenu(event, rowIndex)
                        }
                      >
                        <div className={styles.cellInner}>{content}</div>
                        {showHandle && (
                          <span
                            className={styles.fillHandle}
                            role="button"
                            aria-label="Drag to copy value, double-click to fill down"
                            title="Drag to copy value, double-click to fill down"
                            onMouseDown={(event) =>
                              startFillDrag(column, rowIndex, row, event)
                            }
                            onDoubleClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              fillDownToEnd(column, rowIndex, row);
                            }}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddRow && (
        <div className={styles.footerRow}>
          <AddNewBtn
            onClick={onAddRow}
            text={addRowText}
            disabled={addRowDisabled}
          />
          {addRowHint ? (
            <span className={styles.addRowHint}>{addRowHint}</span>
          ) : null}
        </div>
      )}

      {contextMenu &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.contextMenu}
            role="menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onMouseDown={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.preventDefault()}
          >
            {typeof onInsertRowAfter === 'function' && (
              <button
                type="button"
                role="menuitem"
                className={styles.contextMenuItem}
                disabled={!canEdit}
                onClick={() => {
                  onInsertRowAfter(contextMenu.row, contextMenu.rowIndex);
                  closeContextMenu();
                }}
              >
                Insert Below
              </button>
            )}
            {typeof onDeleteRow === 'function' && (
              <button
                type="button"
                role="menuitem"
                className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
                disabled={!canEdit}
                onClick={() => {
                  onDeleteRow(contextMenu.row, contextMenu.rowIndex);
                  closeContextMenu();
                }}
              >
                Delete whole row
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Main_EditableTables;

