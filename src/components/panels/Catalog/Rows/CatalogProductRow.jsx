import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import RemoveRowBtn from '../../../common/Buttons/RemoveRowBtn';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './CatalogProductRow.module.css';

const toTrimmed = (value) => String(value || '').trim();

const getProductDisplayName = (product) => {
  const names = product?.product_names;
  if (!Array.isArray(names) || names.length === 0) return '';
  const sorted = [...names].sort((a, b) => {
    const aOrder = Number(a?.display_order);
    const bOrder = Number(b?.display_order);
    return (Number.isFinite(aOrder) ? aOrder : 999999) -
      (Number.isFinite(bOrder) ? bOrder : 999999);
  });
  for (const row of sorted) {
    const name = toTrimmed(row?.name);
    if (name) return name;
  }
  return '';
};

const CatalogProductRow = ({
  row,
  index,
  dragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onRemove,
  onPatchRow,
}) => {
  const { getAllProducts } = useProductContext();
  const { getProductAttributes } = useMasterContext();
  const [newImageUrl, setNewImageUrl] = useState('');

  const product = useMemo(() => {
    const list = getAllProducts() || [];
    return list.find((p) => String(p?.id || '').trim() === String(row?.product_id || '').trim());
  }, [getAllProducts, row?.product_id]);

  const productName = product ? getProductDisplayName(product) : 'Unknown product';
  const thumbUrl = toTrimmed(row?.image_url) || product?.icon_url || '';

  const rowImages = useMemo(
    () => (Array.isArray(row?.catalog_product_row_images) ? row.catalog_product_row_images : []),
    [row?.catalog_product_row_images],
  );

  const attributeDisplays = useMemo(
    () => (Array.isArray(row?.catalog_product_row_attribute_displays) ? row.catalog_product_row_attribute_displays : []),
    [row?.catalog_product_row_attribute_displays],
  );

  const allAttributes = useMemo(() => {
    const list = getProductAttributes ? getProductAttributes() : [];
    return Array.isArray(list) ? list : [];
  }, [getProductAttributes]);

  const selectedAttributeIds = new Set(
    attributeDisplays.map((d) => toTrimmed(d?.attribute_id)).filter(Boolean),
  );

  const handleMainImageChange = (event) => {
    onPatchRow(row.id, { image_url: event.target.value });
  };

  const handleAddImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    const next = [
      ...rowImages,
      {
        id: uuidv4(),
        catalog_product_row_id: row.id,
        image_url: url,
        display_order: rowImages.length + 1,
      },
    ];
    onPatchRow(row.id, { catalog_product_row_images: next });
    setNewImageUrl('');
  };

  const handleRemoveImage = (imageId) => {
    const next = rowImages.filter((img) => img.id !== imageId);
    onPatchRow(row.id, { catalog_product_row_images: next });
  };

  const handleToggleAttribute = (attributeId) => {
    const existing = attributeDisplays.find(
      (d) => toTrimmed(d?.attribute_id) === attributeId,
    );
    const next = existing
      ? attributeDisplays.filter((d) => toTrimmed(d?.attribute_id) !== attributeId)
      : [
          ...attributeDisplays,
          { id: uuidv4(), catalog_product_row_id: row.id, attribute_id: attributeId },
        ];
    onPatchRow(row.id, { catalog_product_row_attribute_displays: next });
  };

  return (
    <div
      className={`${styles.row} ${dragOver ? styles.dragOver : ''}`}
      onDragOver={(event) => onDragOver(event, row.id)}
      onDrop={(event) => onDrop(event, row.id)}
    >
      <button
        type="button"
        draggable
        className={styles.dragHandle}
        onDragStart={() => onDragStart(row.id)}
        onDragEnd={onDragEnd}
        title="Drag to reorder"
        aria-label="Drag to reorder row"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="5" cy="4" r="1.2" />
          <circle cx="11" cy="4" r="1.2" />
          <circle cx="5" cy="8" r="1.2" />
          <circle cx="11" cy="8" r="1.2" />
          <circle cx="5" cy="12" r="1.2" />
          <circle cx="11" cy="12" r="1.2" />
        </svg>
      </button>

      <div className={styles.thumb}>
        {thumbUrl ? (
          <img src={thumbUrl} alt={productName} />
        ) : (
          <div className={styles.thumbPlaceholder} />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.rowBadge}>{index + 1}</span>
          <span className={styles.name}>{productName}</span>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Main image URL</span>
          <input
            type="text"
            className={styles.input}
            value={row?.image_url || ''}
            onChange={handleMainImageChange}
            placeholder="Leave blank to use product icon"
          />
        </label>

        <div className={styles.section}>
          <span className={styles.label}>Additional images</span>
          <div className={styles.imageList}>
            {rowImages.map((img) => (
              <div key={img.id} className={styles.imageItem}>
                <img src={img.image_url} alt="" />
                <RemoveRowBtn
                  onClick={() => handleRemoveImage(img.id)}
                  ariaLabel="Remove image"
                />
              </div>
            ))}
          </div>
          <div className={styles.addImageRow}>
            <input
              type="text"
              className={styles.input}
              value={newImageUrl}
              onChange={(event) => setNewImageUrl(event.target.value)}
              placeholder="Paste image URL"
            />
            <button type="button" className={styles.addBtn} onClick={handleAddImage}>
              Add
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>Attributes to display</span>
          <div className={styles.chips}>
            {allAttributes.length === 0 ? (
              <span className={styles.muted}>No attributes available</span>
            ) : (
              allAttributes.map((attr) => {
                const attrId = toTrimmed(attr?.id);
                const selected = selectedAttributeIds.has(attrId);
                return (
                  <button
                    key={attrId}
                    type="button"
                    className={`${styles.chip} ${selected ? styles.chipSelected : ''}`}
                    onClick={() => handleToggleAttribute(attrId)}
                  >
                    {attr?.label || attr?.name || attrId}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <RemoveRowBtn
        onClick={() => onRemove(row.id)}
        ariaLabel="Remove row"
        className={styles.removeBtn}
      />
    </div>
  );
};

export default CatalogProductRow;

