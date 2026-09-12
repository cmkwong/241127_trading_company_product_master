import {
  computeQuotationTotals,
  formatMoney,
  getDiscountedRate,
  isSelectedFlag,
  normalizeDiscountPercent,
  toNumber,
  toSafeString,
} from './quotationTotals';
import { computeLineAmount, formatRateMoney } from '../../../../utils/money';

const FILE_SERVER_BASE_URL = 'http://localhost:3001';
const DEFAULT_COMPANY_NAME = 'Rivolx Limited';
const DEFAULT_COMPANY_ADDRESS =
  "RM A, 19/F MAX SHARE CTR 367-373 KING'S RD NORTH POINT, HONG KONG, China, Hong Kong";
const DEFAULT_CONTACT_PERSON = 'Chris Cheung';
const DEFAULT_COMPANY_LOGO_URL = '/assets/watermark_v1.png';
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

const sortByDisplayOrder = (rows = []) => {
  return [...(Array.isArray(rows) ? rows : [])].sort(
    (a, b) => Number(a?.display_order || 0) - Number(b?.display_order || 0),
  );
};

const sortLineItemsByAmountDesc = (rows = []) => {
  return [...(Array.isArray(rows) ? rows : [])].sort((a, b) => {
    const aAmount = Number.isFinite(a?.amount) ? a.amount : -Infinity;
    const bAmount = Number.isFinite(b?.amount) ? b.amount : -Infinity;
    return bAmount - aAmount;
  });
};

const buildImageUrlsByParent = (rows = [], parentField) => {
  const grouped = new Map();

  sortByDisplayOrder(rows).forEach((row) => {
    const parentId = toSafeString(row?.[parentField]);
    if (!parentId) return;

    const imageUrl = normalizeUrl(row?.image_url);
    if (!imageUrl) return;

    const current = grouped.get(parentId) || [];
    if (!current.includes(imageUrl)) {
      grouped.set(parentId, [...current, imageUrl]);
    }
  });

  return grouped;
};

const resolveCompanyInfo = (companyInfo = null) => {
  const record =
    companyInfo && typeof companyInfo === 'object' ? companyInfo : {};

  return {
    logoUrl: normalizeUrl(
      toSafeString(record?.logo_icon_url) || DEFAULT_COMPANY_LOGO_URL,
    ),
    companyName:
      toSafeString(record?.company_name) ||
      toSafeString(record?.name) ||
      DEFAULT_COMPANY_NAME,
    companyAddress:
      toSafeString(record?.company_address) || DEFAULT_COMPANY_ADDRESS,
    contactPerson:
      toSafeString(record?.contact_person) || DEFAULT_CONTACT_PERSON,
  };
};

const toFilenameSegment = (value, fallback = 'na') => {
  const normalized = toSafeString(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9-\s]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
};

const buildQuotationPdfFileName = ({
  quotationNumber,
  companyFromName,
  companyToName,
}) => {
  const quotationSegment = toFilenameSegment(
    quotationNumber.slice(0, 8) || '',
    'unknown-quotation',
  );
  const fromSegment = toFilenameSegment(companyFromName, 'unknown-from');
  const toSegment = toFilenameSegment(companyToName, 'unknown-to');

  return `quotation-${quotationSegment}-${fromSegment}-${toSegment}.pdf`;
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
  const productImageUrlsByDetail = buildImageUrlsByParent(
    quotation?.sales_product_detail_images,
    'sales_product_detail_id',
  );

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
      const discountPercent = normalizeDiscountPercent(row?.discount_percent);
      const discountedRate = getDiscountedRate(rate, discountPercent);
      const amount = computeLineAmount({
        rate,
        quantity: qty,
        discountPercent,
      });
      const currencyCode =
        currencyCodeById[toSafeString(row?.currency_id)] || baseCurrencyCode;
      const detailId = toSafeString(row?.id);
      const uploadedImageUrls = productImageUrlsByDetail.get(detailId) || [];
      const iconUrl = normalizeUrl(product?.icon_url);
      const imageUrls = [iconUrl, ...uploadedImageUrls].filter(Boolean);
      const uniqueImageUrls = [...new Set(imageUrls)];

      return {
        itemName:
          toSafeString(row?.override_product_name) ||
          toSafeString(product?.name) ||
          toSafeString(product?.label) ||
          'Product Item',
        details: [toSafeString(row?.details)].filter(Boolean),
        qty,
        rate,
        discountPercent,
        discountedRate,
        amount,
        currencyCode,
        imageUrls: uniqueImageUrls,
      };
    });
};

