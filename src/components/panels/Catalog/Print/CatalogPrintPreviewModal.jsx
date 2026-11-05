import { useRef } from 'react';
import { printCatalogPreviewFrame } from '../../ProductMaster/utils/catalogPrint';
import styles from './CatalogPrintPreviewModal.module.css';

const CatalogPrintPreviewModal = ({
  html = '',
  isPreparing = false,
  printTitle = 'Product Catalog',
  onPrint,
  onClose,
}) => {
  const iframeRef = useRef(null);

  const handlePrintClick = async () => {
    if (typeof onPrint === 'function') {
      onPrint();
      return;
    }

    try {
      await printCatalogPreviewFrame(iframeRef.current, { title: printTitle });
    } catch (error) {
      console.error('Failed to print catalog:', error);
      window.alert(error?.message || 'Failed to print the catalog.');
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.window}>
        <div className={styles.header}>
          <div className={styles.title}>Catalog A4 Preview</div>
          <div className={styles.actions}>
            {isPreparing ? <span className={styles.status}>Preparing…</span> : null}
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handlePrintClick}
              disabled={isPreparing || !html}
            >
              Print / Save PDF
            </button>
            <button type="button" className={styles.btn} onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className={styles.frameWrap}>
          {html ? (
            <iframe
              ref={iframeRef}
              title="Catalog Preview"
              className={styles.frame}
              srcDoc={html}
            />
          ) : (
            <span className={styles.loading}>Preparing catalog preview…</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPrintPreviewModal;
