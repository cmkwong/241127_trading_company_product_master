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
}) => {
  const getRowItemStyle = (column) => {
    const minWidth =
      column?.rowItemMinWidth ||
      column?.minWidth ||
      column?.width ||
      '220px';
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
        <div key={resolveRowKey(row, rowIndex)} className={styles.RowWrap}>
          {rowGroups.map((group, groupIndex) => (
            <div
              key={`${resolveRowKey(row, rowIndex)}-row-${String(groupIndex)}`}
              className={styles.RowTr}
              role="row"
            >
              <div
                className={[
                  styles.RowCell,
                  groupIndex === 0 && showRemoveRow
                    ? styles.RowCellReserveRemove
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
                          fillField && typeof handleCellMouseEnter === 'function'
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
          {showRemoveRow && (
            <RemoveRowBtn
              className={styles.RowRemoveBtn}
              onClick={() => onRemoveRow(row, rowIndex)}
              ariaLabel={`Remove row ${rowIndex + 1}`}
            />
          )}
        </div>
      ))}
    </Frame>
  );
};

export default EditableDataFormBody;
