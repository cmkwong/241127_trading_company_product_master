/* eslint-disable react-refresh/only-export-components -- this module exposes
   shared preview/print helper exports by design. */
import QuotationPreviewPage, {
  buildQuotationDocumentHtml,
  buildQuotationPreviewMarkup,
  buildQuotationViewData,
} from './quotationPreview';

export const DELIVERY_NOTE_VARIANT = 'delivery-note';

export const buildDeliveryNoteViewData = (options = {}) =>
  buildQuotationViewData({ ...options, variant: DELIVERY_NOTE_VARIANT });

export const buildDeliveryNotePreviewMarkup = (options = {}) =>
  buildQuotationPreviewMarkup({ ...options, variant: DELIVERY_NOTE_VARIANT });

export const buildDeliveryNoteDocumentHtml = (options = {}) =>
  buildQuotationDocumentHtml({ ...options, variant: DELIVERY_NOTE_VARIANT });

export default QuotationPreviewPage;
