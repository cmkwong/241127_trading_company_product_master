/**
 * Resolve which product `product_images` rows feed the catalog row's
 * "Additional images" strip. The strip is driven by the "Edited - catalog"
 * image type (mirrors `CATALOG_IMAGE_TYPE_NAME` on the server), so we filter
 * to that type and order by `image_row` then `display_order`.
 */

export const MAX_CATALOG_ROW_IMAGES = 3;

export const CATALOG_IMAGE_TYPE_NAME = 'Edited - catalog';

const normalizeName = (value = '') => String(value || '').trim().toLowerCase();

const toOrder = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

/**
 * Resolve the id of the "Edited - catalog" image type from the flat master
 * image-type list (id, name). Matched by normalized name so a master-data
 * rename still resolves. Returns '' when unresolved.
 */
export const resolveCatalogImageTypeId = (imageTypes = []) => {
  const target = normalizeName(CATALOG_IMAGE_TYPE_NAME);
  const list = Array.isArray(imageTypes) ? imageTypes : [];
  const match = list.find(
    (type) => normalizeName(type?.name) === target && type?.id,
  );
  return match ? String(match.id).trim() : '';
};

/**
 * @param {Object} params
 * @param {Array}  [params.productImages]  Product's `product_images` rows.
 * @param {string} [params.catalogTypeId]  Resolved "Edited - catalog" type id.
 * @returns {Array<{id, image_url, image_name, image_row, display_order}>}
 */
export const resolveEditedCatalogImages = ({
  productImages = [],
  catalogTypeId = '',
} = {}) => {
  const typeId = String(catalogTypeId || '').trim();
  const images = Array.isArray(productImages) ? productImages : [];

  return images
    .filter((img) => img && !img._delete)
    .filter((img) => String(img?.image_type_id || '').trim() === typeId)
    .sort((a, b) => {
      const rowDiff = toOrder(a?.image_row) - toOrder(b?.image_row);
      if (rowDiff !== 0) return rowDiff;
      return toOrder(a?.display_order) - toOrder(b?.display_order);
    })
    .map((img) => ({
      id: String(img.id || '').trim(),
      image_url: String(img.image_url || '').trim(),
      image_name: String(img.image_name || '').trim(),
      image_row: img.image_row,
      display_order: img.display_order,
    }));
};
