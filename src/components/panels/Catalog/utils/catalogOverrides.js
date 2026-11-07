// Pure helper that applies a catalog's per-row attribute selection over the
// product bundle returned by `getCatalogDataByIds`, and returns the products in
// the catalog's display order. No React / no DOM here;
// `CatalogPrintPreviewModal.jsx` consumes this before `buildCatalogRows`.
//
// The row's main image is the product's own `icon_url` (edited via the shared
// IconUpload in Product Master / Catalog), and the thumbnail strip is sourced
// live from the product's `product_images` ("Edited - catalog"), so there is no
// per-row image override here.

const toTrimmed = (value) => String(value || '').trim();

const activeRows = (rows) =>
  (Array.isArray(rows) ? rows : []).filter((row) => !row?._delete);

const sortRows = (rows) =>
  [...rows].sort((a, b) => {
    const aOrder = Number(a?.display_order);
    const bOrder = Number(b?.display_order);
    const aVal = Number.isFinite(aOrder) ? aOrder : Number.MAX_SAFE_INTEGER;
    const bVal = Number.isFinite(bOrder) ? bOrder : Number.MAX_SAFE_INTEGER;
    if (aVal !== bVal) return aVal - bVal;
    return String(a?.id || '').localeCompare(String(b?.id || ''));
  });

/**
 * @param {Array} products - product records from `getCatalogDataByIds`
 * @param {Array} catalogRows - `catalog_product_rows` with nested
 *   `catalog_product_row_attribute_displays`.
 * @returns {Array} products in catalog display order, with overrides applied.
 */
export const applyCatalogRowOverrides = (products = [], catalogRows = []) => {
  const productById = new Map(
    products.map((product) => [String(product?.id || '').trim(), product]),
  );

  const orderedRows = sortRows(activeRows(catalogRows));

  return orderedRows
    .map((row) => {
      const product = productById.get(String(row?.product_id || '').trim());
      if (!product) return null;

      const copy = { ...product };

      // Attribute filter: keep only the attributes selected for this row.
      // An empty selection intentionally prints no attribute bullets.
      const attributeDisplays = activeRows(
        row?.catalog_product_row_attribute_displays,
      );
      const allowed = new Set(
        attributeDisplays.map((d) => toTrimmed(d?.attribute_id)).filter(Boolean),
      );
      copy.product_attribute_values = activeRows(
        product?.product_attribute_values,
      ).filter((av) => allowed.has(toTrimmed(av?.attribute_id)));

      return copy;
    })
    .filter(Boolean);
};
