import { buildApInvoiceDocumentHtml } from './apInvoicePreview';

/**
 * AP Invoice reuses the same preview/print pipeline as the sales documents
 * (logo header, meta grid, coral table + total footer); the only difference is
 * the data source (`ap_invoice_row_details` instead of sales line items).
 */
export const buildApInvoiceDocumentA4Html = (options = {}) =>
  buildApInvoiceDocumentHtml(options);
