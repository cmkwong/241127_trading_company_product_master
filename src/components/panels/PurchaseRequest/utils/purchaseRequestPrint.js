import { buildApInvoiceDocumentA4Html } from '../../APInvoice/utils/apInvoicePrint';

const formatMoney3 = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};

export const buildPurchaseRequestApInvoiceHtml = (options = {}) =>
  buildApInvoiceDocumentA4Html({
    ...options,
    formatMoney: formatMoney3,
  });
