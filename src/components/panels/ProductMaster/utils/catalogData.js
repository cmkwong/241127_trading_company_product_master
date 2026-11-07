// Pure helpers that turn full product records (as returned by
// `getProductsByIds`) into the rows rendered by the Product Catalog A4
// printout. No React / no DOM here — `CatalogPreview.jsx` consumes these.

import { formatRateMoney } from '../../../../utils/money';
import { resolveDisplayFileUrl } from '../../../../utils/filePickerUtils';

const MAX_ATTRIBUTE_ROWS = 4;
const MAX_IMAGE_THUMBS = 3;
const MAX_PRICE_ROWS = 4;

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toTrimmedString = (value) => String(value || '').trim();

const flagIsOn = (value) =>
  value === true || value === 1 || value === '1' || value === 'true';

/**
 * Resolve the attribute_ids that should be pre-selected ("display in catalog")
 * for a product, from master_product_attributes.catalog_default_display,
 * limited to attributes assigned to the product's categories.
 *
 * Used when a product is first added to a catalog so the defaults are staged in
 * the client row state; catalog_product_row_attribute_displays rows are only
 * written to the database when the user clicks Save Catalog.
 */
export const getDefaultDisplayAttributeIds = (
  product,
  categoryAssigns = [],
  attributes = [],
) => {
  const categoryIds = new Set(
    (Array.isArray(product?.product_categories)
      ? product.product_categories
      : []
    )
      .map((rel) => toTrimmedString(rel?.category_id))
      .filter(Boolean),
  );
  if (categoryIds.size === 0) return [];

  const defaultAttributeIds = new Set(
    (Array.isArray(attributes) ? attributes : [])
      .filter((attr) => flagIsOn(attr?.catalog_default_display))
      .map((attr) => toTrimmedString(attr?.id))
      .filter(Boolean),
  );
  if (defaultAttributeIds.size === 0) return [];

  const result = [];
  const seen = new Set();
  (Array.isArray(categoryAssigns) ? categoryAssigns : []).forEach((assign) => {
    const categoryId = toTrimmedString(assign?.category_id);
    const attributeId = toTrimmedString(assign?.attribute_id);
    if (!categoryId || !attributeId) return;
    if (!categoryIds.has(categoryId)) return;
    if (!defaultAttributeIds.has(attributeId)) return;
    if (seen.has(attributeId)) return;
    seen.add(attributeId);
    result.push(attributeId);
  });
  return result;
};

/** Drop rows flagged for deletion by the product editor. */
const activeRows = (rows) =>
  (Array.isArray(rows) ? rows : []).filter((row) => !row?._delete);

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
    const aOrderVal = Number.isFinite(aOrder)
      ? aOrder
      : Number.MAX_SAFE_INTEGER;
    const bOrderVal = Number.isFinite(bOrder)
      ? bOrder
      : Number.MAX_SAFE_INTEGER;
    return aOrderVal - bOrderVal;
  });
};

const getMainImageUrl = (product) =>
  resolveDisplayFileUrl(product?.icon_url);

const getThumbImageUrls = (product) => {
  const images = sortImages(product?.product_images);
  return images
    .slice(0, MAX_IMAGE_THUMBS)
    .map((img) => resolveDisplayFileUrl(img?.image_url))
    .filter(Boolean);
};

/** "suitable_pet" -> "Suitable Pet"; leaves already-formatted labels untouched. */
const humanizeKey = (value) =>
  toTrimmedString(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b[a-z]/g, (ch) => ch.toUpperCase());

/**
 * Attribute bullets: one per attribute, e.g. "Name: value1, value2".
 * Multiple values for the same attribute are concatenated with ", " and the
 * list is capped at MAX_ATTRIBUTE_ROWS attributes (the A4 space budget).
 */
