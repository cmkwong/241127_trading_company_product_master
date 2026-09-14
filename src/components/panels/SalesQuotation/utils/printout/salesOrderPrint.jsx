import { buildSalesOrderDocumentHtml } from './salesOrderPreview';

/**
 * Sales Order uses the shared document renderer and only swaps to the
 * `sales-order` variant (labels, title, terms, and filename prefix).
 */
export const buildSalesOrderDocumentA4Html = (options = {}) =>
  buildSalesOrderDocumentHtml(options);

export const printSalesOrderDocumentA4 = (options) => {
  const html = buildSalesOrderDocumentA4Html(options);

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
