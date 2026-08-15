import EditableDataTable from '../../../common/Table/EditableDataTable';
import styles from '../Main_MasterControl.module.css';

const MasterControlTablePanel = ({ error, rows, columns, rowKey }) => {
  return (
    <section className={styles.tableSection}>
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.tableWrap}>
        <EditableDataTable
          rows={rows}
          columns={columns}
          rowKey={rowKey}
          emptyMessage="No rows in this table."
        />
      </div>
    </section>
  );
};

export default MasterControlTablePanel;
