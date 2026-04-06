import styles from './EditableDataTable.module.css';

const EditableDataTableBody = ({
  rows,
  columns,
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
        <tr
          key={
            typeof rowKey === 'function' ? rowKey(row, rowIndex) : row?.[rowKey]
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
      ))}
    </tbody>
  );
};

export default EditableDataTableBody;
