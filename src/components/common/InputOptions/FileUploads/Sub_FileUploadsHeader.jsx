import PropTypes from 'prop-types';
import styles from './Main_FileUploads.module.css';

const FIGMA_DESELECT_ICON = '/assets/figma/table-deselect.svg';
const FIGMA_DOWNLOAD_ICON = '/assets/figma/table-download.svg';
const FIGMA_EDIT_ICON = '/assets/figma/table-edit.svg';
const FIGMA_WATERMARK_ICON_INACTIVE =
  '/assets/figma/table-watermark-inactive.svg';
const FIGMA_WATERMARK_ICON_ACTIVE = '/assets/figma/table-watermark-active.svg';

const Sub_FileUploadsHeader = ({
  label,
  tableCell,
  isImageMode,
  figmaStrip,
  selectionLabel,
  maxFiles,
  canOpenSequenceEditor,
  onOpenSequenceEditor,
  showDownloadButton,
  isDownloading,
  onDownload,
  showSelectAll,
  allSelected,
  selectedCount,
  totalCount,
  onToggleSelectAll,
  showToggleSelectButton,
  onToggleSelect,
  showWatermarkToggle,
  applyWatermarkOnDownload,
  onToggleApplyWatermark,
}) => {
  const useFigmaImageHeader = Boolean(
    (isImageMode && !tableCell) || figmaStrip,
  );

  return (
    <div
      className={`${styles.headerRow} ${tableCell ? styles.tableCellHeaderRow : ''} ${useFigmaImageHeader ? styles.figmaImageHeaderRow : ''}`}
    >
      {label && <label className={styles.label}>{label}</label>}
      <div
        className={`${styles.headerActions} ${useFigmaImageHeader ? styles.figmaImageHeaderActions : ''}`}
      >
        <div className={useFigmaImageHeader ? styles.figmaImageToolbar : ''}>
          {showSelectAll && (
            <label
              className={`${styles.selectAllWrap} ${tableCell ? styles.tableCellTool : ''} ${useFigmaImageHeader ? styles.figmaSelectAllWrap : ''}`}
              title={`Select all ${selectionLabel}`}
            >
              <input
                type="checkbox"
                checked={Boolean(allSelected)}
                onChange={onToggleSelectAll}
              />
              {!tableCell && !useFigmaImageHeader && (
                <span>{`All (${selectedCount}/${totalCount})`}</span>
              )}
            </label>
          )}
          {showToggleSelectButton && (
            <button
              type="button"
              className={`${styles.sequenceEditorIconBtn} ${tableCell ? styles.tableCellTool : ''} ${useFigmaImageHeader ? styles.figmaHeaderTool : ''}`}
              onClick={onToggleSelect}
              title="Toggle selection"
              aria-label="Toggle selection"
            >
              {tableCell || useFigmaImageHeader ? (
                <img
                  src={FIGMA_DESELECT_ICON}
                  alt=""
                  className={styles.tableCellIcon16}
                  aria-hidden="true"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 5h11v2H3V5zm0 6h11v2H3v-2zm0 6h7v2H3v-2zm15.59-4L21 15.41 16.41 20 12 15.59 14.41 13l2 2 5-5z" />
                </svg>
              )}
            </button>
          )}
          {showDownloadButton && (
            <>
              <button
                type="button"
                className={`${styles.sequenceEditorIconBtn} ${tableCell ? styles.tableCellTool : ''} ${useFigmaImageHeader ? styles.figmaHeaderTool : ''}`}
                onClick={onDownload}
                title={isDownloading ? 'Downloading...' : 'Download selected'}
                aria-label={
                  isDownloading ? 'Downloading...' : 'Download selected'
                }
                disabled={isDownloading}
              >
                {tableCell || useFigmaImageHeader ? (
                  <img
                    src={FIGMA_DOWNLOAD_ICON}
                    alt=""
                    className={styles.tableCellIcon16}
                    aria-hidden="true"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5 20h14v-2H5v2zm7-18v9.17l3.59-3.58L17 9l-5 5-5-5 1.41-1.41L11 11.17V2h1z" />
                  </svg>
                )}
              </button>
            </>
          )}

          {canOpenSequenceEditor && (
            <button
              type="button"
              className={`${styles.sequenceEditorIconBtn} ${tableCell ? styles.tableCellTool : ''} ${useFigmaImageHeader ? styles.figmaHeaderTool : ''}`}
              onClick={onOpenSequenceEditor}
              title="Open sequence editor"
              aria-label="Open sequence editor"
            >
              {tableCell || useFigmaImageHeader ? (
                <img
                  src={FIGMA_EDIT_ICON}
                  alt=""
                  className={styles.tableCellIcon14}
                  aria-hidden="true"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 000-1.42L18.37 3.29a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
                </svg>
              )}
            </button>
          )}
          {showWatermarkToggle && (
            <button
              type="button"
              className={`${
                tableCell || useFigmaImageHeader
                  ? `${styles.sequenceEditorIconBtn} ${styles.tableCellTool} ${styles.watermarkToggleButton} ${
                      applyWatermarkOnDownload
                        ? styles.watermarkToggleActive
                        : styles.watermarkToggleInactive
                    } ${useFigmaImageHeader ? styles.figmaHeaderTool : ''}`
                  : styles.watermarkTextToggle
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
              {tableCell || useFigmaImageHeader ? (
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
              ) : (
                <>
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
                  <span>Watermark</span>
                </>
              )}
            </button>
          )}
        </div>
        {(tableCell || useFigmaImageHeader) && (
          <span
            className={`${styles.tableCellImageCounter} ${useFigmaImageHeader ? styles.figmaImageCounter : ''}`}
          >{`${totalCount} / ${maxFiles}`}</span>
        )}
      </div>
    </div>
  );
};

Sub_FileUploadsHeader.propTypes = {
  label: PropTypes.string,
  tableCell: PropTypes.bool,
  isImageMode: PropTypes.bool,
  figmaStrip: PropTypes.bool,
  selectionLabel: PropTypes.string,
  maxFiles: PropTypes.number,
  canOpenSequenceEditor: PropTypes.bool.isRequired,
  onOpenSequenceEditor: PropTypes.func.isRequired,
  showDownloadButton: PropTypes.bool,
  isDownloading: PropTypes.bool,
  onDownload: PropTypes.func,
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
};

export default Sub_FileUploadsHeader;
