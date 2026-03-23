import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Main_FileUploads.module.css';
import Main_DropZone from '../DropZone/Main_DropZone';

const Sub_SequenceEditorModal = ({
  isOpen,
  onClose,
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
          <button
            type="button"
            className={styles.sequenceEditorCloseBtn}
            onClick={onClose}
          >
            Close
          </button>
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
