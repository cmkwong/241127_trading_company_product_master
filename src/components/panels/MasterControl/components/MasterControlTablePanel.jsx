import { memo } from 'react';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import styles from '../Main_MasterControl.module.css';

const MasterControlTablePanel = ({
  error,
  rows,
  columns,
  rowKey,
  onAddRow,
  canAddRow = true,
}) => {
  const isEmpty = (rows || []).length === 0;

  const emptyMessage =
    isEmpty && typeof onAddRow === 'function' ? (
      <div className={styles.emptyStateAction}>
        <AddNewBtn
          onClick={onAddRow}
          text="Add Row"
          className={styles.emptyAddRowBtn}
          disabled={!canAddRow}
        />
      </div>
    ) : (
      'No rows in this table.'
    );

  return (
    <section className={styles.tableSection}>
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.tableWrap}>
        <EditableDataTable
          rows={rows}
          columns={columns}
          rowKey={rowKey}
          emptyMessage={emptyMessage}
        />
      </div>
    </section>
  );
};

export default memo(MasterControlTablePanel);
