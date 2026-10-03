import PropTypes from 'prop-types';
import styles from './Main_FileSelector.module.css';
import { buildPublicFileUrl } from '../../../utils/filePickerUtils';
import {
  formatFileSize,
  getTypeLabel,
  getEntryDisplayName,
} from './fileSelectorUtils';
import { CollapseIcon } from './FileSelectorIcons';

/**
 * Full-window close-up of a single image entry, overlaid inside the File Banks
 * picker. Reuses the same static URL as the grid tile (`buildPublicFileUrl`),
 * so opening it fetches nothing extra and copies no bytes. Collapse via the
 * pill, clicking the backdrop, or Escape (handled by the parent).
 */
const Sub_FileSelectorImagePreview = ({ entry, onCollapse = () => {} }) => {
  const name = getEntryDisplayName(entry);
  const metaParts = [getTypeLabel(entry), formatFileSize(entry?.size)]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={styles.previewOverlay}
      onClick={onCollapse}
      role="dialog"
      aria-label="Image close-up"
    >
      <div
        className={styles.previewHeader}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.previewHeaderLeft}>
          <span className={styles.previewTitle}>{name}</span>
          {metaParts && <span className={styles.previewMeta}>{metaParts}</span>}
        </div>
        <button
          type="button"
          className={styles.previewCollapseBtn}
          onClick={onCollapse}
          title="Collapse close-up"
          aria-label="Collapse close-up"
        >
          <CollapseIcon size={14} />
          <span>Collapse</span>
        </button>
      </div>

      <div className={styles.previewStage}>
        <img
          src={buildPublicFileUrl(entry?.path)}
          alt={name}
          className={styles.previewImage}
        />
      </div>
    </div>
  );
};

Sub_FileSelectorImagePreview.propTypes = {
  entry: PropTypes.shape({
    path: PropTypes.string,
    name: PropTypes.string,
    displayName: PropTypes.string,
    extension: PropTypes.string,
    type: PropTypes.string,
    size: PropTypes.number,
  }),
  onCollapse: PropTypes.func,
};

export default Sub_FileSelectorImagePreview;
