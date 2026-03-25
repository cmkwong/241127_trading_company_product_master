import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Main_FileUploads.module.css';
import Main_DropZone from '../DropZone/Main_DropZone';

const Sub_SequenceEditorModal = ({
  isOpen,
  onClose,
  showDownloadButton = false,
  isDownloading = false,
  onDownload = () => {},
  dropZoneProps,
  children,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.sequenceEditorOverlay} onClick={onClose}>
      <div
        className={styles.sequenceEditorModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.sequenceEditorHeader}>
          <div className={styles.sequenceEditorTitle}>Edit Image Sequence</div>
          <div className={styles.headerActions}>
            {showDownloadButton && (
              <button
                type="button"
                className={styles.sequenceEditorIconBtn}
                onClick={onDownload}
                title={isDownloading ? 'Downloading...' : 'Download'}
                aria-label={isDownloading ? 'Downloading...' : 'Download'}
                disabled={isDownloading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5 20h14v-2H5v2zm7-18v9.17l3.59-3.58L17 9l-5 5-5-5 1.41-1.41L11 11.17V2h1z" />
                </svg>
              </button>
            )}
            <button
              type="button"
              className={styles.sequenceEditorCloseBtn}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className={styles.sequenceEditorHint}>
          Drag thumbnails to reorder. Hover to preview image.
        </div>

        <Main_DropZone {...dropZoneProps} expandedPreview>
          {children}
        </Main_DropZone>
      </div>
    </div>,
    document.body,
  );
};

Sub_SequenceEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  showDownloadButton: PropTypes.bool,
  isDownloading: PropTypes.bool,
  onDownload: PropTypes.func,
  dropZoneProps: PropTypes.shape({
    onFileSelect: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    setIsDragging: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    maxFiles: PropTypes.number.isRequired,
    maxSizeInMB: PropTypes.number.isRequired,
    acceptedTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    multiple: PropTypes.bool,
    items: PropTypes.array.isRequired,
    showPreview: PropTypes.bool,
    showMaxItemsNotice: PropTypes.bool,
    itemType: PropTypes.string,
    testIdPrefix: PropTypes.string,
    compact: PropTypes.bool,
    compactButtonText: PropTypes.string,
    tableCell: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node,
};

export default Sub_SequenceEditorModal;
