// Pure helpers that turn full product records (as returned by
// `getProductsByIds`) into the rows rendered by the Product Catalog A4
// printout. No React / no DOM here — `catalogPreview.jsx` consumes these.

import { formatMoney } from '../../../../utils/money';
import {
  buildCurrencyCodeById,
  buildNormalizedCurrencies,
} from '../../SalesQuotation/utils/quotationTotals';

const MAX_ATTRIBUTE_ROWS = 4;
const MAX_IMAGE_THUMBS = 4;
const MAX_PRICE_ROWS = 4;
const MAX_STYLE_ROWS = 4;

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toTrimmedString = (value) => String(value || '').trim();

/** Drop rows flagged for deletion by the product editor. */
const activeRows = (rows) =>
  (Array.isArray(rows) ? rows : []).filter((row) => !row?._delete);

/** Build a { id: code } map from the MasterContext currencies list. */
const buildCurrencyCodeMap = (currencies) =>
  buildCurrencyCodeById(buildNormalizedCurrencies(currencies));

const firstNonEmptyName = (row) =>
  toTrimmedString(row?.name || row?.value || row?.label);

/**
 * Mirror of ProductSidebar.extractFirstProductName: prefer the
 * display_order === 1 row, then the first non-empty name in display order.
 */
const getProductName = (product) => {
  const names = product?.product_names;
  if (typeof names === 'string') {
    return toTrimmedString(names);
  }
  if (!Array.isArray(names) || names.length === 0) {
    return '';
  }

  const rows = activeRows(names);
  if (rows.length === 0) {
    return '';
  }

  const orderOne = rows.find((row) => {
    const order = Number(row?.display_order);
    return Number.isFinite(order) && order === 1;
  });
  const orderOneName = firstNonEmptyName(orderOne);
  if (orderOneName) {
    return orderOneName;
  }

  const sorted = [...rows].sort((a, b) => {
    const aOrder = Number(a?.display_order);
    const bOrder = Number(b?.display_order);
    const aVal = Number.isFinite(aOrder) ? aOrder : Number.MAX_SAFE_INTEGER;
    const bVal = Number.isFinite(bOrder) ? bOrder : Number.MAX_SAFE_INTEGER;
    return aVal - bVal;
  });
  for (const row of sorted) {
    const name = firstNonEmptyName(row);
    if (name) {
      return name;
    }
  }
  return '';
};

/** Distinct, non-empty SKUs across product_costs. */
const getSkus = (product) => {
  const seen = new Set();
  const result = [];
  activeRows(product?.product_costs).forEach((cost) => {
    const sku = toTrimmedString(cost?.sku);
    if (sku && !seen.has(sku)) {
      seen.add(sku);
      result.push(sku);
    }
  });
  return result;
};

const sortImages = (images) => {
  return activeRows(images).sort((a, b) => {
    const aRow = Number(a?.image_row);
    const bRow = Number(b?.image_row);
    const aRowVal = Number.isFinite(aRow) ? aRow : Number.MAX_SAFE_INTEGER;
    const bRowVal = Number.isFinite(bRow) ? bRow : Number.MAX_SAFE_INTEGER;
    if (aRowVal !== bRowVal) {
      return aRowVal - bRowVal;
    }
    const aOrder = Number(a?.display_order);
    const bOrder = Number(b?.display_order);
    const aOrderVal = Number.isFinite(aOrder) ? aOrder : Number.MAX_SAFE_INTEGER;
    const bOrderVal = Number.isFinite(bOrder) ? bOrder : Number.MAX_SAFE_INTEGER;
    return aOrderVal - bOrderVal;
  });
};

const getMainImageUrl = (product) => {
  const images = sortImages(product?.product_images);
  const main = images[0];
  return toTrimmedString(main?.image_url);
};

