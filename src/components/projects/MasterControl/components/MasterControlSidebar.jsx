import styles from '../Main_MasterControl.module.css';

const MasterControlSidebar = ({ tableNames = [], selectedTable, onSelect }) => {
  return (
    <aside className={styles.sidebar}>
      {tableNames.map((tableName) => (
        <button
          key={tableName}
          type="button"
          className={`${styles.tableBtn} ${selectedTable === tableName ? styles.activeTableBtn : ''}`}
          onClick={() => onSelect(tableName)}
        >
          {tableName}
        </button>
      ))}
    </aside>
  );
};

export default MasterControlSidebar;
