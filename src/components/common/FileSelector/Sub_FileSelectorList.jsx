import PropTypes from 'prop-types';
import styles from './Main_FileSelector.module.css';
import { formatFileDate, formatFileSize, getTypeLabel, getEntryDisplayName } from './fileSelectorUtils';
import {
  FolderIcon,
  FileIcon,
  ImageIcon,
  SortArrowIcon,
} from './FileSelectorIcons';

const ColumnHeader = ({ label, width, sortable, active }) => (
  <span
    className={styles.listHeaderCell}
    style={width ? { width } : undefined}
    data-sortable={sortable ? 'true' : undefined}
  >
    {label}
    {sortable && <SortArrowIcon size={10} className={styles.listSortIcon} />}
    {active && sortable && <span className={styles.listSortActive} />}
  </span>
);

ColumnHeader.propTypes = {
  label: PropTypes.string,
  width: PropTypes.number,
  sortable: PropTypes.bool,
  active: PropTypes.bool,
};

const EntryIcon = ({ entry }) => {
  if (entry.type === 'folder') return <FolderIcon size={16} className={styles.entryIcon} />;
  if (entry.isImage) return <ImageIcon size={16} className={styles.entryIcon} />;
  return <FileIcon size={16} className={styles.entryIcon} />;
};

EntryIcon.propTypes = { entry: PropTypes.object };

/**
 * List (table) view of a directory: sortable "Name" column with fixed columns
 * for Date modified / Type / Size. Presentational only.
 */
const Sub_FileSelectorList = ({
  entries,
  selectedPath,
  mode,
  onOpenFolder,
  onSelect,
}) => (
  <div className={styles.listContainer} role="list">
    <div className={styles.listHeader} role="row">
      <ColumnHeader label="Name" width={320} sortable active />
      <ColumnHeader label="Date modified" width={240} />
      <ColumnHeader label="Type" width={180} />
      <ColumnHeader label="Size" width={120} />
    </div>

    <div className={styles.listBody}>
      {entries.map((entry) => {
        const isFolder = entry.type === 'folder';
        const isSelected = entry.path === selectedPath;
        const selectable = mode === 'file' || entry.isImage;
        return (
          <div
            key={entry.path}
            role="row"
            className={`${styles.listRow} ${isSelected ? styles.listRowSelected : ''} ${isFolder || selectable ? '' : styles.listRowDisabled}`}
            onClick={() => (isFolder ? onOpenFolder(entry) : selectable && onSelect(entry))}
            onDoubleClick={() => isFolder && onOpenFolder(entry)}
            title={getEntryDisplayName(entry)}
          >
            <span className={styles.listNameCell} style={{ width: 320 }}>
              <EntryIcon entry={entry} />
              <span className={styles.listName}>{getEntryDisplayName(entry)}</span>
            </span>
            <span className={styles.listCell} style={{ width: 240 }}>
              {formatFileDate(entry.modifiedAt)}
            </span>
            <span className={styles.listCell} style={{ width: 180 }}>
              {entry.typeLabel || getTypeLabel(entry)}
            </span>
            <span className={styles.listCell} style={{ width: 120 }}>
              {entry.type === 'file' ? formatFileSize(entry.size) : ''}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

Sub_FileSelectorList.propTypes = {
  entries: PropTypes.array.isRequired,
  selectedPath: PropTypes.string,
  mode: PropTypes.oneOf(['image', 'file']),
  onOpenFolder: PropTypes.func,
  onSelect: PropTypes.func,
};

export default Sub_FileSelectorList;
