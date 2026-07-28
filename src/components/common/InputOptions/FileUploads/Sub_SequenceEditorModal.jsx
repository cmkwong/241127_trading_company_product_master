import { useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Main_FileUploads.module.css';
import Main_DropZone from '../DropZone/Main_DropZone';

const FIGMA_SORT_ICON = '/assets/figma/modal-sort.svg';
const FIGMA_DESELECT_ICON = '/assets/figma/table-deselect.svg';
const FIGMA_DOWNLOAD_ICON = '/assets/figma/table-download.svg';
const FIGMA_EDIT_ICON = '/assets/figma/table-edit.svg';
const FIGMA_WATERMARK_ICON_INACTIVE =
  '/assets/figma/table-watermark-inactive.svg';
const FIGMA_WATERMARK_ICON_ACTIVE = '/assets/figma/table-watermark-active.svg';

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
  selectionLabel = 'images',
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
          <div className={styles.sequenceEditorHeaderText}>
            <div className={styles.sequenceEditorTitle}>
              Edit Image Sequence
            </div>
            <div className={styles.sequenceEditorHint}>
              Drag to reorder, click to select {selectionLabel}
            </div>
          </div>

          <div className={styles.sequenceEditorToolbarArea}>
            <div className={styles.sequenceEditorToolbar}>
              {showSortButton && (
                <div className={styles.sortActionWrap}>
                  <button
                    type="button"
                    className={`${styles.sequenceEditorIconBtn} ${styles.sequenceEditorToolbarIconBtn}`}
                    title="Sort"
                    aria-label="Sort"
                    onClick={() => setShowSortMenu((prev) => !prev)}
                    disabled={!canSort}
                  >
                    <img
                      src={FIGMA_SORT_ICON}
                      alt=""
                      className={styles.tableCellIcon14}
                      aria-hidden="true"
                    />
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

              {showSelectAll && (
                <label
                  className={`${styles.selectAllWrap} ${styles.figmaSelectAllWrap}`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(allSelected)}
                    onChange={onToggleSelectAll}
                  />
                </label>
              )}
              {showToggleSelectButton && (
                <button
                  type="button"
                  className={`${styles.sequenceEditorIconBtn} ${styles.sequenceEditorToolbarIconBtn}`}
                  onClick={onToggleSelect}
                  title="Toggle selection"
                  aria-label="Toggle selection"
                >
                  <img
                    src={FIGMA_DESELECT_ICON}
                    alt=""
                    className={styles.tableCellIcon16}
                    aria-hidden="true"
                  />
                </button>
              )}
              {showDownloadButton && (
                <>
                  {showWatermarkToggle && (
                    <button
                      type="button"
                      className={`${styles.sequenceEditorIconBtn} ${styles.sequenceEditorToolbarIconBtn} ${styles.watermarkToggleButton} ${
                        applyWatermarkOnDownload
                          ? styles.watermarkToggleActive
                          : styles.watermarkToggleInactive
                      }`}
                      onClick={onToggleApplyWatermark}
                      title={
                        applyWatermarkOnDownload
                          ? 'Disable watermark'
                          : 'Enable watermark'
                      }
                      aria-label={
                        applyWatermarkOnDownload
                          ? 'Disable watermark'
                          : 'Enable watermark'
                      }
                      aria-pressed={Boolean(applyWatermarkOnDownload)}
                    >
                      <img
                        src={
                          applyWatermarkOnDownload
                            ? FIGMA_WATERMARK_ICON_ACTIVE
                            : FIGMA_WATERMARK_ICON_INACTIVE
                        }
                        alt=""
                        className={styles.tableCellIcon16}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.sequenceEditorIconBtn} ${styles.sequenceEditorToolbarIconBtn}`}
                    onClick={onDownload}
                    title={
                      isDownloading ? 'Downloading...' : 'Download selected'
                    }
                    aria-label={
                      isDownloading ? 'Downloading...' : 'Download selected'
                    }
                    disabled={isDownloading}
                  >
                    <img
                      src={FIGMA_DOWNLOAD_ICON}
                      alt=""
                      className={styles.tableCellIcon16}
                      aria-hidden="true"
                    />
                  </button>
                </>
              )}

              <span
                className={`${styles.sequenceEditorIconBtn} ${styles.sequenceEditorToolbarIconBtn} ${styles.sequenceEditorToolbarStaticIcon}`}
                aria-hidden="true"
              >
                <img
                  src={FIGMA_EDIT_ICON}
                  alt=""
                  className={styles.tableCellIcon14}
                  aria-hidden="true"
                />
              </span>
            </div>

            <span
              className={styles.figmaImageCounter}
            >{`${selectedCount} / ${totalCount}`}</span>
          </div>
        </div>

        <div className={styles.sequenceEditorBody}>
          <Main_DropZone {...dropZoneProps} expandedPreview>
            {children}
          </Main_DropZone>
        </div>

        <div className={styles.sequenceEditorFooter}>
          <div className={styles.sequenceEditorFooterLeft}>
            <span
              className={styles.sequenceEditorFooterTotal}
            >{`${totalCount} ${selectionLabel}`}</span>
            <span className={styles.sequenceEditorFooterDot} />
            <span
              className={styles.sequenceEditorFooterSelected}
            >{`${selectedCount} selected`}</span>
          </div>

          <button
            type="button"
            className={styles.sequenceEditorCloseBtn}
            onClick={onClose}
          >
            Close
          </button>
        </div>
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
  selectionLabel: PropTypes.string,
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
    figmaImageStrip: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node,
};

export default Sub_SequenceEditorModal;
