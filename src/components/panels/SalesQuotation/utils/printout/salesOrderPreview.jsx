/* eslint-disable react-refresh/only-export-components -- this module exposes
	shared preview/print helper exports by design. */
import QuotationPreviewPage, {
  buildQuotationDocumentHtml,
  buildQuotationPreviewMarkup,
  buildQuotationViewData,
} from './quotationPreview';

export const SALES_ORDER_VARIANT = 'sales-order';

export const buildSalesOrderViewData = (options = {}) =>
  buildQuotationViewData({ ...options, variant: SALES_ORDER_VARIANT });

export const buildSalesOrderPreviewMarkup = (options = {}) =>
  buildQuotationPreviewMarkup({ ...options, variant: SALES_ORDER_VARIANT });

export const buildSalesOrderDocumentHtml = (options = {}) =>
  buildQuotationDocumentHtml({ ...options, variant: SALES_ORDER_VARIANT });

export default QuotationPreviewPage;
