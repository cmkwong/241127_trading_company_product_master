import { buildQuotationDocumentA4Html } from './quotationPrint';
import { isSelectedFlag } from './quotationTotals';

const replaceFirst = (text, searchValue, replacementValue) => {
  const source = String(text || '');
  const search = String(searchValue || '');

  if (!search) {
    return source;
  }

  const index = source.indexOf(search);
  if (index < 0) {
    return source;
  }

  return (
    source.slice(0, index) +
    String(replacementValue || '') +
    source.slice(index + search.length)
  );
};

const mapSelectedRows = (rows = [], defaultWhenMissing = true) => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => ({
    ...row,
    selected: isSelectedFlag(row?.ari_selected, defaultWhenMissing),
  }));
};

const buildArInvoiceReadyQuotation = (quotation) => {
  const source = quotation && typeof quotation === 'object' ? quotation : {};

  return {
    ...source,
    sales_shipping_prices: mapSelectedRows(source?.sales_shipping_prices, true),
    sales_product_details: mapSelectedRows(source?.sales_product_details, true),
    sales_service_details: mapSelectedRows(source?.sales_service_details, true),
  };
};

const convertQuotationHtmlToArInvoiceHtml = (quotationHtml) => {
  let html = String(quotationHtml || '');

  html = html.replace(/<title>quotation-/i, '<title>ar-invoice-');
  html = replaceFirst(
    html,
    '<div class="doc-title">Quotation</div>',
    '<div class="doc-title">AR Invoice</div>',
  );
  html = replaceFirst(html, 'Quotation From', 'Invoice From');
  html = replaceFirst(html, 'Quotation For', 'Invoice For');
  html = replaceFirst(html, 'Quotation No #', 'AR Invoice No #');
  html = replaceFirst(html, 'Quotation Date', 'Invoice Date');
  html = replaceFirst(html, 'Valid Till Date', 'Due Date');
  html = replaceFirst(
    html,
    'No selected quotation items.',
    'No selected AR invoice items.',
  );

  return html;
};

export const buildArInvoiceDocumentA4Html = (options = {}) => {
  const quotation = options?.quotation;
  const normalizedQuotation = buildArInvoiceReadyQuotation(quotation);

  const quotationHtml = buildQuotationDocumentA4Html({
    ...options,
    quotation: normalizedQuotation,
  });

  return convertQuotationHtmlToArInvoiceHtml(quotationHtml);
};
