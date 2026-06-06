import {
  computeQuotationTotals,
  formatMoney,
  isSelectedFlag,
  toNumber,
  toSafeString,
} from './quotationTotals';

const FILE_SERVER_BASE_URL = 'http://localhost:3001';
const COMPANY_NAME = 'Rivolx Limited';
const COMPANY_ADDRESS =
  "RM A, 19/F MAX SHARE CTR 367-373 KING'S RD NORTH POINT, HONG KONG, China, Hong Kong";
const COMPANY_EMAIL = 'chris.cheung@rivolx.com';
const QUOTATION_VALID_DAYS = 15;

const escapeHtml = (value) => {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatDateLabel = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateOnly = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
};

const computeValidTillDate = (createdAtValue) => {
  const parsed = new Date(createdAtValue || Date.now());
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  parsed.setDate(parsed.getDate() + QUOTATION_VALID_DAYS);
  return formatDateLabel(parsed.toISOString());
};

const normalizeUrl = (rawUrl) => {
  const normalized = toSafeString(rawUrl);
  if (!normalized) return '';

  if (/^(blob:|data:|https?:\/\/)/i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return `${FILE_SERVER_BASE_URL}${normalized}`;
  }

  return `${FILE_SERVER_BASE_URL}/${normalized}`;
};

const buildLookupMap = (rows = [], getId = (item) => item?.id) => {
  const map = new Map();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const id = toSafeString(getId(row));
    if (!id || map.has(id)) {
      return;
    }

    map.set(id, row);
  });

  return map;
};

const pickCustomerName = (customer) => {
  return toSafeString(
    customer?.customer_display_name ||
      customer?.display_name ||
      customer?.customer_name ||
      customer?.name ||
      customer?.label ||
      customer?.id,
  );
};

const pickAddressLine = (address) => {
  const detail = toSafeString(address?.address_detail);
  if (detail) return detail;

  const parts = [
    address?.address,
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.province,
    address?.country,
    address?.zip_code,
    address?.postal_code,
    address?.details,
    address?.remark,
  ]
    .map((value) => toSafeString(value))
    .filter(Boolean);

  return parts.join(', ');
};

const buildProductLineItems = ({
  quotation,
  productById,
  currencyCodeById,
  baseCurrencyCode,
}) => {
  return (
    Array.isArray(quotation?.sales_product_details)
      ? quotation.sales_product_details
      : []
  )
    .filter((row) => isSelectedFlag(row?.selected, true))
    .map((row) => {
      const product = productById.get(toSafeString(row?.product_id));
      const qty = Number.isFinite(toNumber(row?.qty)) ? toNumber(row?.qty) : 1;
      const rate = toNumber(row?.price);
      const amount = Number.isFinite(rate) ? qty * rate : NaN;
      const currencyCode =
        currencyCodeById[toSafeString(row?.currency_id)] || baseCurrencyCode;

      return {
        itemName:
          toSafeString(product?.name) ||
          toSafeString(product?.label) ||
          'Product Item',
        details: [toSafeString(row?.details)].filter(Boolean),
        qty,
        rate,
        amount,
        currencyCode,
        imageUrl: normalizeUrl(product?.icon_url),
      };
    });
};

const buildServiceLineItems = ({
  quotation,
  supplierById,
  serviceById,
  currencyCodeById,
  baseCurrencyCode,
}) => {
  return (
    Array.isArray(quotation?.sales_service_details)
      ? quotation.sales_service_details
      : []
  )
    .filter((row) => isSelectedFlag(row?.selected, true))
    .map((row) => {
      const supplier = supplierById.get(toSafeString(row?.supplier_id));
      const service = serviceById.get(toSafeString(row?.service_id));
      const qty = Number.isFinite(toNumber(row?.qty)) ? toNumber(row?.qty) : 1;
      const rate = toNumber(row?.price);
      const amount = Number.isFinite(rate) ? qty * rate : NaN;
      const currencyCode =
        currencyCodeById[toSafeString(row?.currency_id)] || baseCurrencyCode;

      const titleParts = [
        toSafeString(service?.name),
        toSafeString(supplier?.name),
      ].filter(Boolean);

      return {
        itemName: titleParts.join(' - ') || 'Service Item',
        details: [toSafeString(row?.details)].filter(Boolean),
        qty,
        rate,
        amount,
        currencyCode,
        imageUrl: '',
      };
    });
};

