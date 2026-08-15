import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import styles from '../Main_MasterControl.module.css';

const MasterControlHeader = ({
  isLoading,
  isSaving,
  selectedTable,
  canEdit,
  onReload,
  onAddRow,
  showAddRowAction = true,
  showCopyDateRangeAction = false,
  onCopyDateRange,
}) => {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>Master Control</h2>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onReload}
          disabled={!selectedTable || isLoading || isSaving}
        >
          {isLoading ? 'Reloading...' : 'Reload'}
        </button>
        {showCopyDateRangeAction ? (
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onCopyDateRange}
            disabled={!selectedTable || isLoading || isSaving || !canEdit}
          >
            Copy Date Range
          </button>
        ) : null}
        {showAddRowAction ? (
          <AddNewBtn
            onClick={onAddRow}
            text="Add Row"
            className={styles.inlineAddBtn}
            disabled={!selectedTable || isSaving || !canEdit}
          />
        ) : null}
      </div>
    </div>
  );
};

export default MasterControlHeader;
