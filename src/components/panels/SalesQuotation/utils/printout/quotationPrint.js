import { buildQuotationDocumentHtml } from './quotationPreview';

/**
 * Builds the standalone A4 HTML document for a quotation. The markup and
 * styling now live in `quotationPreview.js` / `quotationPreview.module.css`;
 * this module only fixes the document variant (quotation vs AR invoice).
 */
export const buildQuotationDocumentA4Html = (options = {}) =>
  buildQuotationDocumentHtml({ ...options, variant: 'quotation' });

export const printQuotationDocumentA4 = (options) => {
  const html = buildQuotationDocumentA4Html(options);

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
