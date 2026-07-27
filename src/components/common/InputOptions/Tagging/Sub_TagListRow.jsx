import styles from './Sub_TagListRow.module.css';

const Sub_TagListRow = (props) => {
  const {
    id,
    name,
    checked,
    updateOptionData,
    level = 0,
    hasChildren = false,
    isCollapsed = false,
    showHierarchy = false,
    onToggleCollapse,
  } = props;

  const handleChange = (event) => {
    updateOptionData(id, event.target.checked);
  };

  const handleClick = (event) => {
    if (event.target?.closest?.(`.${styles.collapseButton}`)) {
      return;
    }

    updateOptionData(id, !checked);
  };

  const handleToggleCollapse = (event) => {
    event.stopPropagation();
    onToggleCollapse?.(id);
  };

  const renderFolderIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1.75 4.5a1 1 0 0 1 1-1h3l1.15 1.35h6.35a1 1 0 0 1 1 1v5.4a1 1 0 0 1-1 1H2.75a1 1 0 0 1-1-1V4.5Z" />
    </svg>
  );

  return (
    <div
      id={id}
      className={styles['container']}
      onClick={handleClick}
      style={{ paddingLeft: `${level * 24}px` }}
    >
      {showHierarchy && hasChildren ? (
        <button
          type="button"
          className={styles.collapseButton}
          onClick={handleToggleCollapse}
          aria-label={isCollapsed ? 'Expand children' : 'Collapse children'}
          title={isCollapsed ? 'Expand children' : 'Collapse children'}
        >
          {renderFolderIcon()}
        </button>
      ) : null}
      <input
        className={styles['checkbox']}
        id={id}
        name={name}
        checked={Boolean(checked)}
        onChange={handleChange}
        onClick={(event) => event.stopPropagation()}
        type="checkbox"
      />
      <p id={id} className={styles.label}>
        {name}
      </p>
    </div>
  );
};

export default Sub_TagListRow;
