import { useRef } from 'react';
import { printCatalogPreviewFrame } from '../../ProductMaster/utils/catalogPrint';
import Main_Modal from '../../../../components/common/Modal/Main_Modal';
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

  return (
    <Main_Modal
      title="Catalog A4 Preview"
      onClose={onClose}
      size="xl"
      height="min(92vh, 960px)"
      zIndex={2400}
      bodyScrollable={false}
      footer={
        <>
          {isPreparing ? <span className={styles.status}>Preparing…</span> : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handlePrintClick}
              disabled={isPreparing || !html}
            >
              Print / Save PDF
            </button>
          </div>
        </>
      }
    >
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
    </Main_Modal>
  );
};

export default CatalogPrintPreviewModal;