const buildShippingLineItems = ({
  quotation,
  shippingMethodById,
  supplierById,
  addressById,
  currencyCodeById,
  baseCurrencyCode,
}) => {
  const shippingDetails = Array.isArray(quotation?.sales_shipping_details)
    ? quotation.sales_shipping_details
    : [];
  const detailById = buildLookupMap(shippingDetails);

  return (
    Array.isArray(quotation?.sales_shipping_prices)
      ? quotation.sales_shipping_prices
      : []
  )
    .filter((row) => isSelectedFlag(row?.selected, false))
    .map((row) => {
      const detail = detailById.get(
        toSafeString(row?.sales_shipping_detail_id),
      );
      const shippingMethod = shippingMethodById.get(
        toSafeString(row?.shipping_method_id),
      );
      const supplier = supplierById.get(toSafeString(row?.supplier_id));
      const rate = toNumber(row?.price);
      const currencyCode =
        currencyCodeById[toSafeString(row?.currency_id)] || baseCurrencyCode;
      const deliveryAddress = addressById.get(
        toSafeString(detail?.customer_address_id),
      );
      const leadTimeFrom = toNumber(row?.delivery_lead_time_from);
      const leadTimeTo = toNumber(row?.delivery_lead_time_to);
      const hasLeadTimeFrom = Number.isFinite(leadTimeFrom);
      const hasLeadTimeTo = Number.isFinite(leadTimeTo);

      return {
        itemName:
          toSafeString(shippingMethod?.name) ||
          toSafeString(supplier?.name) ||
          'Delivery Service',
        details: [
          toSafeString(row?.details),
          toSafeString(detail?.details),
          toSafeString(row?.incoterms)
            ? `Incoterms: ${toSafeString(row?.incoterms)}`
            : '',
          hasLeadTimeFrom && hasLeadTimeTo
            ? `Delivery lead time: ${String(leadTimeFrom)} - ${String(
                leadTimeTo,
              )} days`
            : hasLeadTimeFrom
              ? `Delivery lead time from: ${String(leadTimeFrom)} days`
              : hasLeadTimeTo
                ? `Delivery lead time to: ${String(leadTimeTo)} days`
                : '',
          pickAddressLine(deliveryAddress)
            ? `Delivery address: ${pickAddressLine(deliveryAddress)}`
            : '',
        ].filter(Boolean),
        qty: 1,
        rate,
        amount: rate,
        currencyCode,
        imageUrl: '',
      };
    });
};

const formatLineMoney = (value) => {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return formatMoney(value);
};

const buildQuotationRowsHtml = (lineItems = [], baseCurrencyCode) => {
  if (lineItems.length === 0) {
    return `
      <tr>
        <td colspan="5" class="empty-row">No selected quotation items.</td>
      </tr>
    `;
  }

  return lineItems
    .map((item, index) => {
      const rowDetails = (item.details || [])
        .map((line) => `<div class="item-detail">${escapeHtml(line)}</div>`)
        .join('');
      const imageHtml = item.imageUrl
        ? `<img class="item-image" src="${escapeHtml(item.imageUrl)}" alt="item" />`
        : '';
      const showCurrencySuffix =
        toSafeString(item.currencyCode).toUpperCase() !==
        toSafeString(baseCurrencyCode).toUpperCase();
      const currencySuffix = showCurrencySuffix
        ? ` ${escapeHtml(item.currencyCode)}`
        : '';

      return `
        <tr>
          <td class="index-col">${index + 1}.</td>
          <td class="item-col">
            <div class="item-title">${escapeHtml(item.itemName)}</div>
            ${rowDetails}
            ${imageHtml}
          </td>
          <td class="qty-col">${escapeHtml(String(item.qty))}</td>
          <td class="rate-col">${escapeHtml(formatLineMoney(item.rate))}${currencySuffix}</td>
          <td class="amount-col">${escapeHtml(formatLineMoney(item.amount))}${currencySuffix}</td>
        </tr>
      `;
    })
    .join('');
};

