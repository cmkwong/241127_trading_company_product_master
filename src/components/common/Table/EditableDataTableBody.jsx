import { Fragment } from 'react';
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
  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className={styles.emptyRow}>
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((row, rowIndex) => (
        <Fragment
          key={
            typeof rowKey === 'function'
              ? String(rowKey(row, rowIndex))
              : String(row?.[rowKey])
          }
        >
          <tr
            key={
              typeof rowKey === 'function'
                ? `${String(rowKey(row, rowIndex))}-primary`
                : `${String(row?.[rowKey])}-primary`
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

          {tailColumnGroups.map((tailColumns, tailGroupIndex) => (
            <tr
              key={
                typeof rowKey === 'function'
                  ? `${String(rowKey(row, rowIndex))}-tail-${String(tailGroupIndex)}`
                  : `${String(row?.[rowKey])}-tail-${String(tailGroupIndex)}`
              }
              className={styles.nextRowTr}
            >
              <td
                colSpan={Math.max(columns.length, 1)}
                className={styles.nextRowCell}
              >
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
              </td>
            </tr>
          ))}
        </Fragment>
      ))}
    </tbody>
  );
};

export default EditableDataTableBody;
