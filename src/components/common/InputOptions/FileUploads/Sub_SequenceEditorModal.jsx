import { useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Main_FileUploads.module.css';
import Main_DropZone from '../DropZone/Main_DropZone';
import Label from '../../Texts/Label';

const FIGMA_SORT_ICON = '/assets/figma/modal-sort.svg';
const FIGMA_DESELECT_ICON = '/assets/figma/table-deselect.svg';
const FIGMA_DOWNLOAD_ICON = '/assets/figma/table-download.svg';
const FIGMA_EDIT_ICON = '/assets/figma/table-edit.svg';
const FIGMA_WATERMARK_ICON_INACTIVE =
  '/assets/figma/table-watermark-inactive.svg';
const FIGMA_WATERMARK_ICON_ACTIVE = '/assets/figma/table-watermark-active.svg';
const FIGMA_AI_ICON = '/assets/figma/table-ai.svg';

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
  showRemoveSelectedButton = false,
  onRemoveSelected = () => {},
  disableRemoveSelected = false,
  showWatermarkToggle = false,
  applyWatermarkOnDownload = true,
  onToggleApplyWatermark = () => {},
  resizePercentage = 50,
  onResizePercentageChange = () => {},
  onResizeByPercentage = () => {},
  isResizing = false,
  showAiGenerateButton = false,
  isAiGenerating = false,
  onAiGenerate = () => {},
  selectionLabel = 'images',
  showSequencePreviewPanel = false,
  previewItems = [],
  onReorderPreview = () => {},
  dropZoneProps,
  children,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [previewDragIndex, setPreviewDragIndex] = useState(null);
  const [previewDropTarget, setPreviewDropTarget] = useState({
    index: null,
    position: null,
  });

  const resizePresets = [
    { label: '25% smaller', value: 75 },
    { label: '50% smaller', value: 50 },
    { label: '75% smaller', value: 25 },
  ];

  const canReorderPreview =
    showSequencePreviewPanel &&
    previewItems.length > 1 &&
    !dropZoneProps?.disabled &&
    typeof onReorderPreview === 'function';

  const handlePreviewDragStart = (event, index) => {
    if (!canReorderPreview) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    setPreviewDragIndex(index);
  };

  const handlePreviewDragOver = (event, index) => {
    if (!canReorderPreview) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const rect = event.currentTarget.getBoundingClientRect();
    const position =
      event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

    if (
      previewDropTarget.index !== index ||
      previewDropTarget.position !== position
    ) {
      setPreviewDropTarget({ index, position });
    }
  };

  const handlePreviewDragLeave = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setPreviewDropTarget({ index: null, position: null });
  };

  const handlePreviewDrop = (event, index) => {
    if (!canReorderPreview) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const dragIndex = Number.parseInt(
      event.dataTransfer.getData('text/plain'),
      10,
    );
    if (Number.isNaN(dragIndex)) {
      setPreviewDropTarget({ index: null, position: null });
      setPreviewDragIndex(null);
      return;
    }

    const position =
      previewDropTarget.index === index
        ? previewDropTarget.position
        : event.clientY <
            event.currentTarget.getBoundingClientRect().top +
              event.currentTarget.getBoundingClientRect().height / 2
          ? 'before'
          : 'after';

    if (
      (dragIndex === index && position === 'before') ||
      (dragIndex === index && position === 'after')
    ) {
      setPreviewDropTarget({ index: null, position: null });
      setPreviewDragIndex(null);
      return;
    }

    const insertIndex = position === 'after' ? index + 1 : index;
    onReorderPreview(dragIndex, insertIndex);

    setPreviewDropTarget({ index: null, position: null });
    setPreviewDragIndex(null);
  };

  const handlePreviewDragEnd = () => {
    setPreviewDropTarget({ index: null, position: null });
    setPreviewDragIndex(null);
  };

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
                <Label
                  className={`${styles.selectAllWrap} ${styles.figmaSelectAllWrap}`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(allSelected)}
                    onChange={onToggleSelectAll}
                  />
                </Label>
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
              {showRemoveSelectedButton && (
                <button
                  type="button"
                  className={`${styles.sequenceEditorIconBtn} ${styles.sequenceEditorToolbarIconBtn}`}
                  onClick={onRemoveSelected}
                  title="Remove selected"
                  aria-label="Remove selected"
                  disabled={disableRemoveSelected}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.tableCellIcon16}
                    aria-hidden="true"
                  >
                    <path d="M9 3h6l1 2h5v2h-2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H3V5h5l1-2zm8 4H7v13h10V7zm-7 3h2v8h-2v-8zm4 0h2v8h-2v-8z" />
                  </svg>
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

              {showAiGenerateButton && (
                <button
                  type="button"
                  className={`${styles.sequenceEditorIconBtn} ${styles.sequenceEditorToolbarIconBtn}`}
                  onClick={onAiGenerate}
                  title={isAiGenerating ? 'AI editing…' : 'AI edit images'}
                  aria-label={isAiGenerating ? 'AI editing…' : 'AI edit images'}
                  disabled={isAiGenerating}
                >
                  <img
                    src={FIGMA_AI_ICON}
                    alt=""
                    className={styles.tableCellIcon16}
                    aria-hidden="true"
                  />
                </button>
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

      {showSequencePreviewPanel && (
        <aside
          className={styles.sequencePreviewFloatingWindow}
          data-sequence-preview-window="true"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.sequenceSideRail}>
            <section className={styles.toolsPanel}>
              <div className={styles.toolsPanelHeader}>Tools</div>

              <div className={styles.toolsSection}>
                <div className={styles.toolsSectionTitle}>Image Resize</div>
                <div className={styles.resizeOptionHint}>By percentage</div>

                <div className={styles.resizePresets}>
                  {resizePresets.map((preset) => {
                    const isActive = Number(resizePercentage) === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        className={`${styles.resizePresetBtn} ${
                          isActive ? styles.resizePresetBtnActive : ''
                        }`}
                        onClick={() => onResizePercentageChange(preset.value)}
                      >
                        <span>{preset.label}</span>
                        {isActive && (
                          <span className={styles.resizeCheck}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <label
                  className={styles.resizeCustomLabel}
                  htmlFor="resize-percentage-input"
                >
                  Custom percentage
                </label>
                <div className={styles.resizeCustomInputWrap}>
                  <input
                    id="resize-percentage-input"
                    type="number"
                    min="1"
                    max="100"
                    value={resizePercentage}
                    onChange={(event) =>
                      onResizePercentageChange(event.target.value)
                    }
                    className={styles.resizeCustomInput}
                  />
                  <span className={styles.resizePercentUnit}>%</span>
                </div>

                <button
                  type="button"
                  className={styles.resizeApplyBtn}
                  onClick={onResizeByPercentage}
                  disabled={isResizing || totalCount === 0}
                >
                  {isResizing ? 'Resizing...' : 'Resize IMAGES'}
                </button>
              </div>
            </section>

            <div
              className={`${styles.sequencePreviewPanel} ${
                isPreviewExpanded ? styles.sequencePreviewPanelExpanded : ''
              }`}
            >
              <div className={styles.sequencePreviewHeader}>
                <span className={styles.sequencePreviewTitle}>
                  Description Preview
                </span>
                <div className={styles.sequencePreviewHeaderRight}>
                  <span
                    className={styles.sequencePreviewCounter}
                  >{`${previewItems.length} items`}</span>
                  <button
                    type="button"
                    className={styles.previewExpandBtn}
                    onClick={() => setIsPreviewExpanded((prev) => !prev)}
                    title={
                      isPreviewExpanded
                        ? 'Restore preview window size'
                        : 'Extend preview window'
                    }
                    aria-label={
                      isPreviewExpanded
                        ? 'Restore preview window size'
                        : 'Extend preview window'
                    }
                  >
                    {isPreviewExpanded ? 'Collapse' : 'Extend'}
                  </button>
                </div>
              </div>

              <div className={styles.sequencePreviewList}>
                {previewItems.length === 0 && (
                  <div className={styles.sequencePreviewEmpty}>
                    No images to preview.
                  </div>
                )}

                {previewItems.map((item, itemIndex) => (
                  <article
                    key={item?.id || `${item?.name || 'preview'}-${itemIndex}`}
                    className={`${styles.sequencePreviewCard} ${
                      canReorderPreview
                        ? styles.sequencePreviewCardDraggable
                        : ''
                    } ${
                      previewDragIndex === itemIndex
                        ? styles.sequencePreviewCardDragging
                        : ''
                    } ${
                      previewDropTarget.index === itemIndex &&
                      previewDropTarget.position === 'before'
                        ? styles.sequencePreviewCardDropBefore
                        : ''
                    } ${
                      previewDropTarget.index === itemIndex &&
                      previewDropTarget.position === 'after'
                        ? styles.sequencePreviewCardDropAfter
                        : ''
                    }`}
                    draggable={canReorderPreview}
                    onDragStart={(event) =>
                      handlePreviewDragStart(event, itemIndex)
                    }
                    onDragOver={(event) =>
                      handlePreviewDragOver(event, itemIndex)
                    }
                    onDragLeave={handlePreviewDragLeave}
                    onDrop={(event) => handlePreviewDrop(event, itemIndex)}
                    onDragEnd={handlePreviewDragEnd}
                    title={
                      canReorderPreview
                        ? 'Drag to reorder this preview image'
                        : undefined
                    }
                  >
                    <div className={styles.sequencePreviewImageWrap}>
                      {item?.url ? (
                        <img
                          src={item.url}
                          alt={item?.name || `Preview ${itemIndex + 1}`}
                          className={styles.sequencePreviewImage}
                        />
                      ) : (
                        <div className={styles.sequencePreviewImagePlaceholder}>
                          No Preview
                        </div>
                      )}
                      <div className={styles.sequencePreviewOrderBadge}>
                        {itemIndex + 1}
                      </div>
                    </div>
                    <div className={styles.sequencePreviewMetaBar}>
                      {item?.resizeDimensionPreview ? (
                        <span className={styles.sequencePreviewDimensionText}>
                          {item.resizeDimensionPreview}
                        </span>
                      ) : item?.resizeToWidth > 0 &&
                        item?.resizeToHeight > 0 ? (
                        <span className={styles.sequencePreviewDimensionText}>
                          {`${item.resizeToWidth}x${item.resizeToHeight}`}
                        </span>
                      ) : (
                        <span
                          className={styles.sequencePreviewDimensionTextMuted}
                        >
                          Dimensions pending
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}
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
  showRemoveSelectedButton: PropTypes.bool,
  onRemoveSelected: PropTypes.func,
  disableRemoveSelected: PropTypes.bool,
  showWatermarkToggle: PropTypes.bool,
  applyWatermarkOnDownload: PropTypes.bool,
  onToggleApplyWatermark: PropTypes.func,
  resizePercentage: PropTypes.number,
  onResizePercentageChange: PropTypes.func,
  onResizeByPercentage: PropTypes.func,
  isResizing: PropTypes.bool,
  showAiGenerateButton: PropTypes.bool,
  isAiGenerating: PropTypes.bool,
  onAiGenerate: PropTypes.func,
  selectionLabel: PropTypes.string,
  showSequencePreviewPanel: PropTypes.bool,
  previewItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      size: PropTypes.number,
      type: PropTypes.string,
      url: PropTypes.string,
      resizeDimensionPreview: PropTypes.string,
      resizeFromWidth: PropTypes.number,
      resizeFromHeight: PropTypes.number,
      resizeToWidth: PropTypes.number,
      resizeToHeight: PropTypes.number,
    }),
  ),
  onReorderPreview: PropTypes.func,
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
