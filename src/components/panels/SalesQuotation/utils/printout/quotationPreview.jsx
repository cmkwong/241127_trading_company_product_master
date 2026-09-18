/* eslint-disable react-refresh/only-export-components -- this module is the
   single source of the document markup (component) AND its build helpers, by
   design: quotationPrint.js / arInvoicePrint.js re-export them. */
import { renderToStaticMarkup } from 'react-dom/server';
import styles from './quotationPreview.module.css';
// `?inline` returns the compiled CSS text (same hashed class names as `styles`)
// so the A4 print document uses exactly the same stylesheet as this preview.
import previewCss from './quotationPreview.module.css?inline';
import {
  computeQuotationTotals,
  formatMoney,
  getDiscountedRate,
  isSelectedFlag,
  normalizeDiscountPercent,
  toNumber,
  toSafeString,
} from '../quotationTotals';
import { computeLineAmount, formatRateMoney } from '../../../../../utils/money';
import { A4_SIZE_MM, getA4FramePx } from '../../../../../utils/printUnits';

const FILE_SERVER_BASE_URL = 'http://localhost:3001';
const DEFAULT_COMPANY_NAME = 'Rivolx Limited';
const DEFAULT_COMPANY_ADDRESS =
  "RM A, 19/F MAX SHARE CTR 367-373 KING'S RD NORTH POINT, HONG KONG, China, Hong Kong";
const DEFAULT_CONTACT_PERSON = 'Chris Cheung';
const DEFAULT_COMPANY_LOGO_URL = '/assets/brand_logos/watermark_v1.png';
const QUOTATION_VALID_DAYS = 15;
const DEFAULT_DOWNPAYMENT_PERCENT = 30;
const A4_FRAME_PX = getA4FramePx();

/**
 * Single source of truth for the A4 page geometry. The preview component
 * exposes these as CSS custom properties (`--a4-*` / `--page-padding-*`)
 * consumed by quotationPreview.module.css, and the print shell uses the same
 * values so preview and A4 printout are pixel-identical.
 */
export const A4_LAYOUT = {
  widthMm: A4_SIZE_MM.width,
  heightMm: A4_SIZE_MM.height,
  frameWidthPx: A4_FRAME_PX.widthPx,
  frameHeightPx: A4_FRAME_PX.heightPx,
  paddingTopMm: 14.1,
  paddingSideMm: 16.9,
};

const PAGE_STYLE = {
  '--a4-width-mm': `${A4_LAYOUT.widthMm}mm`,
  '--a4-height-mm': `${A4_LAYOUT.heightMm}mm`,
  '--a4-width-px': `${A4_LAYOUT.frameWidthPx}px`,
  '--a4-height-px': `${A4_LAYOUT.frameHeightPx}px`,
  '--page-padding-top-mm': `${A4_LAYOUT.paddingTopMm}mm`,
  '--page-padding-side-mm': `${A4_LAYOUT.paddingSideMm}mm`,
};

const QUOTATION_LABELS = {
  documentType: 'Quotation',
  fromTitle: 'Quotation From',
  forTitle: 'Quotation For',
  detailsTitle: 'Details',
  numberLabel: 'Quotation No #',
  dateLabel: 'Quotation Date',
  validTillLabel: 'Valid Till Date',
  emptyItems: 'No selected quotation items.',
  filePrefix: 'quotation',
  termsTitle: 'Terms and Conditions',
  termsLines: [
    'Work will resume after advance payment.',
    'If any custom tax charge which is not included.',
    'Preliminary quotes only. Mass production pricing to be re-quoted after sampling.',
  ],
  showPricingColumns: true,
  showTotalPrice: true,
  showValidTillDate: true,
};

