import PropTypes from 'prop-types';
import styles from './Main_FileSelector.module.css';
import { buildBreadcrumb } from './fileSelectorUtils';
import { ChevronRightIcon, RefreshIcon } from './FileSelectorIcons';

/**
 * Address-bar style breadcrumb: drive › root › folder segments with click-to-
 * jump navigation, plus a refresh button. Purely presentational.
 */
const Sub_FileSelectorBreadcrumb = ({
  publicPath,
  storage,
  onNavigate,
  onRefresh,
  disabled,
}) => {
  const crumbs = buildBreadcrumb(publicPath, storage);

  return (
    <div className={styles.addressBar}>
      <div className={styles.addressCrumbs}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const clickable = crumb.path && !isLast;
          return (
            <span key={`${crumb.kind}-${crumb.label}-${index}`} className={styles.crumbGroup}>
              <button
                type="button"
                className={`${styles.crumb} ${clickable ? styles.crumbClickable : ''} ${isLast ? styles.crumbLast : ''}`}
                onClick={() => clickable && onNavigate(crumb.path)}
                disabled={!clickable}
                title={crumb.label}
              >
                {crumb.label}
              </button>
              {!isLast && (
                <ChevronRightIcon size={12} className={styles.crumbSeparator} />
              )}
            </span>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.addressRefresh}
        onClick={onRefresh}
        disabled={disabled}
        title="Refresh"
        aria-label="Refresh"
      >
        <RefreshIcon size={14} />
      </button>
    </div>
  );
};

Sub_FileSelectorBreadcrumb.propTypes = {
  publicPath: PropTypes.string,
  storage: PropTypes.shape({
    driveLabel: PropTypes.string,
    rootLabel: PropTypes.string,
  }),
  onNavigate: PropTypes.func,
  onRefresh: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Sub_FileSelectorBreadcrumb;
