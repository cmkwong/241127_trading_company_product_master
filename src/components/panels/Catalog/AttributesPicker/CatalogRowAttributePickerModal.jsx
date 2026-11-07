import { useEffect, useMemo, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMasterContext } from '../../../../store/MasterContext';
import { useAuthContext } from '../../../../store/AuthContext';
import Main_Modal from '../../../../components/common/Modal/Main_Modal';
import Main_Checkbox from '../../../../components/common/InputOptions/Checkbox/Main_Checkbox';
import Sub_AttributeSingleField from '../../../../components/panels/ProductMaster/Attributes/Sub_AttributeSingleField';
import Sub_AttributeTagField from '../../../../components/panels/ProductMaster/Attributes/Sub_AttributeTagField';
import {
  normalize,
  keyOf,
} from '../../../../components/panels/ProductMaster/Attributes/attributeUtils';
import {
  normalizeStructuredTableResponse,
  buildNestedChangedData,
} from '../../../../utils/contextDataUtils';
import { apiPost, apiPatch, apiDelete } from '../../../../utils/crud';
import styles from './CatalogRowAttributePickerModal.module.css';

const toTrimmed = (value) => String(value || '').trim();

const PRODUCTS_GET_IDS_URL =
  'http://localhost:3001/api/v1/trade_business/panel/products/data/get/ids';
const PRODUCTS_IDS_URL =
  'http://localhost:3001/api/v1/trade_business/panel/products/data/ids';

/**
 * Category-filtered attribute editor for a single catalog product row.
 *
 * Mirrors Main_ProductAttributes: resolve the product's categories against
 * master_product_category_attribute_assign and offer those attributes (deduped,
 * in assignment order). Each row keeps a "display in catalog" checkbox (writes
 * catalog_product_row_attribute_displays) plus an editable value field that
 * follows Product Master field types (tag multi-select, or suggest/free-text).
 * Value edits are staged locally and written to product_attribute_values only
 * when the user clicks "Update Product".
 */