const DELIVERY_NOTE_LABELS = {
  ...QUOTATION_LABELS,
  documentType: 'Delivery Note',
  fromTitle: 'Posting From',
  forTitle: 'Posting For',
  numberLabel: 'DN No #',
  dateLabel: 'Posting Date',
  validTillLabel: '',
  emptyItems: 'No selected delivery note items.',
  filePrefix: 'delivery-note',
  termsLines: [
    'The expected arrival dates are estimates only. Rivolx Limited shall not be held liable for any delivery delays caused by customs inspections, port congestion, weather conditions, strikes, or any other circumstances beyond our reasonable control.',
    'Any claims regarding damaged goods, defects, or shortages must be reported to Rivolx Limited in writing within (5) business days of receipt. Failure to notify within this period constitutes full acceptance of the goods.',
  ],
  showPricingColumns: false,
  showTotalPrice: false,
  showValidTillDate: false,
};

const SALES_ORDER_LABELS = {
  ...QUOTATION_LABELS,
  documentType: 'Sales Order',
  fromTitle: 'Order From',
  forTitle: 'Order For',
  numberLabel: 'Order No #',
  dateLabel: 'Order Date',
  validTillLabel: 'Valid Till Date',
  emptyItems: 'No selected sales order items.',
  filePrefix: 'sales-order',
  termsLines: [
    'Please review all details carefully. Production and lead time calculations will commence only upon receipt of the agreed advance payment.',
    "Once the order is confirmed and payment is received, no cancellations or modifications are allowed without the seller's written consent.",
    'If this is a sample order, mass production pricing and lead times are subject to re-quotation after sample approval.',
  ],
};

const AR_DOWNPAYMENT_LABELS = {
  ...QUOTATION_LABELS,
  documentType: 'Proforma Invoice',
  fromTitle: 'Invoice From',
  forTitle: 'Invoice For',
  numberLabel: 'Pro. Inv. No #',
  dateLabel: 'Inv. Date',
  validTillLabel: 'Valid Till Date',
  emptyItems: 'No selected downpayment invoice items.',
  filePrefix: 'ar-downpayment-invoice',
  originalTotalLabel: 'ORIGINAL',
  downpaymentAmountSuffix: 'AMT.',
  termsLines: [
    'A {DOWNPAYMENT_PERCENT}% advance payment is required to commence order processing and production. The remaining balance must be cleared before shipment.',
    'This quote is valid until {VALID_TILL_DATE}. Prices for future mass production are subject to re-quotation after sample approval.',
  ],
};

const AR_INVOICE_LABELS = {
  ...QUOTATION_LABELS,
  documentType: 'Invoice',
  fromTitle: 'Invoice From',
  forTitle: 'Invoice For',
  numberLabel: 'Inv. No #',
  dateLabel: 'Inv. Date',
  validTillLabel: 'Due Date',
  emptyItems: 'No selected AR invoice items.',
  filePrefix: 'ar-invoice',
  originalTotalLabel: 'ORIGINAL TOTAL',
  downpaymentAmountSuffix: 'AMOUNT',
  balanceDueLabel: 'Balance Due',
  termsLines: [
    'The remaining balance of ${BALANCE_DUE} {CURRENCY} is due immediately upon receipt of this invoice.',
    'Title and ownership of the goods shall remain with Rivolx Limited until full and final payment has been received.',
    'No returns or allowances will be made unless notified in writing.',
  ],
};

export const getDocumentLabels = (variant = 'quotation') =>
  variant === 'ar-invoice'
    ? AR_INVOICE_LABELS
    : variant === 'sales-order'
      ? SALES_ORDER_LABELS
      : variant === 'ar-downpayment-invoice'
        ? AR_DOWNPAYMENT_LABELS
        : variant === 'delivery-note'
          ? DELIVERY_NOTE_LABELS
          : QUOTATION_LABELS;

const resolveDownpaymentPercent = (rawValue) => {
  const numeric = toNumber(rawValue);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_DOWNPAYMENT_PERCENT;
  }

  if (numeric > 0 && numeric <= 1) {
    return numeric * 100;
  }

  if (numeric > 0 && numeric <= 100) {
    return numeric;
  }

  return DEFAULT_DOWNPAYMENT_PERCENT;
};

