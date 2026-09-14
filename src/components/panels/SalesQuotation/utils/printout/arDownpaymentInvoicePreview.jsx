/* eslint-disable react-refresh/only-export-components -- this module exposes
   shared preview/print helper exports by design. */
import QuotationPreviewPage, {
  buildQuotationDocumentHtml,
  buildQuotationPreviewMarkup,
  buildQuotationViewData,
} from './quotationPreview';

export const AR_DOWNPAYMENT_VARIANT = 'ar-downpayment-invoice';

export const buildArDownpaymentViewData = (options = {}) =>
  buildQuotationViewData({ ...options, variant: AR_DOWNPAYMENT_VARIANT });

export const buildArDownpaymentPreviewMarkup = (options = {}) =>
  buildQuotationPreviewMarkup({ ...options, variant: AR_DOWNPAYMENT_VARIANT });

export const buildArDownpaymentDocumentHtml = (options = {}) =>
  buildQuotationDocumentHtml({ ...options, variant: AR_DOWNPAYMENT_VARIANT });

export default QuotationPreviewPage;
