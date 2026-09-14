import { buildDeliveryNoteDocumentHtml } from './deliveryNotePreview';

/**
 * Delivery Note uses the shared renderer with `delivery-note` labels/layout.
 */
export const buildDeliveryNoteDocumentA4Html = (options = {}) =>
  buildDeliveryNoteDocumentHtml(options);

export const printDeliveryNoteDocumentA4 = (options) => {
  const html = buildDeliveryNoteDocumentA4Html(options);

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
