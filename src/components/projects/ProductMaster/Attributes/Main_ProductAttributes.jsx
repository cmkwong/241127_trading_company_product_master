import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import EmptyState from '../../../common/State/EmptyState';
import styles from './Main_ProductAttributes.module.css';

// Preserve the user's case (trim only) for the stored value.
const normalize = (value) => String(value ?? '').trim();

// Case-insensitive comparison/dedup key.
const keyOf = (value) => normalize(value).toLowerCase();

/**
 * Single-select attribute field.
 * Uses Main_Suggest so the user can either type a free value or pick a
 * suggestion from the combined dropdown/reference list.
 */
const AttributeSingleField = ({ attributeId, options, value, onSave }) => {
  const suggestions = useMemo(
    () => (options || []).map((option) => option.name),
    [options],
  );

  return (
    <Main_Suggest
      defaultSuggestions={suggestions}
      defaultValue={value || ''}
      placeholder="Select or type a value..."
      autoComplete="off"
      onChange={(ov, nv) => onSave(attributeId, normalize(nv))}
    />
  );
};

/**
 * Multiple-selection (tagging) attribute field.
 *
 * Main_TagInputField works with option "ids". We build option ids as the
 * lowercased value, but map each id back to its original-cased name so the
 * stored value keeps whatever case was displayed/typed.
 */
const AttributeTagField = ({ attributeId, options, values, onSave }) => {
  const [selectedIds, setSelectedIds] = useState(values || []);
  const idToValueRef = useRef(new Map());
  const selectedIdsRef = useRef(values || []);

  useEffect(() => {
    setSelectedIds(values || []);
  }, [values]);

  useEffect(() => {
    const map = new Map();
    (options || []).forEach((option) => {
      map.set(option.id, option.name);
    });
    idToValueRef.current = map;
  }, [options]);

  const resolveIds = useCallback((ids) => {
    const resolved = [];
    (ids || []).forEach((id) => {
      const value = idToValueRef.current.get(id);
      if (value != null) {
        resolved.push(value);
      }
    });
    return resolved;
  }, []);

  const handleChange = useCallback(
    (ov, nv) => {
      const nextIds = Array.isArray(nv) ? nv : [];
      selectedIdsRef.current = nextIds;

      const resolved = resolveIds(nextIds);
      if (resolved.length === nextIds.length) {
        onSave(attributeId, resolved);
      }
      // Otherwise a new free-form value was just added and its uuid cannot be
      // resolved yet; onAddNewOption will finish the job.
    },
    [attributeId, onSave, resolveIds],
  );

  const handleAddNewOption = useCallback(
    (newOption) => {
      const value = normalize(newOption?.name);
      if (!value) return;

      idToValueRef.current.set(newOption.id, value);

      const resolved = resolveIds(selectedIdsRef.current);
      if (resolved.length === selectedIdsRef.current.length) {
        onSave(attributeId, resolved);
      }
    },
    [attributeId, onSave, resolveIds],
  );

  return (
    <Main_TagInputField
      defaultOptions={options || []}
      defaultSelectedOptions={selectedIds}
      onChange={handleChange}
      onAddNewOption={handleAddNewOption}
      canAddNewOptions={true}
      placeholder="Select or type values..."
    />
  );
};

