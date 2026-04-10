import { useState } from 'react';
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
  showSortButton = false,
  canSort = false,
  onSortByName = () => {},
  onSortBySize = () => {},
  showSelectAll = false,
  allSelected = true,
  selectedCount = 0,
  totalCount = 0,
  onToggleSelectAll = () => {},
  showToggleSelectButton = false,
  onToggleSelect = () => {},
  showWatermarkToggle = false,
  applyWatermarkOnDownload = true,
  onToggleApplyWatermark = () => {},
  dropZoneProps,
  children,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.sequenceEditorOverlay} onClick={onClose}>
      <div
        className={styles.sequenceEditorModal}
        data-sequence-editor-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.sequenceEditorHeader}>
          <div className={styles.sequenceEditorTitle}>Edit Image Sequence</div>
          <div className={styles.headerActions}>
            {showSelectAll && (
              <label className={styles.selectAllWrap}>
                <input
                  type="checkbox"
                  checked={Boolean(allSelected)}
                  onChange={onToggleSelectAll}
                />
                <span>{`All (${selectedCount}/${totalCount})`}</span>
              </label>
            )}
            {showToggleSelectButton && (
              <button
                type="button"
                className={styles.sequenceEditorIconBtn}
                onClick={onToggleSelect}
                title="Toggle selection"
                aria-label="Toggle selection"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 5h11v2H3V5zm0 6h11v2H3v-2zm0 6h7v2H3v-2zm15.59-4L21 15.41 16.41 20 12 15.59 14.41 13l2 2 5-5z" />
                </svg>
              </button>
            )}
            {showDownloadButton && (
              <>
                {showWatermarkToggle && (
                  <label className={styles.selectAllWrap}>
                    <input
                      type="checkbox"
                      checked={Boolean(applyWatermarkOnDownload)}
                      onChange={onToggleApplyWatermark}
                    />
                    <span>Watermark</span>
                  </label>
                )}
                <button
                  type="button"
                  className={styles.sequenceEditorIconBtn}
                  onClick={onDownload}
                  title={isDownloading ? 'Downloading...' : 'Download selected'}
                  aria-label={
                    isDownloading ? 'Downloading...' : 'Download selected'
                  }
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
              </>
            )}

            {showSortButton && (
              <div className={styles.sortActionWrap}>
                <button
                  type="button"
                  className={styles.sequenceEditorIconBtn}
                  title="Sort"
                  aria-label="Sort"
                  onClick={() => setShowSortMenu((prev) => !prev)}
                  disabled={!canSort}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M3 18h6v-2H3v2zm0-5h12v-2H3v2zm0-7v2h18V6H3zm14 10-3 3h2v3h2v-3h2l-3-3z" />
                  </svg>
                </button>

                {showSortMenu && canSort && (
                  <div className={styles.sortMenu}>
                    <button
                      type="button"
                      className={styles.sortMenuItem}
                      onClick={() => {
                        onSortByName();
                        setShowSortMenu(false);
                      }}
                    >
                      Sort by Name
                    </button>
                    <button
                      type="button"
                      className={styles.sortMenuItem}
                      onClick={() => {
                        onSortBySize();
                        setShowSortMenu(false);
                      }}
                    >
                      Sort by File Size
                    </button>
                  </div>
                )}
              </div>
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
  showSortButton: PropTypes.bool,
  canSort: PropTypes.bool,
  onSortByName: PropTypes.func,
  onSortBySize: PropTypes.func,
  showSelectAll: PropTypes.bool,
  allSelected: PropTypes.bool,
  selectedCount: PropTypes.number,
  totalCount: PropTypes.number,
  onToggleSelectAll: PropTypes.func,
  showToggleSelectButton: PropTypes.bool,
  onToggleSelect: PropTypes.func,
  showWatermarkToggle: PropTypes.bool,
  applyWatermarkOnDownload: PropTypes.bool,
  onToggleApplyWatermark: PropTypes.func,
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