const getAttributes = (product, masterDataMap) => {
  const attributeMaster = masterDataMap?.master_product_attributes || [];
  const labelById = new Map();
  attributeMaster.forEach((attr) => {
    const id = toTrimmedString(attr?.id);
    if (id) {
      // Mirror the product editor (Main_ProductAttributes): prefer `label`,
      // fall back to `name`. Humanize so slug-style names read nicely.
      labelById.set(
        id,
        humanizeKey(toTrimmedString(attr?.label || attr?.name)) || id,
      );
    }
  });

  // Group values by attribute, preserving first-appearance order.
  const order = [];
  const valuesByAttributeId = new Map();
  activeRows(product?.product_attribute_values).forEach((row) => {
    const attributeId = toTrimmedString(row?.attribute_id);
    const value = toTrimmedString(row?.value);
    if (!attributeId || !value) {
      return;
    }
    if (!valuesByAttributeId.has(attributeId)) {
      valuesByAttributeId.set(attributeId, []);
      order.push(attributeId);
    }
    valuesByAttributeId.get(attributeId).push(value);
  });

  const result = [];
  order.forEach((attributeId) => {
    if (result.length >= MAX_ATTRIBUTE_ROWS) {
      return;
    }
    const values = valuesByAttributeId.get(attributeId) || [];
    const label = labelById.get(attributeId) || '';
    const joined = values.join(', ');
    result.push(label ? `${label}: ${joined}` : joined);
  });
  return result;
};

/** Currency symbol for the catalog's active base currency. */
const resolveCurrencySymbol = (currencies, baseCurrency) => {
  const code = toTrimmedString(baseCurrency).toUpperCase();
  if (!code) {
    return '';
  }
  const match = (Array.isArray(currencies) ? currencies : []).find(
    (currency) => toTrimmedString(currency?.code).toUpperCase() === code,
  );
  return toTrimmedString(match?.symbol) || code;
};

/** Catalog price text: currency symbol + 3 decimals (e.g. `$2.321`). */
const formatCatalogPrice = (value, symbol) =>
  `${symbol}${formatRateMoney(value)}`;

/** `$min - $max`, or a single price when max is null/equal to min. */
const formatCatalogPriceRange = (min, max, symbol) => {
  const minText = formatCatalogPrice(min, symbol);
  if (max === null || max === undefined || max === min) {
    return minText;
  }
  return `${minText} - ${formatCatalogPrice(max, symbol)}`;
};

/**
 * Price cell content, keyed off products.selling_by_mode.
 * Returns { mode, rows: [{ label, value }] }.
 *   by_qty          -> tier ranges (50 ~ 99, 100+)
 *   by_single_price -> single MOQ line, price range
 *   by_variants     -> single price range across variant costs
 */
