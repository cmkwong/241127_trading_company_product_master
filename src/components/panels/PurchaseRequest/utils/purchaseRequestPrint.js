import { buildApInvoiceDocumentA4Html } from './printout/apInvoicePrint';

export const buildPurchaseRequestApInvoiceHtml = (options = {}) =>
  buildApInvoiceDocumentA4Html(options);
