import PropTypes from 'prop-types';
import styles from './ModuleTopBar.module.css';

const ModuleTopBar = ({ moduleName, onRefresh, isRefreshing }) => {
  return (
    <div className={styles.moduleToolbar}>
      <div className={styles.moduleName}>{moduleName || 'Module'}</div>
      <button
        type="button"
        className={styles.refreshButton}
        onClick={onRefresh}
        disabled={isRefreshing}
        title="Refresh"
        aria-label="Refresh"
      >
        <span
          className={`${styles.refreshIcon} ${
            isRefreshing ? styles.refreshIconSpinning : ''
          }`}
          aria-hidden="true"
        >
          ↻
        </span>
        <span className={styles.refreshLabel}>Refresh</span>
      </button>
    </div>
  );
};

ModuleTopBar.propTypes = {
  moduleName: PropTypes.string,
  onRefresh: PropTypes.func,
  isRefreshing: PropTypes.bool,
};

export default ModuleTopBar;