const Main_ProductAttributes = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { getMasterTableData } = useMasterContext();

  // Keep a live reference so persistence callbacks always read fresh data.
  const pageDataRef = useRef(pageData);
  pageDataRef.current = pageData;

  // Cache the row id used for each single-select attribute while typing,
  // so consecutive keystrokes reuse the same row instead of minting new ones.
  const singleRowIdRef = useRef(new Map());

  const masterAttributes = getMasterTableData('master_product_attributes');
  const categoryAssigns = getMasterTableData(
    'master_product_category_attribute_assign',
  );
  const attributeDropdowns = getMasterTableData(
    'master_product_attribute_dropdown',
  );

  const selectedCategoryIds = useMemo(() => {
    return (pageData?.product_categories || [])
      .map((relation) => relation?.category_id)
      .filter(Boolean);
  }, [pageData?.product_categories]);

  // Dedup attribute ids so an attribute assigned to multiple selected
  // categories is only rendered once.
  const assignedAttributeIds = useMemo(() => {
    const selected = new Set(selectedCategoryIds);
    const seen = new Set();
    const ids = [];

    (categoryAssigns || []).forEach((assign) => {
      if (!selected.has(assign.category_id)) return;
      if (seen.has(assign.attribute_id)) return;
      seen.add(assign.attribute_id);
      ids.push(assign.attribute_id);
    });

    return ids;
  }, [categoryAssigns, selectedCategoryIds]);

  const attributeRows = useMemo(() => {
    const byId = new Map(
      (masterAttributes || []).map((attr) => [attr.id, attr]),
    );
    return assignedAttributeIds.map((id) => byId.get(id)).filter(Boolean);
  }, [assignedAttributeIds, masterAttributes]);

  const getValueRows = useCallback((attributeId) => {
    return (pageDataRef.current?.product_attribute_values || []).filter(
      (row) => row?.attribute_id === attributeId,
    );
  }, []);

  const persistSingle = useCallback(
    (attributeId, rawValue) => {
      const productId = pageDataRef.current?.id;
      const existing = getValueRows(attributeId);
      const cleaned = normalize(rawValue);

      const operations = [];

      if (cleaned) {
        const firstRow = existing[0];
        if (firstRow) {
          singleRowIdRef.current.set(attributeId, firstRow.id);
          operations.push({
            id: firstRow.id,
            product_id: productId,
            attribute_id: attributeId,
            value: cleaned,
          });
          existing.slice(1).forEach((row) => {
            operations.push({ id: row.id, _delete: true });
          });
        } else {
          const reusedId = singleRowIdRef.current.get(attributeId);
          const rowId = reusedId || uuidv4();
          singleRowIdRef.current.set(attributeId, rowId);

          operations.push({
            id: rowId,
            product_id: productId,
            attribute_id: attributeId,
            value: cleaned,
          });
        }
      } else {
        singleRowIdRef.current.delete(attributeId);
        existing.forEach((row) => {
          operations.push({ id: row.id, _delete: true });
        });
      }

      if (operations.length > 0) {
        upsertProductPageData({ product_attribute_values: operations });
      }
    },
    [getValueRows, upsertProductPageData],
  );

  const persistMulti = useCallback(
    (attributeId, nextValues) => {
      const productId = pageDataRef.current?.id;
      const existing = getValueRows(attributeId);

      // Normalize while preserving case, deduplicating case-insensitively.
      const nextMap = new Map();
      (nextValues || []).forEach((raw) => {
        const value = normalize(raw);
        if (!value) return;
        const key = keyOf(value);
        if (!nextMap.has(key)) {
          nextMap.set(key, value);
        }
      });

      const operations = [];

      existing.forEach((row) => {
        if (!nextMap.has(keyOf(row.value))) {
          operations.push({ id: row.id, _delete: true });
        }
      });

      const existingKeys = new Set(existing.map((row) => keyOf(row.value)));
      nextMap.forEach((value, key) => {
        if (!existingKeys.has(key)) {
          operations.push({
            id: uuidv4(),
            product_id: productId,
            attribute_id: attributeId,
            value,
          });
        }
      });

      if (operations.length > 0) {
        upsertProductPageData({ product_attribute_values: operations });
      }
    },
    [getValueRows, upsertProductPageData],
  );

  // Build a single, case-insensitively deduplicated option list for an
  // attribute. The option id is the lowercase key; the option name keeps the
  // original casing for display/storage.
  const buildOptions = useCallback(
    (attribute, existingValues) => {
      const dropdownRows = (attributeDropdowns || []).filter(
        (row) => row?.attribute_id === attribute.id,
      );

      const referenceRows = attribute.dropdown_reference
        ? getMasterTableData(attribute.dropdown_reference) || []
        : [];

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
      (existingValues || []).forEach((value) => push(value));

      return result;
    },
    [attributeDropdowns, getMasterTableData],
  );

  return (
    <Main_InputContainer label="Product Attributes">
      {attributeRows.length === 0 ? (
        <EmptyState message="No attributes configured for the selected category." />
      ) : (
        <div className={styles.grid}>
          {attributeRows.map((attribute) => {
            const existingRows = getValueRows(attribute.id);
            const existingValues = existingRows
              .map((row) => normalize(row.value))
              .filter(Boolean);
            const existingKeys = existingValues.map(keyOf);
            const options = buildOptions(attribute, existingValues);
            const label = attribute.label || attribute.name || 'Attribute';
            const multiple =
              attribute.multiple_selection === 1 ||
              attribute.multiple_selection === true;

            return (
              <div key={attribute.id} className={styles.field}>
                <label className={styles.fieldLabel}>{label}</label>
                {multiple ? (
                  <AttributeTagField
                    attributeId={attribute.id}
                    options={options}
                    values={existingKeys}
                    onSave={persistMulti}
                  />
                ) : (
                  <AttributeSingleField
                    attributeId={attribute.id}
                    options={options}
                    value={existingValues[0] || ''}
                    onSave={persistSingle}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Main_InputContainer>
  );
};

export default Main_ProductAttributes;