const formatPercentLabel = (value) => {
  if (!Number.isFinite(value)) {
    return String(DEFAULT_DOWNPAYMENT_PERCENT);
  }

  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

const parseDocumentDateValue = (record = null) => {
  const source =
    record?.posting_at || record?.created_at || record?.updated_at || null;
  if (!source) return null;

  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getTime();
};

const resolveRelatedDocumentIds = (allDocuments = [], rootId = '') => {
  const resolvedRootId = toSafeString(rootId);
  if (!resolvedRootId) {
    return new Set();
  }

  const rows = Array.isArray(allDocuments) ? allDocuments : [];
  const byId = new Map(
    rows
      .map((row) => [toSafeString(row?.id), row])
      .filter(([id]) => Boolean(id)),
  );
  const related = new Set();
  const seen = new Set();

  let cursor = resolvedRootId;
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    related.add(cursor);

    const row = byId.get(cursor);
    cursor = toSafeString(row?.base_entry);
  }

  let frontier = [...related];
  while (frontier.length > 0) {
    const next = [];
    rows.forEach((row) => {
      const id = toSafeString(row?.id);
      const baseEntry = toSafeString(row?.base_entry);
      if (!id || !baseEntry) return;
      if (!frontier.includes(baseEntry) || related.has(id)) return;
      related.add(id);
      next.push(id);
    });
    frontier = next;
  }

  return related;
};

const resolveDocTypeIdsByName = (docTypeOptions = [], targetName = '') => {
  const desired = toSafeString(targetName).toLowerCase();
  if (!desired) return new Set();

  return new Set(
    (Array.isArray(docTypeOptions) ? docTypeOptions : [])
      .filter(
        (row) =>
          toSafeString(row?.name).toLowerCase() === desired ||
          toSafeString(row?.label).toLowerCase() === desired,
      )
      .map((row) => toSafeString(row?.id))
      .filter(Boolean),
  );
};

const computeInvoiceDownpaymentSummary = ({
  quotation,
  allDocuments,
  docTypeOptions,
  baseCurrencyCode,
  currencyCodeById,
  exchangeRateMap,
}) => {
  const invoiceId = toSafeString(quotation?.id);
  if (!invoiceId) {
    return {
      totalDownpayment: 0,
      downpaymentPercent: DEFAULT_DOWNPAYMENT_PERCENT,
      hasDownpayment: false,
    };
  }

  const relatedIds = resolveRelatedDocumentIds(allDocuments, invoiceId);
  if (relatedIds.size === 0) {
    return {
      totalDownpayment: 0,
      downpaymentPercent: DEFAULT_DOWNPAYMENT_PERCENT,
      hasDownpayment: false,
    };
  }

  const invoiceTime = parseDocumentDateValue(quotation);
  const downpaymentTypeIds = resolveDocTypeIdsByName(
    docTypeOptions,
    'AR Downpayment Invoice',
  );
  if (downpaymentTypeIds.size === 0) {
    return {
      totalDownpayment: 0,
      downpaymentPercent: DEFAULT_DOWNPAYMENT_PERCENT,
      hasDownpayment: false,
    };
  }

  const rows = Array.isArray(allDocuments) ? allDocuments : [];
  const downpaymentDocs = rows.filter((row) => {
    const id = toSafeString(row?.id);
    if (!id || id === invoiceId || !relatedIds.has(id)) {
      return false;
    }

    const rowDocTypeId = toSafeString(row?.doc_type);
    if (downpaymentTypeIds.size > 0 && !downpaymentTypeIds.has(rowDocTypeId)) {
      return false;
    }

    if (invoiceTime == null) {
      return true;
    }

    const rowTime = parseDocumentDateValue(row);
    if (rowTime == null) {
      return false;
    }

    return rowTime <= invoiceTime;
  });

  if (downpaymentDocs.length === 0) {
    return {
      totalDownpayment: 0,
      downpaymentPercent: DEFAULT_DOWNPAYMENT_PERCENT,
      hasDownpayment: false,
    };
  }

  const totalDownpayment = downpaymentDocs.reduce((sum, row) => {
    const summary = computeQuotationTotals(row, {
      baseCurrencyCode,
      currencyCodeById,
      exchangeRateMap,
    });
    const percent = resolveDownpaymentPercent(row?.header_proforma_percent);
    return sum + Number(summary?.grandTotal || 0) * (percent / 100);
  }, 0);

  return {
    totalDownpayment,
    downpaymentPercent: resolveDownpaymentPercent(
      downpaymentDocs[0]?.header_proforma_percent,
    ),
    hasDownpayment: totalDownpayment > 0,
  };
};

