import { buildArInvoiceDocumentHtml } from './arInvoicePreview';

/**
 * AR Invoice reuses the same preview/print pipeline as the quotation; the only
 * difference is the document variant, which swaps the labels (title, "Invoice
 * From/For", "AR Invoice No #", "Due Date", etc.) via `getDocumentLabels`.
 */
export const buildArInvoiceDocumentA4Html = (options = {}) =>
  buildArInvoiceDocumentHtml(options);
