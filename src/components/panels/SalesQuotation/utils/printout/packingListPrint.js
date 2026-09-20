import { buildPackingListDocumentHtml } from './packingListPreview';

/**
 * Packing List (Picking List) uses the dedicated renderer built from the
 * Rivolx picking-list printout design.
 */
export const buildPackingListDocumentA4Html = (options = {}) =>
  buildPackingListDocumentHtml(options);

export const printPackingListDocumentA4 = (options) => {
  const html = buildPackingListDocumentA4Html(options);

  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups and try again.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  let hasTriggeredPrint = false;
  const triggerPrint = () => {
    if (hasTriggeredPrint) {
      return;
    }
    hasTriggeredPrint = true;

    printWindow.focus();
    printWindow.print();
  };

  printWindow.addEventListener('load', triggerPrint, { once: true });
  setTimeout(triggerPrint, 700);
};
