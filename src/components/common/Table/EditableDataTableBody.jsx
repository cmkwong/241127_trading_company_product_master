import { Fragment } from 'react';
import Frame from '../Layouts/Frame';
import styles from './EditableDataTable.module.css';

const EditableDataTableBody = ({
  rows,
  columns,
  tailColumnGroups = [],
  rowKey,
  emptyMessage,
  getFillCellClassName,
  handleCellMouseEnter,
  wrapWithFill,
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
      {rows.map((row, rowIndex) => (
        <Fragment
          key={
            typeof rowKey === 'function'
              ? String(rowKey(row, rowIndex))
              : String(row?.[rowKey])
          }
        >
          <Frame
            direction="horizontal"
            gap={0}
            key={
              typeof rowKey === 'function'
                ? `${String(rowKey(row, rowIndex))}-primary`
                : `${String(row?.[rowKey])}-primary`
            }
            className={styles.dataRow}
            role="row"
          >
            {columns.map((column) => {
              const fillField = column.fillField;
              const cellClassName = fillField
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
                    styles.dataCell,
                    cellClassName,
                    column.cellClassName || column.columnClassName,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={getColumnLayoutStyle(column)}
                  onMouseEnter={
                    fillField
                      ? () => handleCellMouseEnter(fillField, rowIndex)
                      : undefined
                  }
                  role="cell"
                >
                  {content}
                </div>
              );
            })}
          </Frame>

          {tailColumnGroups.map((tailColumns, tailGroupIndex) => (
            <div
              key={
                typeof rowKey === 'function'
                  ? `${String(rowKey(row, rowIndex))}-tail-${String(tailGroupIndex)}`
                  : `${String(row?.[rowKey])}-tail-${String(tailGroupIndex)}`
              }
              className={styles.nextRowTr}
              role="row"
            >
              <div className={styles.nextRowCell} role="cell">
                <div className={styles.nextRowGrid}>
                  {tailColumns.map((column) => {
                    const content = column.renderCell
                      ? column.renderCell(row, {
                          rowIndex,
                          wrapWithFill,
                        })
                      : row?.[column.key];
                    const tailMinWidth =
                      column?.nextRowMinWidth ||
                      column?.minWidth ||
                      column?.width ||
                      '220px';
                    const tailMaxWidth =
                      column?.nextRowMaxWidth || column?.maxWidth || undefined;

                    return (
                      <div
                        key={column.key}
                        className={[
                          styles.nextRowItem,
                          column.cellClassName || column.columnClassName,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{
                          '--next-row-item-min-width': tailMinWidth,
                          ...(tailMaxWidth
                            ? { '--next-row-item-max-width': tailMaxWidth }
                            : {}),
                        }}
                      >
                        <div className={styles.nextRowLabel}>
                          {column.label}
                        </div>
                        <div className={styles.nextRowValue}>{content}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </Fragment>
      ))}
    </Frame>
  );
};

export default EditableDataTableBody;
