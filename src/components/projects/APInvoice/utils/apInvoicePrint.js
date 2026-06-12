import { toArray, toSafeString } from './apInvoiceHelpers';
import { computeApInvoiceTotals, formatMoney } from './apInvoiceTotals';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDateLabel = (value) => {
  const text = toSafeString(value);
  if (!text) return '-';
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const buildDocumentTitle = (invoice, supplierName) => {
  const id = toSafeString(invoice?.id) || 'AP-INVOICE';
  const supplier = toSafeString(supplierName) || 'SUPPLIER';
  return `${id} - ${supplier} - AP Invoice`;
};

const buildRowDetailsHtml = ({
  rowDetails,
  invoiceTypeLabelByCode,
  currencyCodeById,
}) => {
  if (toArray(rowDetails).length === 0) {
    return '<tr><td colspan="7" class="empty-row">No row details</td></tr>';
  }

  return toArray(rowDetails)
    .map((row, index) => {
      const typeCode = toSafeString(row?.ap_invoice_type);
      const typeLabel =
        invoiceTypeLabelByCode.get(typeCode) || typeCode || `ROW-${index + 1}`;
      const currencyCode =
        currencyCodeById.get(toSafeString(row?.currency_id)) ||
        toSafeString(row?.currency_id) ||
        '-';

      return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(typeLabel)}</td>
        <td>${escapeHtml(toSafeString(row?.description) || '-')}</td>
        <td class="mono">${escapeHtml(currencyCode)}</td>
        <td class="money">${escapeHtml(formatMoney(row?.amount))}</td>
        <td>${escapeHtml(toSafeString(row?.details) || '-')}</td>
        <td>${escapeHtml(toSafeString(row?.remark) || '-')}</td>
      </tr>
      `;
    })
    .join('');
};

export const buildApInvoiceDocumentA4Html = ({
  invoice,
  supplierOptions = [],
  purchaseRequests = [],
  currencies = [],
  invoiceTypes = [],
  baseCurrencyCode = 'HKD',
  currencyCodeById = {},
  exchangeRateMap = { HKD: 1 },
}) => {
  if (!invoice || !invoice?.id) {
    throw new Error('Please select an AP invoice to print.');
  }

  const supplierById = new Map(
    toArray(supplierOptions).map((item) => [
      toSafeString(item?.id),
      toSafeString(
        item?.supplier_display_name ||
          item?.display_name ||
          item?.supplier_name ||
          item?.name ||
          item?.id,
      ),
    ]),
  );
  const purchaseRequestById = new Map(
    toArray(purchaseRequests).map((item) => [toSafeString(item?.id), item]),
  );
  const fallbackCurrencyCodeById = toArray(currencies).reduce((acc, item) => {
    const id = toSafeString(item?.id);
    const code = toSafeString(
      item?.code || item?.name || item?.id,
    ).toUpperCase();

    if (id && code) {
      acc[id] = code;
    }

    return acc;
  }, {});

  const effectiveCurrencyCodeById =
    Object.keys(currencyCodeById || {}).length > 0
      ? currencyCodeById
      : fallbackCurrencyCodeById;

  const currencyCodeByIdMap = new Map(
    Object.entries(effectiveCurrencyCodeById),
  );
  const invoiceTypeLabelByCode = new Map(
    toArray(invoiceTypes).map((item) => [
      toSafeString(item?.code),
      toSafeString(item?.description || item?.code),
    ]),
  );

  const supplierName =
    supplierById.get(toSafeString(invoice?.supplier_id)) || '-';
  const purchaseRequest =
    purchaseRequestById.get(toSafeString(invoice?.purchase_request_id)) || null;

  const rowDetails = toArray(invoice?.ap_invoice_row_details);
  const totalsSummary = computeApInvoiceTotals(invoice, {
    baseCurrencyCode,
    currencyCodeById: effectiveCurrencyCodeById,
    exchangeRateMap,
  });

  const title = buildDocumentTitle(invoice, supplierName);

  return `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page {
        size: A4;
        margin: 12mm;
      }
      body {
        margin: 0;
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        color: #1c2530;
        -webkit-print-color-adjust: exact;
      }
      .sheet {
        border: 1px solid #d6dde5;
        padding: 18px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        border-bottom: 2px solid #0f5f76;
        padding-bottom: 8px;
        margin-bottom: 14px;
      }
      .title {
        font-size: 22px;
        letter-spacing: 0.3px;
        color: #0f5f76;
        font-weight: 700;
      }
      .sub {
        font-size: 12px;
        color: #5a6b7c;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px 18px;
        margin-bottom: 14px;
      }
      .meta-item {
        border: 1px solid #e1e8ef;
        padding: 8px;
        border-radius: 6px;
      }
      .meta-label {
        font-size: 11px;
        color: #607487;
        margin-bottom: 4px;
      }
      .meta-value {
        font-size: 14px;
        font-weight: 600;
        word-break: break-word;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .table th,
      .table td {
        border: 1px solid #dbe4ec;
        padding: 7px;
        font-size: 12px;
        vertical-align: top;
      }
      .table th {
        background: #f2f7fb;
        color: #20364a;
        text-align: left;
      }
      .empty-row {
        text-align: center;
        color: #6f7f8f;
      }
      .money {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .mono {
        font-family: "Consolas", "Courier New", monospace;
      }
      .footer {
        margin-top: 14px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      .remark {
        max-width: 70%;
        font-size: 12px;
        color: #3b4a59;
      }
      .total {
        border: 1px solid #cfd9e2;
        border-radius: 6px;
        padding: 8px 10px;
        min-width: 220px;
      }
      .total-label {
        font-size: 11px;
        color: #687b8e;
      }
      .total-value {
        display: block;
        margin-top: 3px;
        font-size: 20px;
        font-weight: 700;
        color: #0f5f76;
      }
      .total-note {
        display: block;
        margin-top: 6px;
        font-size: 11px;
        color: #b45309;
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <div>
          <div class="title">AP Invoice</div>
          <div class="sub">Accounts Payable Row Detail Document</div>
        </div>
        <div class="sub">${escapeHtml(toSafeString(invoice?.id))}</div>
      </div>

      <div class="meta">
        <div class="meta-item">
          <div class="meta-label">Supplier</div>
          <div class="meta-value">${escapeHtml(supplierName)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Purchase Request</div>
          <div class="meta-value">${escapeHtml(
            toSafeString(invoice?.purchase_request_id),
          )}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Invoice Ref</div>
          <div class="meta-value">${escapeHtml(
            toSafeString(invoice?.invoice_ref) || '-',
          )}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Invoice Date / Due Date</div>
          <div class="meta-value">${escapeHtml(
            formatDateLabel(invoice?.invoice_date),
          )} / ${escapeHtml(formatDateLabel(invoice?.due_date))}</div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th style="width: 36px;">#</th>
            <th style="width: 110px;">Type</th>
            <th style="width: 180px;">Description</th>
            <th style="width: 70px;">Currency</th>
            <th style="width: 90px;">Amount</th>
            <th>Details</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          ${buildRowDetailsHtml({
            invoice,
            rowDetails,
            invoiceTypeLabelByCode,
            currencyCodeById: currencyCodeByIdMap,
          })}
        </tbody>
      </table>

      <div class="footer">
        <div class="remark">
          <strong>Header Remark:</strong>
          ${escapeHtml(toSafeString(invoice?.remark) || '-')}
          <br />
          <strong>Purchase Request Remark:</strong>
          ${escapeHtml(toSafeString(purchaseRequest?.remark) || '-')}
        </div>
        <div class="total">
          <span class="total-label">Total Amount (${escapeHtml(
            toSafeString(totalsSummary?.baseCurrencyCode || baseCurrencyCode) ||
              'HKD',
          )})</span>
          <span class="total-value">${escapeHtml(
            formatMoney(totalsSummary?.totalAmount),
          )}</span>
          ${
            Number(totalsSummary?.missingCount || 0) > 0
              ? `<span class="total-note">Skipped ${escapeHtml(String(totalsSummary?.missingCount))} row(s) due to missing currency or exchange rate.</span>`
              : ''
          }
        </div>
      </div>
    </div>
  </body>
</html>
  `;
};