const getThumbImageUrls = (product) => {
  const images = sortImages(product?.product_images);
  return images
    .slice(1, 1 + MAX_IMAGE_THUMBS)
    .map((img) => toTrimmedString(img?.image_url))
    .filter(Boolean);
};

/** Attribute label/value bullets: "Name: value", capped at MAX_ATTRIBUTE_ROWS. */
const getAttributes = (product, masterDataMap) => {
  const attributeMaster = masterDataMap?.master_product_attributes || [];
  const nameById = new Map();
  attributeMaster.forEach((attr) => {
    const id = toTrimmedString(attr?.id);
    if (id) {
      nameById.set(id, toTrimmedString(attr?.name || attr?.label) || id);
    }
  });

  const result = [];
  activeRows(product?.product_attribute_values).forEach((row) => {
    if (result.length >= MAX_ATTRIBUTE_ROWS) {
      return;
    }
    const value = toTrimmedString(row?.value);
    if (!value) {
      return;
    }
    const label = nameById.get(toTrimmedString(row?.attribute_id)) || '';
    result.push(label ? `${label}: ${value}` : value);
  });
  return result;
};

/**
 * Price cell content, keyed off products.selling_by_mode.
 * Returns { mode, rows: [{ label, value }], basePrice, baseCode }.
 *   by_qty          -> tier ranges (50 ~ 99, 100+)
 *   by_single_price -> single MOQ line, min ~ max
 *   by_variants     -> grouped price points with variant counts
 */
const buildPriceCell = (product, currencyCodeMap) => {
  const mode = toTrimmedString(product?.selling_by_mode) || 'by_qty';
  const empty = { mode, rows: [], basePrice: null, baseCode: '' };

  if (mode === 'by_qty') {
    const tiers = activeRows(product?.product_sale_prices_by_qty)
      .map((tier) => ({
        minOrderQty: toNumberOrNull(tier?.min_order_qty),
        salePrice: toNumberOrNull(tier?.sale_price),
        code: currencyCodeMap[toTrimmedString(tier?.currency_id)] || '',
      }))
      .filter(
        (tier) =>
          tier.minOrderQty !== null &&
          tier.minOrderQty > 0 &&
          tier.salePrice !== null,
      )
      .sort((a, b) => a.minOrderQty - b.minOrderQty);

    if (tiers.length === 0) {
      return empty;
    }

    const rows = tiers.slice(0, MAX_PRICE_ROWS).map((tier, index) => {
      const isLast = index === tiers.length - 1;
      const nextMin = isLast ? null : tiers[index + 1].minOrderQty;
      const label = isLast
        ? `${tier.minOrderQty}+`
        : `${tier.minOrderQty} ~ ${nextMin - 1}`;
      const code = tier.code ? `${tier.code} ` : '';
      return { label, value: `${code}${formatMoney(tier.salePrice)}` };
    });

    const basePrice = Math.min(...tiers.map((tier) => tier.salePrice));
    return { mode, rows, basePrice, baseCode: tiers[0].code };
  }

  if (mode === 'by_single_price') {
    const min = toNumberOrNull(product?.sale_single_price_min);
    const max = toNumberOrNull(product?.sale_single_price_max);
    const code =
      currencyCodeMap[
        toTrimmedString(product?.sale_single_price_currency_id)
      ] || '';
    const moq = toNumberOrNull(product?.min_order_qty);

    if (min === null) {
      return empty;
    }

    const codePrefix = code ? `${code} ` : '';
    const showRange = max !== null && max !== min;
    const value = showRange
      ? `${codePrefix}${formatMoney(min)} ~ ${formatMoney(max)}`
      : `${codePrefix}${formatMoney(min)}`;
    const label = moq !== null && moq > 0 ? `${moq} pcs` : '';

    return { mode, rows: [{ label, value }], basePrice: min, baseCode: code };
  }

  // by_variants
  const costs = activeRows(product?.product_costs)
    .map((cost) => ({
      price: toNumberOrNull(cost?.sales_price),
      code: currencyCodeMap[toTrimmedString(cost?.sales_currency_id)] || '',
    }))
    .filter((cost) => cost.price !== null);

  if (costs.length === 0) {
    return empty;
  }

  const grouped = new Map();
  costs.forEach((cost) => {
    const key = `${cost.code}|${cost.price}`;
    if (!grouped.has(key)) {
      grouped.set(key, { price: cost.price, code: cost.code, count: 0 });
    }
    grouped.get(key).count += 1;
  });

  const rows = [...grouped.values()]
    .sort((a, b) => a.price - b.price)
    .slice(0, MAX_PRICE_ROWS)
    .map((group) => {
      const code = group.code ? `${group.code} ` : '';
      const label = group.count === 1 ? '1 var.' : `${group.count} var.`;
      return { label, value: `${code}${formatMoney(group.price)}` };
    });

  const basePrice = Math.min(...costs.map((cost) => cost.price));
  const minCost = costs.find((cost) => cost.price === basePrice);
  return { mode, rows, basePrice, baseCode: minCost?.code || '' };
};