const buildServiceLineItems = ({
  quotation,
  serviceById,
  currencyCodeById,
  baseCurrencyCode,
}) => {
  const serviceImageUrlsByDetail = buildImageUrlsByParent(
    quotation?.sales_service_detail_images,
    'sales_service_detail_id',
  );

  return (
    Array.isArray(quotation?.sales_service_details)
      ? quotation.sales_service_details
      : []
  )
    .filter((row) => isSelectedFlag(row?.selected, true))
    .map((row) => {
      const service = serviceById.get(toSafeString(row?.service_id));
      const qty = Number.isFinite(toNumber(row?.qty)) ? toNumber(row?.qty) : 1;
      const rate = toNumber(row?.price);
      const discountPercent = normalizeDiscountPercent(row?.discount_percent);
      const discountedRate = getDiscountedRate(rate, discountPercent);
      const amount = computeLineAmount({
        rate,
        quantity: qty,
        discountPercent,
      });
      const currencyCode =
        currencyCodeById[toSafeString(row?.currency_id)] || baseCurrencyCode;
      const detailId = toSafeString(row?.id);
      const imageUrls = serviceImageUrlsByDetail.get(detailId) || [];

      return {
        itemName:
          toSafeString(row?.override_service_name) ||
          toSafeString(service?.name) ||
          'Service Item',
        details: [toSafeString(row?.details)].filter(Boolean),
        qty,
        rate,
        discountPercent,
        discountedRate,
        amount,
        currencyCode,
        imageUrls,
      };
    });
};

const buildShippingLineItems = ({
  quotation,
  shippingMethodById,
  addressById,
  currencyCodeById,
  baseCurrencyCode,
}) => {
  const shippingDetails = Array.isArray(quotation?.sales_shipping_details)
    ? quotation.sales_shipping_details
    : [];
  const detailById = buildLookupMap(shippingDetails);
  const shippingDetailImageUrlsByDetail = buildImageUrlsByParent(
    quotation?.sales_shipping_images,
    'sales_shipping_detail_id',
  );
  const shippingPriceImageUrlsByPrice = buildImageUrlsByParent(
    quotation?.sales_shipping_price_images,
    'sales_shipping_price_id',
  );

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
      const rate = toNumber(row?.price);
      const discountPercent = normalizeDiscountPercent(row?.discount_percent);
      const discountedRate = getDiscountedRate(rate, discountPercent);
      const currencyCode =
        currencyCodeById[toSafeString(row?.currency_id)] || baseCurrencyCode;
      const deliveryAddress = addressById.get(
        toSafeString(detail?.customer_address_id),
      );
      const leadTimeFrom = toNumber(row?.delivery_lead_time_from);
      const leadTimeTo = toNumber(row?.delivery_lead_time_to);
      const hasLeadTimeFrom = Number.isFinite(leadTimeFrom);
      const hasLeadTimeTo = Number.isFinite(leadTimeTo);
      const detailId = toSafeString(row?.sales_shipping_detail_id);
      const priceId = toSafeString(row?.id);
      const imageUrls = [
        ...(shippingDetailImageUrlsByDetail.get(detailId) || []),
        ...(shippingPriceImageUrlsByPrice.get(priceId) || []),
      ];
      const uniqueImageUrls = [...new Set(imageUrls)];

      return {
        itemName:
          toSafeString(row?.override_shipping_method_name) ||
          toSafeString(shippingMethod?.name) ||
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
        discountPercent,
        discountedRate,
        amount: computeLineAmount({
          rate,
          quantity: 1,
          discountPercent,
        }),
        currencyCode,
        imageUrls: uniqueImageUrls,
      };
    });
};

