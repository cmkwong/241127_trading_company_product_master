import { buildArDownpaymentDocumentHtml } from './arDownpaymentInvoicePreview';

/**
 * AR Downpayment Invoice uses the shared renderer with the
 * `ar-downpayment-invoice` variant (Proforma title, labels, and deposit box).
 */
export const buildArDownpaymentInvoiceDocumentA4Html = (options = {}) =>
  buildArDownpaymentDocumentHtml(options);

export const printArDownpaymentInvoiceDocumentA4 = (options) => {
  const html = buildArDownpaymentInvoiceDocumentA4Html(options);

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
