/* eslint-disable react-refresh/only-export-components -- this module exposes
   shared preview/print helper exports by design. */
import QuotationPreviewPage, {
  buildQuotationDocumentHtml,
  buildQuotationPreviewMarkup,
  buildQuotationViewData,
} from './quotationPreview';

export const PACKING_LIST_VARIANT = 'packing-list';

export const buildPackingListViewData = (options = {}) =>
  buildQuotationViewData({ ...options, variant: PACKING_LIST_VARIANT });

export const buildPackingListPreviewMarkup = (options = {}) =>
  buildQuotationPreviewMarkup({ ...options, variant: PACKING_LIST_VARIANT });

export const buildPackingListDocumentHtml = (options = {}) =>
  buildQuotationDocumentHtml({ ...options, variant: PACKING_LIST_VARIANT });

export default QuotationPreviewPage;