/**
 * Style pricing: product_customizations with price_arise_per_pcs. When the
 * customization's currency matches the product's base currency, show the
 * total (base + arise); otherwise show the raw increment.
 */
const buildStyleCell = (product, currencyCodeMap, priceCell) => {
  const customizations = activeRows(product?.product_customizations);
  const basePrice = priceCell.basePrice;
  const baseCode = priceCell.baseCode;

  const rows = [];
  customizations.forEach((customization) => {
    if (rows.length >= MAX_STYLE_ROWS) {
      return;
    }
    const label = toTrimmedString(customization?.name);
    if (!label) {
      return;
    }
    const arise = toNumberOrNull(customization?.price_arise_per_pcs);
    const ariseCode =
      currencyCodeMap[toTrimmedString(customization?.price_arise_currency)] ||
      '';
    const ariseAmount = arise !== null ? arise : 0;

    let value = '';
    if (basePrice === null) {
      value =
        ariseAmount > 0
          ? `+${ariseCode ? `${ariseCode} ` : ''}${formatMoney(ariseAmount)}`
          : '';
    } else if (ariseCode && ariseCode !== baseCode) {
      value = `+${ariseCode} ${formatMoney(ariseAmount)}`;
    } else {
      value = `${baseCode ? `${baseCode} ` : ''}${formatMoney(basePrice + ariseAmount)}`;
    }

    rows.push({ label, value });
  });

  return rows;
};

const buildSkuLabel = (skus) => {
  if (skus.length === 0) {
    return '';
  }
  if (skus.length === 1) {
    return `SKU: ${skus[0]}`;
  }
  return `SKU: ${skus[0]} (+${skus.length - 1})`;
};

export const buildCatalogRow = (product, { currencies, masterDataMap } = {}) => {
  const currencyCodeMap = buildCurrencyCodeMap(currencies);
  const priceCell = buildPriceCell(product, currencyCodeMap);

  return {
    id: toTrimmedString(product?.id),
    name: getProductName(product),
    sku: buildSkuLabel(getSkus(product)),
    mainImageUrl: getMainImageUrl(product),
    thumbImageUrls: getThumbImageUrls(product),
    attributes: getAttributes(product, masterDataMap),
    priceMode: priceCell.mode,
    priceRows: priceCell.rows,
    styleRows: buildStyleCell(product, currencyCodeMap, priceCell),
  };
};

export const buildCatalogRows = (products = [], ctx = {}) =>
  (Array.isArray(products) ? products : []).map((product) =>
    buildCatalogRow(product, ctx),
  );

export const chunkRows = (rows = [], size = 10) => {
  const safeSize = size > 0 ? size : 10;
  const chunks = [];
  for (let index = 0; index < rows.length; index += safeSize) {
    chunks.push(rows.slice(index, index + safeSize));
  }
  return chunks;
};


