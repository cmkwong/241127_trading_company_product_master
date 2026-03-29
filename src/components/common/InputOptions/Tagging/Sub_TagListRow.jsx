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

  return (
    <div
      id={id}
      className={styles['container']}
      onClick={handleClick}
      style={{ paddingLeft: `${8 + level * 18}px` }}
    >
      {showHierarchy && hasChildren ? (
        <button
          type="button"
          className={styles.collapseButton}
          onClick={handleToggleCollapse}
          aria-label={isCollapsed ? 'Expand children' : 'Collapse children'}
          title={isCollapsed ? 'Expand children' : 'Collapse children'}
        >
          {isCollapsed ? '▸' : '▾'}
        </button>
      ) : (
        <span className={styles.collapseSpacer} />
      )}
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
