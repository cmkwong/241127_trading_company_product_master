import PropTypes from 'prop-types';
import styles from './Main_FileSelector.module.css';
import { buildPublicFileUrl } from '../../../utils/filePickerUtils';
import { getEntryDisplayName } from './fileSelectorUtils';
import {
  FolderIcon,
  FileIcon,
  ImageIcon,
  ExpandIcon,
} from './FileSelectorIcons';

const GridTileIcon = ({ entry }) => {
  if (entry.type === 'folder')
    return <FolderIcon size={40} className={styles.gridFolderIcon} />;
  if (entry.isImage)
    return <ImageIcon size={40} className={styles.gridFolderIcon} />;
  return <FileIcon size={40} className={styles.gridFolderIcon} />;
};

GridTileIcon.propTypes = { entry: PropTypes.object };

/**
 * Thumbnail grid view: 110x90 image tiles (or icon placeholders for non-image
 * files/folders) with a centred filename and a selection ring + check overlay.
 */
const Sub_FileSelectorGrid = ({
  entries,
  selectedPath,
  mode,
  onOpenFolder,
  onSelect,
  onExpandImage,
}) => (
  <div className={styles.gridPanel}>
    <div className={styles.grid}>
      {entries.map((entry) => {
        const isFolder = entry.type === 'folder';
        const isSelected = entry.path === selectedPath;
        const selectable = mode === 'file' || entry.isImage;
        return (
          <button
            key={entry.path}
            type="button"
            className={`${styles.gridTile} ${isSelected ? styles.gridTileSelected : ''} ${isFolder || selectable ? '' : styles.gridTileDisabled}`}
            onClick={() =>
              isFolder ? onOpenFolder(entry) : selectable && onSelect(entry)
            }
            onDoubleClick={() => isFolder && onOpenFolder(entry)}
            title={getEntryDisplayName(entry)}
            aria-label={getEntryDisplayName(entry)}
          >
            <span className={styles.gridTileImage}>
              {entry.isImage ? (
                <img
                  src={buildPublicFileUrl(entry.path)}
                  alt={getEntryDisplayName(entry)}
                  loading="lazy"
                  className={styles.gridTileImg}
                />
              ) : (
                <GridTileIcon entry={entry} />
              )}
              {isSelected && <span className={styles.gridCheck}>✓</span>}
              {entry.isImage && typeof onExpandImage === 'function' && (
                <span
                  className={styles.gridExtendBtn}
                  role="button"
                  tabIndex={0}
                  title="Extend image"
                  aria-label="Extend image"
                  onClick={(event) => {
                    event.stopPropagation();
                    onExpandImage(entry);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      onExpandImage(entry);
                    }
                  }}
                >
                  <ExpandIcon size={13} />
                </span>
              )}
            </span>
            <span className={styles.gridTileName}>
              {getEntryDisplayName(entry)}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

Sub_FileSelectorGrid.propTypes = {
  entries: PropTypes.array.isRequired,
  selectedPath: PropTypes.string,
  mode: PropTypes.oneOf(['image', 'file']),
  onOpenFolder: PropTypes.func,
  onSelect: PropTypes.func,
  onExpandImage: PropTypes.func,
};

export default Sub_FileSelectorGrid;
