import { useEffect, useRef, useState } from 'react';
import styles from './Sub_ExpandedWindow.module.css';

const Sub_ExpandedWindow = ({
  title = 'Expanded Search Table',
  onClose,
  onReset,
  onExportExcel,
  onExportCatalog,
  isExportingExcel = false,
  isSelectAllActive = false,
  onToggleSelectAll,
  searchBar,
  tableWrapRef,
  children,
  previewImage,
  onClosePreviewImage,
  hoverPreview,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    if (!isExportMenuOpen) {
      return undefined;
    }

    const handleDocumentClick = (event) => {
      if (!exportMenuRef.current?.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isExportMenuOpen]);

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={styles.modalWindow}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{title}</div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={onClose}
            aria-label="Close expanded table"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.overlaySearchBar}>
          <div className={styles.overlaySearchBarContent}>{searchBar}</div>
          <div className={styles.overlayActions}>
            {typeof onToggleSelectAll === 'function' ? (
              <button
                type="button"
                className={`${styles.overlayActionButton} ${
                  isSelectAllActive ? styles.overlayActionButtonActive : ''
                }`.trim()}
                onClick={onToggleSelectAll}
                title="Toggle select all rows"
                aria-label="Toggle select all rows"
              >
                Select All
              </button>
            ) : null}

            {(typeof onExportExcel === 'function' ||
              typeof onExportCatalog === 'function') && (
              <div className={styles.exportMenuWrap} ref={exportMenuRef}>
                <button
                  type="button"
                  className={styles.overlayActionButton}
                  onClick={() => setIsExportMenuOpen((prev) => !prev)}
                  title="Export"
                  aria-label="Export"
                  aria-expanded={isExportMenuOpen}
                  aria-haspopup="menu"
                >
                  Export
                </button>

                {isExportMenuOpen && (
                  <div
                    className={styles.exportMenu}
                    role="menu"
                    aria-label="Export options"
                  >
                    <button
                      type="button"
                      className={styles.exportMenuItem}
                      onClick={() => {
                        onExportExcel?.();
                        setIsExportMenuOpen(false);
                      }}
                      disabled={
                        isExportingExcel || typeof onExportExcel !== 'function'
                      }
                      role="menuitem"
                    >
                      {isExportingExcel ? 'Excel (Exporting...)' : 'Excel'}
                    </button>
                    <button
                      type="button"
                      className={styles.exportMenuItem}
                      onClick={() => {
                        onExportCatalog?.();
                        setIsExportMenuOpen(false);
                      }}
                      disabled={typeof onExportCatalog !== 'function'}
                      role="menuitem"
                    >
                      Catalog
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className={styles.overlayActionButton}
              onClick={onReset}
              title="Reset all search fields"
              aria-label="Reset all search fields"
            >
              Reset All
            </button>
          </div>
        </div>

        <div ref={tableWrapRef} className={styles.overlayTableWrap}>
          {children}
        </div>
      </div>

      {previewImage?.src && (
        <div
          className={styles.imagePreviewOverlay}
          onClick={onClosePreviewImage}
        >
          <div
            className={styles.imagePreviewModal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.imagePreviewClose}
              onClick={onClosePreviewImage}
              aria-label="Close image preview"
            >
              ✕
            </button>
            <img
              src={previewImage.src}
              alt={previewImage.alt || 'preview-image'}
              className={styles.imagePreviewLarge}
            />
          </div>
        </div>
      )}

      {hoverPreview?.src && (
        <div
          className={styles.hoverImagePreview}
          style={{ left: hoverPreview.x, top: hoverPreview.y }}
        >
          <img
            src={hoverPreview.src}
            alt={hoverPreview.alt || 'hover-preview'}
            className={styles.hoverImagePreviewLarge}
          />
        </div>
      )}
    </div>
  );
};

export default Sub_ExpandedWindow;
