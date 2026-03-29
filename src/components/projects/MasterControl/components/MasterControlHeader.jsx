import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import styles from '../Main_MasterControl.module.css';

const MasterControlHeader = ({
  isLoading,
  isSaving,
  selectedTable,
  canEdit,
  onReload,
  onAddRow,
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
        <AddNewBtn
          onClick={onAddRow}
          text="Add Row"
          className={styles.inlineAddBtn}
          disabled={!selectedTable || isSaving || !canEdit}
        />
      </div>
    </div>
  );
};

export default MasterControlHeader;
