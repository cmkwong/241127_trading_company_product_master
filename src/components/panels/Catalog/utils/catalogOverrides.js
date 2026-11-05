// Pure helper that applies a catalog's per-row overrides (image + attribute
// selection) over the product bundle returned by `getCatalogDataByIds`, and
// returns the products in the catalog's display order. No React / no DOM here;
// `CatalogPrintPreviewModal.jsx` consumes this before `buildCatalogRows`.

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
 *   `catalog_product_row_images` and `catalog_product_row_attribute_displays`.
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

      const rowImages = sortRows(activeRows(row?.catalog_product_row_images));
      const imageUrls = rowImages
        .map((img) => toTrimmed(img?.image_url))
        .filter(Boolean);

      // Main image: explicit row override wins, then the first row image,
      // then the product's own icon (unchanged).
      const explicitMain = toTrimmed(row?.image_url);
      if (explicitMain) {
        copy.icon_url = explicitMain;
      } else if (imageUrls.length > 0) {
        copy.icon_url = imageUrls[0];
      }

      // Thumbnail strip: replaced by the ordered row images when present.
      if (imageUrls.length > 0) {
        copy.product_images = imageUrls.map((url, index) => ({
          image_url: url,
          image_row: 1,
          display_order: index + 1,
        }));
      }

      // Attribute filter: keep only the attributes selected for this row.
      const attributeDisplays = activeRows(
        row?.catalog_product_row_attribute_displays,
      );
      if (attributeDisplays.length > 0) {
        const allowed = new Set(
          attributeDisplays.map((d) => toTrimmed(d?.attribute_id)).filter(Boolean),
        );
        copy.product_attribute_values = activeRows(
          product?.product_attribute_values,
        ).filter((av) => allowed.has(toTrimmed(av?.attribute_id)));
      }

      return copy;
    })
    .filter(Boolean);
};