const formatLineMoney = (value) => {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return formatMoney(value);
};

const formatLineRate = (value) => {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return formatRateMoney(value);
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
      const hasDiscount =
        Number.isFinite(item?.discountPercent) &&
        Number(item.discountPercent) > 0;
      const discountPercentLabel = hasDiscount
        ? Number(item.discountPercent).toLocaleString(undefined, {
            minimumFractionDigits: Number.isInteger(
              Number(item.discountPercent),
            )
              ? 0
              : 2,
            maximumFractionDigits: 2,
          })
        : '';
      const discountTag = hasDiscount
        ? `<div class="discount-badge">${escapeHtml(`${discountPercentLabel}% OFF`)}</div>`
        : '';
      const imageHtml = (Array.isArray(item.imageUrls) ? item.imageUrls : [])
        .filter(Boolean)
        .map(
          (imageUrl) =>
            `<img class="item-image" src="${escapeHtml(imageUrl)}" alt="item" />`,
        )
        .join('');
      const imageBlock = imageHtml
        ? `<div class="item-images">${imageHtml}</div>`
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
            ${discountTag}
            ${imageBlock}
          </td>
          <td class="qty-col">${escapeHtml(String(item.qty))}</td>
          <td class="rate-col">${
            hasDiscount
              ? `<div class="rate-old">${escapeHtml(
                  formatLineRate(item.rate),
                )}${currencySuffix}</div><div class="rate-new">${escapeHtml(
                  formatLineRate(item.discountedRate),
                )}${currencySuffix}</div>`
              : `${escapeHtml(formatLineRate(item.rate))}${currencySuffix}`
          }</td>
          <td class="amount-col">${escapeHtml(formatLineMoney(item.amount))}${currencySuffix}</td>
        </tr>
      `;
    })
    .join('');
};

const buildQuotationHtml = ({
  quotation,
  documentTitle,
  customerName,
  customerAddress,
  companyInfo,
  lineItems,
  totalLabel,
  totalAmount,
  createdDate,
  validTillDate,
  showTotalPrice = true,
}) => {
  const quotationNumber = toSafeString(quotation?.id) || '-';
  const resolvedCompanyInfo = resolveCompanyInfo(companyInfo);
  const logoUrl = resolvedCompanyInfo.logoUrl;

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
      rel="stylesheet"
    />
    <title>${escapeHtml(documentTitle || `quotation-${quotationNumber}`)}</title>
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
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, Arial,
          Helvetica, sans-serif;
        color: #262626;
        background: #ffffff;
        font-size: 9px;
      }

      .page {
        width: 100%;
        min-height: 100%;
        background: #ffffff;
      }

      @media screen {
        body {
          background: #f3f4f6;
          padding: 24px;
        }

        .page {
          max-width: 595px;
          margin: 0 auto;
          padding: 40px 48px;
          border: 1px solid #e0e0e0;
          box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.1);
        }
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
        white-space: nowrap;
      }

      .logo {
        width: auto;
        height: 80px;
        max-width: 80px;
        object-fit: contain;
      }

      .doc-title {
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        font-size: 36px;
        font-weight: 700;
        color: #fa6d5a;
        line-height: 1;
      }

      .divider {
        width: 100%;
        height: 2px;
        margin: 16px 0 12px;
        background: #fa6d5a;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: 175px 160px 1fr;
        gap: 12px;
        align-items: start;
        padding-bottom: 16px;
      }

      .meta-title {
        color: #fa6d5a;
        font-size: 8px;
        font-weight: 600;
        text-transform: uppercase;
        text-decoration: underline;
        margin-bottom: 3px;
      }

      .meta-heading {
        font-size: 12px;
        font-weight: 700;
        color: #262626;
        margin-bottom: 3px;
      }

      .meta-line {
        font-size: 7px;
        color: #262626;
        line-height: 1.45;
        white-space: normal;
        word-break: break-word;
      }

      .meta-line-quot {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        font-size: 8px;
        line-height: 1.45;
        color: #262626;
      }

      .meta-line-quot-label {
        width: 75px;
        flex-shrink: 0;
        color: #94a3b8;
      }

      .meta-line-quot-value {
        color: #262626;
        font-weight: 500;
        white-space: nowrap;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e2e8f0;
      }

      thead th {
        background: #fa6d5a;
        border-left: 1px solid #ffffff;
        font-size: 9px;
        font-weight: 600;
        color: #ffffff;
        text-align: left;
        padding: 5px 6px;
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      }

      thead th:first-child {
        border-left: none;
      }

      thead th.th-num {
        text-align: right;
      }

      tbody td {
        border-left: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: top;
        padding: 8px 6px;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      .index-col {
        width: 28px;
        text-align: left;
        font-weight: 500;
        font-size: 9px;
        color: #262626;
        border-left: none;
      }

      .item-col {
        width: 237px;
        position: relative;
      }

      .qty-col,
      .rate-col,
      .amount-col {
        text-align: right;
        white-space: nowrap;
        font-size: 9px;
        color: #262626;
      }

      .qty-col {
        width: 68px;
      }

      .rate-col {
        width: 72px;
      }

      .amount-col {
        width: 74px;
      }

      .item-title {
        font-weight: 700;
        font-size: 9px;
        color: #262626;
        margin-bottom: 3px;
        word-break: break-word;
      }

      .item-detail {
        color: #94a3b8;
        font-size: 8px;
        margin-top: 0;
        margin-bottom: 3px;
        line-height: 1.45;
        white-space: pre-line;
        word-break: break-word;
      }

      .discount-badge {
        display: inline-block;
        margin-top: 2px;
        padding: 2px 6px;
        border: 1px solid #f2a3b2;
        border-radius: 4px;
        background: #ffe8ee;
        color: #d54f6c;
        font-size: 8px;
        font-weight: 700;
        line-height: 1.2;
      }

      .rate-old {
        color: #9ca3af;
        text-decoration: line-through;
        text-decoration-thickness: 2px;
        text-decoration-color: #9ca3af;
        line-height: 1.2;
      }

      .rate-new {
        color: #262626;
        font-weight: 700;
        line-height: 1.2;
      }

      .item-image {
        display: block;
        width: 60px;
        height: 45px;
        object-fit: cover;
        background: #f5f5f5;
        border-radius: 3px;
      }

      .item-images {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
      }

      .empty-row {
        text-align: center;
        color: #94a3b8;
        padding: 16px;
      }

      .spacer {
        width: 100%;
        height: 20px;
      }

      .footer {
        margin-top: 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        white-space: nowrap;
      }

      .footer-no-total {
        justify-content: flex-start;
      }

      .terms {
        width: 280px;
        font-size: 7px;
        color: #94a3b8;
        line-height: 1.45;
      }

      .terms-title {
        font-weight: 700;
        font-size: 9px;
        color: #262626;
        text-decoration: underline;
        margin-bottom: 2px;
      }

      .total-box {
        background: #fa6d5a;
        color: #ffffff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 20px 10px 16px;
      }

      .total-label {
        font-size: 10px;
        font-weight: 600;
      }

      .total-value {
        font-size: 24px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <img class="logo" src="${escapeHtml(logoUrl)}" alt="Rivolx" />
        <div class="doc-title">Quotation</div>
      </div>

      <div class="divider"></div>

      <div class="meta-grid">
        <div class="from-col">
          <div class="meta-title">Quotation From</div>
          <div class="meta-heading">${escapeHtml(resolvedCompanyInfo.companyName)}</div>
          <div class="meta-line">${escapeHtml(resolvedCompanyInfo.companyAddress)}</div>
          <div class="meta-line">Contact Person: ${escapeHtml(resolvedCompanyInfo.contactPerson)}</div>
        </div>

        <div class="for-col">
          <div class="meta-title">Quotation For</div>
          <div class="meta-heading">${escapeHtml(customerName || '-')}</div>
          <div class="meta-line">${escapeHtml(customerAddress || '-')}</div>
        </div>

        <div class="details-col">
          <div class="meta-title">Details</div>
          <div class="meta-line-quot">
            <span class="meta-line-quot-label">Quotation No #</span>
            <span class="meta-line-quot-value">${escapeHtml(quotationNumber.slice(0, 8).toUpperCase())}</span>
          </div>
          <div class="meta-line-quot">
            <span class="meta-line-quot-label">Quotation Date</span>
            <span class="meta-line-quot-value">${escapeHtml(createdDate)}</span>
          </div>
          <div class="meta-line-quot">
            <span class="meta-line-quot-label">Valid Till Date</span>
            <span class="meta-line-quot-value">${escapeHtml(validTillDate)}</span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 28px;"></th>
            <th style="width: 237px;">Item</th>
            <th class="th-num" style="width: 68px;">Quantity</th>
            <th class="th-num" style="width: 72px;">Rate</th>
            <th class="th-num" style="width: 74px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${buildQuotationRowsHtml(lineItems, totalLabel)}
        </tbody>
      </table>

      <div class="spacer"></div>

      <div class="footer ${showTotalPrice ? '' : 'footer-no-total'}">
        <div class="terms">
          <div class="terms-title">Terms and Conditions</div>
          <div>Work will resume after advance payment.</div>
          <div>If any custom tax charge which is not included.</div>
          <div>Preliminary quotes only. Mass production pricing to be re-quoted after sampling.</div>
        </div>
        ${
          showTotalPrice
            ? `<div class="total-box">
          <span class="total-label">Total (${escapeHtml(totalLabel)})</span>
          <span class="total-value">$${escapeHtml(totalAmount)}</span>
        </div>`
            : ''
        }
      </div>
    </div>
  </body>
</html>
  `;
};