const CatalogRowAttributePickerModal = ({
  row,
  product,
  onClose,
  onToggleAttribute,
}) => {
  const { getMasterTableData } = useMasterContext();
  const { token } = useAuthContext();

  const productId = toTrimmed(product?.id);

  const categoryAssigns = useMemo(
    () => getMasterTableData('master_product_category_attribute_assign') || [],
    [getMasterTableData],
  );
  const masterAttributes = useMemo(
    () => getMasterTableData('master_product_attributes') || [],
    [getMasterTableData],
  );
  const attributeDropdowns = useMemo(
    () => getMasterTableData('master_product_attribute_dropdown') || [],
    [getMasterTableData],
  );

  const attributeById = useMemo(() => {
    const map = new Map();
    masterAttributes.forEach((attr) => {
      const id = toTrimmed(attr?.id);
      if (id) map.set(id, attr);
    });
    return map;
  }, [masterAttributes]);

  const selectedCategoryIds = useMemo(() => {
    const categories = Array.isArray(product?.product_categories)
      ? product.product_categories
      : [];
    return categories
      .map((relation) => toTrimmed(relation?.category_id))
      .filter(Boolean);
  }, [product]);

  const attributeRows = useMemo(() => {
    const selected = new Set(selectedCategoryIds);
    const seen = new Set();
    const ids = [];
    categoryAssigns.forEach((assign) => {
      if (!selected.has(toTrimmed(assign?.category_id))) return;
      const attributeId = toTrimmed(assign?.attribute_id);
      if (!attributeId || seen.has(attributeId)) return;
      seen.add(attributeId);
      ids.push(attributeId);
    });
    return ids.map((id) => attributeById.get(id)).filter(Boolean);
  }, [categoryAssigns, selectedCategoryIds, attributeById]);

  const managedAttributeIds = useMemo(
    () => attributeRows.map((attr) => toTrimmed(attr?.id)).filter(Boolean),
    [attributeRows],
  );

  const selectedIds = useMemo(() => {
    const set = new Set();
    const displays = Array.isArray(row?.catalog_product_row_attribute_displays)
      ? row.catalog_product_row_attribute_displays
      : [];
    displays.forEach((display) => {
      const id = toTrimmed(display?.attribute_id);
      if (id && display?._delete !== true) set.add(id);
    });
    return set;
  }, [row]);

  const [originalByAttr, setOriginalByAttr] = useState(new Map());
  const [draftByAttr, setDraftByAttr] = useState(new Map());
  const [loading, setLoading] = useState(Boolean(productId));
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Auto-dismiss the success message after 3 seconds.
  useEffect(() => {
    if (!saved) return undefined;
    const timer = window.setTimeout(() => setSaved(false), 3000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const loadValues = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const response = await apiPost(
        PRODUCTS_GET_IDS_URL,
        {
          includeBase64: false,
          fields: {
            products: ['id'],
            product_attribute_values: [
              'id',
              'product_id',
              'attribute_id',
              'value',
            ],
          },
          data: { products: [{ id: productId }] },
        },
        { token },
      );

      const data = normalizeStructuredTableResponse(response, 'products');
      const products = Array.isArray(data?.products) ? data.products : [];
      const matched =
        products.find((p) => toTrimmed(p?.id) === productId) || products[0];
      const values = Array.isArray(matched?.product_attribute_values)
        ? matched.product_attribute_values
        : [];

      const original = new Map();
      values.forEach((av) => {
        const attrId = toTrimmed(av?.attribute_id);
        const value = normalize(av?.value);
        if (!attrId || !value) return;
        if (!original.has(attrId)) original.set(attrId, []);
        original.get(attrId).push({
          id: av?.id,
          product_id: av?.product_id,
          attribute_id: attrId,
          value,
        });
      });
      setOriginalByAttr(original);

      const draft = new Map();
      original.forEach((rows, attrId) => {
        draft.set(
          attrId,
          rows.map((r) => r.value),
        );
      });
      setDraftByAttr(draft);
    } catch (err) {
      console.error('Failed to load product attribute values', err);
      setLoadError(err?.message || 'Failed to load product attributes');
    } finally {
      setLoading(false);
    }
  }, [productId, token]);

  useEffect(() => {
    loadValues();
  }, [loadValues]);

  const persistSingle = useCallback((attributeId, rawValue) => {
    const cleaned = normalize(rawValue);
    setSaved(false);
    setSaveError(null);
    setDraftByAttr((prev) => {
      const next = new Map(prev);
      if (cleaned) next.set(attributeId, [cleaned]);
      else next.delete(attributeId);
      return next;
    });
  }, []);

  const persistMulti = useCallback((attributeId, rawValues) => {
    setSaved(false);
    setSaveError(null);
    const seen = new Map();
    (Array.isArray(rawValues) ? rawValues : []).forEach((raw) => {
      const value = normalize(raw);
      if (!value) return;
      const k = keyOf(value);
      if (!seen.has(k)) seen.set(k, value);
    });
    const nextValues = Array.from(seen.values());
    setDraftByAttr((prev) => {
      const next = new Map(prev);
      if (nextValues.length > 0) next.set(attributeId, nextValues);
      else next.delete(attributeId);
      return next;
    });
  }, []);

  const buildOptions = useCallback(
    (attribute) => {
      const dropdownRows = (attributeDropdowns || []).filter(
        (row) => row?.attribute_id === attribute.id,
      );
      const referenceRows = attribute.dropdown_reference
        ? getMasterTableData(attribute.dropdown_reference) || []
        : [];
      const existingValues = draftByAttr.get(attribute.id) || [];

      const seen = new Set();
      const result = [];
      const push = (rawName) => {
        const name = normalize(rawName);
        if (!name) return;
        const id = keyOf(name);
        if (seen.has(id)) return;
        seen.add(id);
        result.push({ id, name });
      };

      dropdownRows.forEach((row) => push(row?.value));
      referenceRows.forEach((row) => push(row?.name ?? row?.value));
      existingValues.forEach((value) => push(value));

      return result;
    },
    [attributeDropdowns, getMasterTableData, draftByAttr],
  );

  const isDirty = useMemo(() => {
    for (const attrId of managedAttributeIds) {
      const original = (originalByAttr.get(attrId) || [])
        .map((row) => keyOf(row.value))
        .sort();
      const draft = (draftByAttr.get(attrId) || []).map(keyOf).sort();
      if (original.join('\u0000') !== draft.join('\u0000')) return true;
    }
    return false;
  }, [managedAttributeIds, originalByAttr, draftByAttr]);

  const handleUpdateProduct = useCallback(async () => {
    if (!productId || saving) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const draftRows = [];
      managedAttributeIds.forEach((attrId) => {
        const originalRows = originalByAttr.get(attrId) || [];
        const draftValues = draftByAttr.get(attrId) || [];
        const usedIds = new Set();
        draftValues.forEach((value) => {
          const key = keyOf(value);
          const existing = originalRows.find(
            (row) => keyOf(row.value) === key && !usedIds.has(row.id),
          );
          if (existing) {
            usedIds.add(existing.id);
            draftRows.push({
              id: existing.id,
              product_id: productId,
              attribute_id: attrId,
              value,
            });
          } else {
            draftRows.push({
              id: uuidv4(),
              product_id: productId,
              attribute_id: attrId,
              value,
            });
          }
        });
      });

      const originalRows = managedAttributeIds.flatMap(
        (attrId) => originalByAttr.get(attrId) || [],
      );

      const result = buildNestedChangedData({
        pageData: {
          id: productId,
          product_attribute_values: draftRows,
        },
        originalPageData: {
          id: productId,
          product_attribute_values: originalRows,
        },
        comparisonKeys: ['product_attribute_values'],
        rootTableName: 'products',
        base64Config: {},
        replaceTables: [],
      });

      if (result) {
        if (result.deletions) {
          await apiDelete(PRODUCTS_IDS_URL, {
            token,
            body: { data: result.deletions },
          });
        }
        if (result.changes) {
          await apiPatch(PRODUCTS_IDS_URL, { data: result.changes }, { token });
        }
      }

      const nextOriginal = new Map();
      managedAttributeIds.forEach((attrId) => {
        const draftValues = draftByAttr.get(attrId) || [];
        if (draftValues.length === 0) return;
        nextOriginal.set(
          attrId,
          draftValues.map((value) => {
            const matched = draftRows.find(
              (row) =>
                row.attribute_id === attrId &&
                keyOf(row.value) === keyOf(value),
            );
            return {
              id: matched?.id,
              product_id: productId,
              attribute_id: attrId,
              value,
            };
          }),
        );
      });
      setOriginalByAttr(nextOriginal);
      setSaved(true);
    } catch (err) {
      console.error('Failed to update product attributes', err);
      setSaveError(err?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  }, [
    productId,
    saving,
    managedAttributeIds,
    originalByAttr,
    draftByAttr,
    token,
  ]);

  return (
    <Main_Modal
      title="Product Attributes"
      onClose={onClose}
      size="lg"
      height="min(80vh, 720px)"
      zIndex={2300}
      bodyScrollable={false}
      footerMessage={
        saved ? (
          <span className={styles.saved}>Product attributes updated.</span>
        ) : null
      }
      footer={
        <>
          <span className={styles.count}>{selectedIds.size} displayed</span>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleUpdateProduct}
              disabled={!isDirty || saving || !productId}
            >
              {saving ? 'Updating…' : 'Update Product'}
            </button>
          </div>
        </>
      }
    >
      {!productId ? (
        <span className={styles.muted}>This row has no linked product.</span>
      ) : loading ? (
        <span className={styles.muted}>Loading product attributes…</span>
      ) : loadError ? (
        <span className={styles.muted}>{loadError}</span>
      ) : attributeRows.length === 0 ? (
        <span className={styles.muted}>
          No attributes configured for this product&apos;s category.
        </span>
      ) : (
        <div className={styles.list}>
          {saveError && <span className={styles.error}>{saveError}</span>}
          {attributeRows.map((attr) => {
            const id = toTrimmed(attr?.id);
            const label = toTrimmed(attr?.label || attr?.name) || id;
            const multiple =
              attr?.multiple_selection === 1 ||
              attr?.multiple_selection === true;
            const options = buildOptions(attr);
            const existingValues = draftByAttr.get(id) || [];
            const existingKeys = existingValues.map(keyOf);

            return (
              <div key={id} className={styles.attrRow}>
                <Main_Checkbox
                  checked={selectedIds.has(id)}
                  onChange={() => onToggleAttribute(id)}
                  label={label}
                  size="M"
                />
                <div className={styles.fieldControl}>
                  {multiple ? (
                    <Sub_AttributeTagField
                      attributeId={id}
                      options={options}
                      values={existingKeys}
                      onSave={persistMulti}
                    />
                  ) : (
                    <Sub_AttributeSingleField
                      attributeId={id}
                      options={options}
                      value={existingValues[0] || ''}
                      onSave={persistSingle}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Main_Modal>
  );
};

export default CatalogRowAttributePickerModal;