const buildQuotationHtml = ({
  quotation,
  customerName,
  customerAddress,
  lineItems,
  totalLabel,
  totalAmount,
  createdDate,
  validTillDate,
}) => {
  const quotationNumber = toSafeString(quotation?.id) || '-';
  const logoUrl = normalizeUrl('/assets/watermark_v1.png');

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Quotation ${escapeHtml(quotationNumber)}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 12mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
        background: #ffffff;
        font-size: 12px;
      }

      .page {
        width: 100%;
        min-height: 100%;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 14px;
      }

      .logo {
        width: 88px;
        height: auto;
      }

      .doc-title {
        font-size: 42px;
        font-weight: 700;
        color: #1d4ed8;
        letter-spacing: 0.5px;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
        margin: 8px 0 14px;
      }

      .meta-title {
        color: #6b7280;
        font-size: 11px;
        margin-bottom: 6px;
        text-transform: uppercase;
      }

      .meta-heading {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 6px;
      }

      .meta-line {
        line-height: 1.45;
        white-space: pre-wrap;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead th {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        font-size: 11px;
        color: #374151;
        text-align: left;
        padding: 8px;
      }

      tbody td {
        border: 1px solid #e5e7eb;
        vertical-align: top;
        padding: 8px;
      }

      .index-col {
        width: 36px;
        text-align: center;
        font-weight: 700;
      }

      .item-col {
        width: auto;
        position: relative;
      }

      .qty-col,
      .rate-col,
      .amount-col {
        width: 90px;
        text-align: right;
        white-space: nowrap;
      }

      .item-title {
        font-weight: 700;
        margin-bottom: 4px;
      }

      .item-detail {
        color: #4b5563;
        margin-top: 2px;
        line-height: 1.45;
      }

      .item-image {
        display: block;
        max-height: 56px;
        max-width: 92px;
        margin-top: 8px;
        margin-left: auto;
      }

      .empty-row {
        text-align: center;
        color: #6b7280;
        padding: 16px;
      }

      .footer {
        margin-top: 16px;
        display: grid;
        grid-template-columns: 1fr 290px;
        gap: 16px;
        align-items: start;
      }

      .terms {
        font-size: 11px;
        color: #374151;
        line-height: 1.6;
      }

      .terms-title {
        font-weight: 700;
        margin-bottom: 5px;
      }

      .total-box {
        background: #0f7bc1;
        color: #ffffff;
        border-radius: 3px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        font-size: 24px;
        font-weight: 700;
      }

      .total-label {
        font-size: 18px;
      }

      .total-value {
        font-size: 28px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <img class="logo" src="${escapeHtml(logoUrl)}" alt="Rivolx" />
        <div class="doc-title">Quotation</div>
      </div>

      <div class="meta-grid">
        <div>
          <div class="meta-title">Quotation From</div>
          <div class="meta-heading">${escapeHtml(COMPANY_NAME)}</div>
          <div class="meta-line">${escapeHtml(COMPANY_ADDRESS)}</div>
          <div class="meta-line">Email: ${escapeHtml(COMPANY_EMAIL)}</div>
        </div>

        <div>
          <div class="meta-title">Quotation For</div>
          <div class="meta-heading">${escapeHtml(customerName || '-')}</div>
          <div class="meta-line">${escapeHtml(customerAddress || '-')}</div>
        </div>

        <div>
          <div class="meta-title">Details</div>
          <div class="meta-line"><strong>Quotation No</strong> # ${escapeHtml(quotationNumber)}</div>
          <div class="meta-line"><strong>Quotation Date</strong> ${escapeHtml(createdDate)}</div>
          <div class="meta-line"><strong>Valid Till Date</strong> ${escapeHtml(validTillDate)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 36px;">#</th>
            <th>Item</th>
            <th style="width: 90px; text-align: right;">Quantity</th>
            <th style="width: 90px; text-align: right;">Rate</th>
            <th style="width: 90px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${buildQuotationRowsHtml(lineItems, totalLabel)}
        </tbody>
      </table>

      <div class="footer">
        <div class="terms">
          <div class="terms-title">Terms and Conditions</div>
          <div>Work will resume after advance payment.</div>
          <div>If any custom tax charge which is not included.</div>
          <div>Preliminary quotes only. Mass production pricing to be re-quoted after sampling.</div>
        </div>
        <div class="total-box">
          <span class="total-label">Total (${escapeHtml(totalLabel)})</span>
          <span class="total-value">$${escapeHtml(totalAmount)}</span>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
};

export const buildQuotationDocumentA4Html = ({
  quotation,
  customerOptions = [],
  customerAddressOptions = [],
  supplierOptions = [],
  shippingMethodOptions = [],
  productOptions = [],
  serviceOptions = [],
  currencyCodeById = {},
  baseCurrencyCode = 'USD',
  exchangeRateMap = { HKD: 1 },
}) => {
  if (!quotation || !quotation?.id) {
    throw new Error('Please select a quotation to print.');
  }

  const customerById = buildLookupMap(customerOptions);
  const addressById = buildLookupMap(customerAddressOptions);
  const supplierById = buildLookupMap(supplierOptions);
  const shippingMethodById = buildLookupMap(shippingMethodOptions);
  const productById = buildLookupMap(productOptions);
  const serviceById = buildLookupMap(serviceOptions);

  const customer = customerById.get(toSafeString(quotation?.customer_id));
  const customerAddress = addressById.get(
    toSafeString(quotation?.customer_address_id),
  );

  const lineItems = [
    ...buildProductLineItems({
      quotation,
      productById,
      currencyCodeById,
      baseCurrencyCode,
    }),
    ...buildShippingLineItems({
      quotation,
      shippingMethodById,
      supplierById,
      addressById,
      currencyCodeById,
      baseCurrencyCode,
    }),
    ...buildServiceLineItems({
      quotation,
      supplierById,
      serviceById,
      currencyCodeById,
      baseCurrencyCode,
    }),
  ];

  const summary = computeQuotationTotals(quotation, {
    baseCurrencyCode,
    currencyCodeById,
    exchangeRateMap,
  });

  const totalLabel =
    toSafeString(summary?.baseCurrencyCode || baseCurrencyCode) || 'USD';
  const totalAmount = formatMoney(summary?.grandTotal);

  const createdDate =
    formatDateLabel(
      formatDateOnly(quotation?.created_at) ||
        formatDateOnly(quotation?.updated_at),
    ) || '-';
  const validTillDate = computeValidTillDate(
    quotation?.created_at || quotation?.updated_at || Date.now(),
  );

  const html = buildQuotationHtml({
    quotation,
    customerName:
      pickCustomerName(customer) || toSafeString(quotation?.customer_id),
    customerAddress: pickAddressLine(customerAddress),
    lineItems,
    totalLabel,
    totalAmount,
    createdDate,
    validTillDate,
  });

  return html;
};

export const printQuotationDocumentA4 = (options) => {
  const html = buildQuotationDocumentA4Html(options);

  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups and try again.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  let hasTriggeredPrint = false;
  const triggerPrint = () => {
    if (hasTriggeredPrint) {
      return;
    }
    hasTriggeredPrint = true;

    printWindow.focus();
    printWindow.print();
  };

  printWindow.addEventListener('load', triggerPrint, { once: true });
  setTimeout(triggerPrint, 700);
};