export const buildQuotationDocumentA4Html = ({
  quotation,
  companyInfo = null,
  customerOptions = [],
  customerAddressOptions = [],
  shippingMethodOptions = [],
  productOptions = [],
  serviceOptions = [],
  currencyCodeById = {},
  baseCurrencyCode = 'USD',
  exchangeRateMap = { HKD: 1 },
  showTotalPrice = true,
}) => {
  if (!quotation || !quotation?.id) {
    throw new Error('Please select a quotation to print.');
  }

  const customerById = buildLookupMap(customerOptions);
  const addressById = buildLookupMap(customerAddressOptions);
  const shippingMethodById = buildLookupMap(shippingMethodOptions);
  const productById = buildLookupMap(productOptions);
  const serviceById = buildLookupMap(serviceOptions);

  const customer = customerById.get(toSafeString(quotation?.customer_id));
  const customerAddress = addressById.get(
    toSafeString(quotation?.customer_address_id),
  );

  const lineItems = [
    ...sortLineItemsByAmountDesc(
      buildProductLineItems({
        quotation,
        productById,
        currencyCodeById,
        baseCurrencyCode,
      }),
    ),
    ...sortLineItemsByAmountDesc(
      buildServiceLineItems({
        quotation,
        serviceById,
        currencyCodeById,
        baseCurrencyCode,
      }),
    ),
    ...sortLineItemsByAmountDesc(
      buildShippingLineItems({
        quotation,
        shippingMethodById,
        addressById,
        currencyCodeById,
        baseCurrencyCode,
      }),
    ),
  ];

  const summary = computeQuotationTotals(quotation, {
    baseCurrencyCode,
    currencyCodeById,
    exchangeRateMap,
  });

  const customerName =
    pickCustomerName(customer) || toSafeString(quotation?.customer_id);
  const resolvedCompanyInfo = resolveCompanyInfo(companyInfo);
  const documentTitle = buildQuotationPdfFileName({
    quotationNumber: toSafeString(quotation?.id),
    companyFromName: resolvedCompanyInfo.companyName,
    companyToName: customerName,
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
    documentTitle,
    customerName,
    customerAddress: pickAddressLine(customerAddress),
    companyInfo,
    lineItems,
    totalLabel,
    totalAmount,
    createdDate,
    validTillDate,
    showTotalPrice,
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