const resolveTermsLines = ({
  labels,
  validTillDate,
  downpaymentPercentLabel,
  balanceDueAmount,
  currencyLabel,
}) => {
  const termsLines = Array.isArray(labels?.termsLines) ? labels.termsLines : [];

  return termsLines.map((line) =>
    toSafeString(line)
      .replaceAll('{VALID_TILL_DATE}', toSafeString(validTillDate) || '-')
      .replaceAll(
        '{DOWNPAYMENT_PERCENT}',
        toSafeString(downpaymentPercentLabel) ||
          String(DEFAULT_DOWNPAYMENT_PERCENT),
      )
      .replaceAll('{BALANCE_DUE}', toSafeString(balanceDueAmount) || '0.000')
      .replaceAll('{CURRENCY}', toSafeString(currencyLabel) || 'USD'),
  );
};

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
  filePrefix = 'quotation',
}) => {
  const quotationSegment = toFilenameSegment(
    quotationNumber.slice(0, 8) || '',
    'unknown-quotation',
  );
  const fromSegment = toFilenameSegment(companyFromName, 'unknown-from');
  const toSegment = toFilenameSegment(companyToName, 'unknown-to');

  return `${filePrefix}-${quotationSegment}-${fromSegment}-${toSegment}.pdf`;
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
  showProductIcon = false,
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
      const imageUrls = [
        ...(showProductIcon ? [iconUrl] : []),
        ...uploadedImageUrls,
      ].filter(Boolean);
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

/* -------------------------------------------------------------------------- */
/*  Section components (TopBar / Header / Body / Footer).                     */
/*  These are the single source of the document markup, reused by both the    */
/*  in-app preview and the A4 printout, so the two can never drift apart.     */
/* -------------------------------------------------------------------------- */

const QuotationRow = ({
  item,
  index,
  baseCurrencyCode,
  showPricingColumns,
}) => {
  const rowDetails = (item.details || []).map((line) => (
    <div key={line} className={styles.itemDetail}>
      {line}
    </div>
  ));
  const hasDiscount =
    Number.isFinite(item?.discountPercent) && Number(item.discountPercent) > 0;
  const discountPercentLabel = hasDiscount
    ? Number(item.discountPercent).toLocaleString(undefined, {
        minimumFractionDigits: Number.isInteger(Number(item.discountPercent))
          ? 0
          : 2,
        maximumFractionDigits: 2,
      })
    : '';
  const discountTag = hasDiscount ? (
    <div className={styles.discountBadge}>{`${discountPercentLabel}% OFF`}</div>
  ) : null;
  const imageHtml = (Array.isArray(item.imageUrls) ? item.imageUrls : [])
    .filter(Boolean)
    .map((imageUrl) => (
      <img
        key={imageUrl}
        className={styles.itemImage}
        src={imageUrl}
        alt="item"
      />
    ));
  const imageBlock =
    imageHtml.length > 0 ? (
      <div className={styles.itemImages}>{imageHtml}</div>
    ) : null;
  const showCurrencySuffix =
    toSafeString(item.currencyCode).toUpperCase() !==
    toSafeString(baseCurrencyCode).toUpperCase();
  const currencySuffix = showCurrencySuffix ? ` ${item.currencyCode}` : '';

  return showPricingColumns ? (
    <tr>
      <td className={styles.indexCol}>{index + 1}.</td>
      <td className={styles.itemCol}>
        <div className={styles.itemTitle}>{item.itemName}</div>
        {rowDetails}
        {discountTag}
        {imageBlock}
      </td>
      <td className={styles.qtyCol}>{String(item.qty)}</td>
      <td className={styles.rateCol}>
        {hasDiscount ? (
          <>
            <div className={styles.rateOld}>
              {formatLineRate(item.rate)}
              {currencySuffix}
            </div>
            <div className={styles.rateNew}>
              {formatLineRate(item.discountedRate)}
              {currencySuffix}
            </div>
          </>
        ) : (
          <>
            {formatLineRate(item.rate)}
            {currencySuffix}
          </>
        )}
      </td>
      <td className={styles.amountCol}>
        {formatLineMoney(item.amount)}
        {currencySuffix}
      </td>
    </tr>
  ) : (
    <tr>
      <td className={styles.indexCol}>{index + 1}.</td>
      <td className={styles.itemCol}>
        <div className={styles.itemTitle}>{item.itemName}</div>
        {rowDetails}
        {discountTag}
        {imageBlock}
      </td>
    </tr>
  );
};

const QuotationBody = ({ lineItems, baseCurrencyCode, labels }) => {
  const isEmpty = lineItems.length === 0;
  const showPricingColumns = labels?.showPricingColumns !== false;

  return (
    <table className={styles.itemsTable}>
      <thead>
        <tr>
          <th style={{ width: '28px' }} />
          <th style={{ width: '237px' }}>Item</th>
          {showPricingColumns ? (
            <>
              <th className={styles.thNum} style={{ width: '68px' }}>
                Quantity
              </th>
              <th className={styles.thNum} style={{ width: '72px' }}>
                Rate
              </th>
              <th className={styles.thNum} style={{ width: '94px' }}>
                Amount
              </th>
            </>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {isEmpty ? (
          <tr>
            <td
              className={styles.emptyRow}
              colSpan={showPricingColumns ? 5 : 2}
            >
              {labels.emptyItems}
            </td>
          </tr>
        ) : (
          lineItems.map((item, index) => (
            <QuotationRow
              key={`${index}-${item.itemName}`}
              item={item}
              index={index}
              baseCurrencyCode={baseCurrencyCode}
              showPricingColumns={showPricingColumns}
            />
          ))
        )}
      </tbody>
    </table>
  );
};

const QuotationTopBar = ({ logoUrl, documentType }) => (
  <div className={styles.topBar}>
    <img className={styles.logo} src={logoUrl} alt="Rivolx" />
    <div className={styles.docTitle}>{documentType}</div>
  </div>
);

const QuotationHeader = ({
  labels,
  companyName,
  companyAddress,
  contactPerson,
  customerName,
  customerAddress,
  quotationNumber,
  createdDate,
  validTillDate,
}) => (
  <>
    <div className={styles.divider} />
    <div className={styles.metaGrid}>
      <div className={styles.fromCol}>
        <div className={styles.metaTitle}>{labels.fromTitle}</div>
        <div className={styles.metaHeading}>{companyName}</div>
        <div className={styles.metaLine}>{companyAddress}</div>
        <div className={styles.metaLine}>Contact Person: {contactPerson}</div>
      </div>

      <div className={styles.forCol}>
        <div className={styles.metaTitle}>{labels.forTitle}</div>
        <div className={styles.metaHeading}>{customerName || '-'}</div>
        <div className={styles.metaLine}>{customerAddress || '-'}</div>
      </div>

      <div className={styles.detailsCol}>
        <div className={styles.metaTitle}>{labels.detailsTitle}</div>
        <div className={styles.metaLineQuot}>
          <span className={styles.metaLineQuotLabel}>{labels.numberLabel}</span>
          <span className={styles.metaLineQuotValue}>{quotationNumber}</span>
        </div>
        <div className={styles.metaLineQuot}>
          <span className={styles.metaLineQuotLabel}>{labels.dateLabel}</span>
          <span className={styles.metaLineQuotValue}>{createdDate}</span>
        </div>
        {labels?.showValidTillDate !== false ? (
          <div className={styles.metaLineQuot}>
            <span className={styles.metaLineQuotLabel}>
              {labels.validTillLabel}
            </span>
            <span className={styles.metaLineQuotValue}>{validTillDate}</span>
          </div>
        ) : null}
      </div>
    </div>
  </>
);

const QuotationFooter = ({
  showTotalPrice,
  totalLabel,
  totalAmount,
  labels,
  paymentSummary,
}) => {
  const termsLines =
    Array.isArray(labels?.termsLines) && labels.termsLines.length > 0
      ? labels.termsLines
      : QUOTATION_LABELS.termsLines;

  const showPaymentSummary = Boolean(paymentSummary?.enabled && showTotalPrice);
  const shouldShowOriginalRow =
    showPaymentSummary && toSafeString(paymentSummary?.originalLabel);
  const shouldShowAdjustmentRow =
    showPaymentSummary && toSafeString(paymentSummary?.adjustmentLabel);

  return (
    <div
      className={`${styles.footer} ${showTotalPrice ? '' : styles.footerNoTotal}`}
    >
      <div className={styles.terms}>
        <div className={styles.termsTitle}>
          {labels?.termsTitle || QUOTATION_LABELS.termsTitle}
        </div>
        <div className={styles.termsLine}>
          {termsLines.map((line, index) => (
            <div key={`${index}-${line}`}>{line}</div>
          ))}
        </div>
      </div>
      {showPaymentSummary ? (
        <div className={styles.downpaymentSummary}>
          {shouldShowOriginalRow ? (
            <div className={styles.originalSummaryRow}>
              <span className={styles.originalSummaryLabel}>
                {paymentSummary.originalLabel}
              </span>
              <span className={styles.originalSummaryValue}>
                {paymentSummary.originalAmount}
              </span>
            </div>
          ) : null}
          {shouldShowAdjustmentRow ? (
            <div className={styles.adjustmentSummaryRow}>
              <span className={styles.adjustmentSummaryLabel}>
                {paymentSummary.adjustmentLabel}
              </span>
              <span className={styles.adjustmentSummaryValue}>
                {paymentSummary.adjustmentAmount}
              </span>
            </div>
          ) : null}
          <div className={styles.totalBox}>
            <span className={styles.totalLabel}>
              {paymentSummary.primaryLabel}
            </span>
            <span className={styles.totalValue}>
              {paymentSummary.primaryAmount}
            </span>
          </div>
        </div>
      ) : showTotalPrice ? (
        <div className={styles.totalBox}>
          <span className={styles.totalLabel}>Total ({totalLabel})</span>
          <span className={styles.totalValue}>${totalAmount}</span>
        </div>
      ) : null}
    </div>
  );
};

const QuotationPreviewPage = ({
  logoUrl,
  documentType,
  labels,
  companyName,
  companyAddress,
  contactPerson,
  customerName,
  customerAddress,
  quotationNumber,
  createdDate,
  validTillDate,
  lineItems,
  baseCurrencyCode,
  showTotalPrice,
  totalLabel,
  totalAmount,
  paymentSummary,
}) => (
  <div className={styles.page} style={PAGE_STYLE}>
    <QuotationTopBar logoUrl={logoUrl} documentType={documentType} />
    <QuotationHeader
      labels={labels}
      companyName={companyName}
      companyAddress={companyAddress}
      contactPerson={contactPerson}
      customerName={customerName}
      customerAddress={customerAddress}
      quotationNumber={quotationNumber}
      createdDate={createdDate}
      validTillDate={validTillDate}
    />
    <QuotationBody
      lineItems={lineItems}
      baseCurrencyCode={baseCurrencyCode}
      labels={labels}
    />
    <div className={styles.spacer} />
    <QuotationFooter
      showTotalPrice={showTotalPrice}
      totalLabel={totalLabel}
      totalAmount={totalAmount}
      labels={labels}
      paymentSummary={paymentSummary}
    />
  </div>
);

export default QuotationPreviewPage;

/* -------------------------------------------------------------------------- */
/*  View-model assembly + HTML document generation.                           */
/* -------------------------------------------------------------------------- */

export const buildQuotationViewData = ({
  variant = 'quotation',
  ...options
}) => {
  const {
    quotation,
    companyInfo = null,
    customerOptions = [],
    customerAddressOptions = [],
    shippingMethodOptions = [],
    productOptions = [],
    serviceOptions = [],
    allDocuments = [],
    docTypeOptions = [],
    currencyCodeById = {},
    baseCurrencyCode = 'USD',
    exchangeRateMap = { HKD: 1 },
    showTotalPrice = true,
    showProductIcon = false,
  } = options;

  if (!quotation || !quotation?.id) {
    throw new Error('Please select a quotation to print.');
  }

  const labels = getDocumentLabels(variant);

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
        showProductIcon,
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
    filePrefix: labels.filePrefix,
  });

  const totalLabel =
    toSafeString(summary?.baseCurrencyCode || baseCurrencyCode) || 'USD';
  const totalAmount = formatMoney(summary?.grandTotal);
  const totalAmountWithCurrency = `$${totalAmount}`;

  const quotationDateSource =
    quotation?.posting_at || quotation?.created_at || quotation?.updated_at;
  const createdDate =
    formatDateLabel(formatDateOnly(quotationDateSource)) || '-';
  const validTillDate = computeValidTillDate(quotationDateSource || Date.now());

  const rawQuotationNumber = toSafeString(quotation?.id) || '-';
  const downpaymentPercent = resolveDownpaymentPercent(
    quotation?.header_proforma_percent,
  );
  const downpaymentPercentLabel = formatPercentLabel(downpaymentPercent);
  const downpaymentAmount = formatMoney(
    Number(summary?.grandTotal || 0) * (downpaymentPercent / 100),
  );

  const invoiceDownpaymentSummary =
    variant === 'ar-invoice'
      ? computeInvoiceDownpaymentSummary({
          quotation,
          allDocuments,
          docTypeOptions,
          baseCurrencyCode,
          currencyCodeById,
          exchangeRateMap,
        })
      : {
          totalDownpayment: 0,
          downpaymentPercent: DEFAULT_DOWNPAYMENT_PERCENT,
          hasDownpayment: false,
        };

  const invoiceBalanceDueAmount = formatMoney(
    Number(summary?.grandTotal || 0) -
      Number(invoiceDownpaymentSummary.totalDownpayment || 0),
  );
  const invoiceDownpaymentPercentLabel = formatPercentLabel(
    invoiceDownpaymentSummary.downpaymentPercent,
  );

  const resolvedTermsLinesWithBalance = resolveTermsLines({
    labels,
    validTillDate,
    downpaymentPercentLabel:
      variant === 'ar-invoice'
        ? invoiceDownpaymentPercentLabel
        : downpaymentPercentLabel,
    balanceDueAmount:
      variant === 'ar-invoice' && invoiceDownpaymentSummary.hasDownpayment
        ? invoiceBalanceDueAmount
        : totalAmount,
    currencyLabel: totalLabel,
  });

  const paymentSummary =
    variant === 'ar-downpayment-invoice'
      ? {
          enabled: true,
          originalLabel: toSafeString(labels?.originalTotalLabel) || 'ORIGINAL',
          originalAmount: totalAmountWithCurrency,
          adjustmentLabel: '',
          adjustmentAmount: '',
          primaryLabel: `${downpaymentPercentLabel}% ${toSafeString(labels?.downpaymentAmountSuffix) || 'AMT.'}`,
          primaryAmount: `$${downpaymentAmount}`,
        }
      : variant === 'ar-invoice' && invoiceDownpaymentSummary.hasDownpayment
        ? {
            enabled: true,
            originalLabel:
              toSafeString(labels?.originalTotalLabel) || 'ORIGINAL TOTAL',
            originalAmount: totalAmountWithCurrency,
            adjustmentLabel: `${invoiceDownpaymentPercentLabel}% ${toSafeString(labels?.downpaymentAmountSuffix) || 'AMOUNT'}`,
            adjustmentAmount: `-$${formatMoney(
              invoiceDownpaymentSummary.totalDownpayment,
            )}`,
            primaryLabel: `${toSafeString(labels?.balanceDueLabel) || 'Balance Due'} (${totalLabel})`,
            primaryAmount: `$${invoiceBalanceDueAmount}`,
          }
        : {
            enabled: false,
          };
  const effectiveShowTotalPrice =
    labels?.showTotalPrice === false ? false : showTotalPrice;

  return {
    logoUrl: resolvedCompanyInfo.logoUrl,
    documentType: labels.documentType,
    labels: {
      ...labels,
      termsLines: resolvedTermsLinesWithBalance,
    },
    companyName: resolvedCompanyInfo.companyName,
    companyAddress: resolvedCompanyInfo.companyAddress,
    contactPerson: resolvedCompanyInfo.contactPerson,
    customerName,
    customerAddress: pickAddressLine(customerAddress),
    quotationNumber: rawQuotationNumber.slice(0, 8).toUpperCase(),
    createdDate,
    validTillDate,
    lineItems,
    baseCurrencyCode,
    totalLabel,
    totalAmount,
    paymentSummary,
    showTotalPrice: effectiveShowTotalPrice,
    documentTitle,
  };
};

export const buildQuotationPreviewMarkup = (options = {}) => {
  const view = buildQuotationViewData(options);

  return renderToStaticMarkup(<QuotationPreviewPage {...view} />);
};

/**
 * Document-level CSS that cannot live inside the CSS module because it targets
 * the document shell (`@page`, `html`, `body`) rather than a component. Values
 * come from A4_LAYOUT so preview and printout share the same geometry.
 */
const buildDocumentShellCss = () => `
  @page {
    size: A4 portrait;
    margin: 0;
  }

  html,
  body {
    width: ${A4_LAYOUT.widthMm}mm;
    min-height: ${A4_LAYOUT.heightMm}mm;
  }

  body {
    margin: 0;
    background: #ffffff;
  }

  @media screen {
    html,
    body {
      width: 100%;
      min-height: 100%;
    }

    body {
      background: #f3f4f6;
      padding: 24px;
    }
  }
`;

/**
 * Builds the standalone HTML document used for both the in-app preview iframe
 * and the A4 printout. `previewCss` is the compiled quotationPreview.module.css
 * (same hashed class names as the `styles` map), so the two stay identical.
 */
export const buildQuotationDocumentHtml = ({
  variant = 'quotation',
  ...options
} = {}) => {
  const view = buildQuotationViewData({ ...options, variant });
  const markup = renderToStaticMarkup(<QuotationPreviewPage {...view} />);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
      rel="stylesheet"
    />
    <title>${escapeHtml(view.documentTitle)}</title>
    <style>${buildDocumentShellCss()}</style>
    <style>${previewCss}</style>
  </head>
  <body>
    ${markup}
  </body>
</html>
`;
};
