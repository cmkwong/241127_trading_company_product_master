/* eslint-disable react-refresh/only-export-components -- this module exposes
   shared preview/print helper exports by design. */
import QuotationPreviewPage, {
  buildQuotationDocumentHtml,
  buildQuotationPreviewMarkup,
  buildQuotationViewData,
} from './quotationPreview';

export const AR_INVOICE_VARIANT = 'ar-invoice';

export const buildArInvoiceViewData = (options = {}) =>
  buildQuotationViewData({ ...options, variant: AR_INVOICE_VARIANT });

export const buildArInvoicePreviewMarkup = (options = {}) =>
  buildQuotationPreviewMarkup({ ...options, variant: AR_INVOICE_VARIANT });

export const buildArInvoiceDocumentHtml = (options = {}) =>
  buildQuotationDocumentHtml({ ...options, variant: AR_INVOICE_VARIANT });

export default QuotationPreviewPage;