const buildPriceCell = (product, currencySymbol) => {
  const mode = toTrimmedString(product?.selling_by_mode) || 'by_qty';
  const empty = { mode, rows: [] };

  if (mode === 'by_qty') {
    const tiers = activeRows(product?.product_sale_prices_by_qty)
      .map((tier) => ({
        minOrderQty: toNumberOrNull(tier?.min_order_qty),
        salePrice: toNumberOrNull(tier?.sale_price),
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
      return {
        label,
        value: formatCatalogPrice(tier.salePrice, currencySymbol),
      };
    });

    return { mode, rows };
  }

  if (mode === 'by_single_price') {
    const min = toNumberOrNull(product?.sale_single_price_min);
    const max = toNumberOrNull(product?.sale_single_price_max);
    const moq = toNumberOrNull(product?.min_order_qty);

    if (min === null) {
      return empty;
    }

    const value = formatCatalogPriceRange(min, max, currencySymbol);
    const label = moq !== null && moq > 0 ? `${moq} pcs` : '';

    return { mode, rows: [{ label, value }] };
  }

  // by_variants
  const prices = activeRows(product?.product_costs)
    .map((cost) => toNumberOrNull(cost?.sales_price))
    .filter((price) => price !== null);

  if (prices.length === 0) {
    return empty;
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    mode,
    rows: [
      { label: '', value: formatCatalogPriceRange(min, max, currencySymbol) },
    ],
  };
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

/** Distinct, non-empty variant type ids in selection (child-row) order. */
const getVariantTypeIds = (rows, field) => {
  const seen = new Set();
  const result = [];
  activeRows(rows).forEach((row) => {
    const id = toTrimmedString(row?.[field]);
    if (id && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  });
  return result;
};

/** Label for a capacity type: named value, otherwise `{value} {unit}`. */
const getCapacityLabel = (item) => {
  if (!item) {
    return '';
  }
  const name = toTrimmedString(item.name);
  if (name) {
    return name;
  }
  const value = toTrimmedString(item.value);
  const unit = toTrimmedString(item.unit);
  return `${value} ${unit}`.trim();
};

/**
 * Resolve the product's color / size / capacity variant display values from
 * the dedicated variation tables and the master type tables carried on the
 * catalog bundle's `masterDataMap`. Returns comma-joined labels per axis
 * (empty string when the product has none of that variant type).
 */
const buildVariants = (product, masterDataMap) => {
  const colorById = new Map(
    (masterDataMap?.master_color_types || []).map((item) => [
      toTrimmedString(item?.id),
      item,
    ]),
  );
  const sizeById = new Map(
    (masterDataMap?.master_size_types || []).map((item) => [
      toTrimmedString(item?.id),
      item,
    ]),
  );
  const capacityById = new Map(
    (masterDataMap?.master_capacity_types || []).map((item) => [
      toTrimmedString(item?.id),
      item,
    ]),
  );

  const colors = getVariantTypeIds(product?.product_varient_colors, 'color_type_id')
    .map((id) => toTrimmedString(colorById.get(id)?.name))
    .filter(Boolean);
  const sizes = getVariantTypeIds(product?.product_varient_sizes, 'size_type_id')
    .map((id) => sizeById.get(id))
    .filter(Boolean)
    .sort((a, b) => {
      const aOrder = Number(a?.display_order);
      const bOrder = Number(b?.display_order);
      const aVal = Number.isFinite(aOrder) ? aOrder : Number.MAX_SAFE_INTEGER;
      const bVal = Number.isFinite(bOrder) ? bOrder : Number.MAX_SAFE_INTEGER;
      return aVal - bVal;
    })
    .map((item) => toTrimmedString(item?.name))
    .filter(Boolean);
  const capacities = getVariantTypeIds(
    product?.product_varient_capacities,
    'capacity_type_id',
  )
    .map((id) => getCapacityLabel(capacityById.get(id)))
    .filter(Boolean);

  return {
    color: colors.join(', '),
    size: sizes.join(', '),
    capacity: capacities.join(', '),
  };
};

/**
 * Normalize backend catalog bundle payload to keep builder calls resilient.
 */
export const normalizeCatalogBundle = (payload = {}) => {
  const source = payload && typeof payload === 'object' ? payload : {};

  return {
    products: Array.isArray(source.products) ? source.products : [],
    currencies: Array.isArray(source.currencies) ? source.currencies : [],
    baseCurrency: toTrimmedString(source.baseCurrency) || 'USD',
    date: toTrimmedString(source.date),
    catalogImageType:
      source.catalogImageType && typeof source.catalogImageType === 'object'
        ? source.catalogImageType
        : null,
    masterDataMap:
      source.masterDataMap && typeof source.masterDataMap === 'object'
        ? source.masterDataMap
        : {
            master_product_attributes: [],
            master_color_types: [],
            master_size_types: [],
            master_capacity_types: [],
          },
  };
};

export const buildCatalogRow = (
  product,
  { masterDataMap, currencies, baseCurrency } = {},
) => {
  const currencySymbol = resolveCurrencySymbol(currencies, baseCurrency);
  const priceCell = buildPriceCell(product, currencySymbol);

  return {
    id: toTrimmedString(product?.id),
    name: getProductName(product),
    sku: buildSkuLabel(getSkus(product)),
    mainImageUrl: getMainImageUrl(product),
    thumbImageUrls: getThumbImageUrls(product),
    attributes: getAttributes(product, masterDataMap),
    variants: buildVariants(product, masterDataMap),
    priceRows: priceCell.rows,
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
