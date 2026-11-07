import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import RemoveRowBtn from '../../../common/Buttons/RemoveRowBtn';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import IconUpload from '../../../common/InputOptions/IconUpload/IconUpload';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { buildProductImagesPath } from '../../../../utils/filePickerUtils';
import { getEntryDisplayName } from '../../../common/FileSelector/fileSelectorUtils';
import {
  MAX_CATALOG_ROW_IMAGES,
  resolveCatalogImageTypeId,
  resolveEditedCatalogImages,
} from '../utils/catalogImageDefaults';
import CatalogRowAttributePickerModal from '../AttributesPicker/CatalogRowAttributePickerModal';
import styles from './CatalogProductRow.module.css';

const toTrimmed = (value) => String(value || '').trim();

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_IMAGE_SIZE_MB = 5;

const getProductDisplayName = (product) => {
  const names = product?.product_names;
  if (!Array.isArray(names) || names.length === 0) return '';
  const sorted = [...names].sort((a, b) => {
    const aOrder = Number(a?.display_order);
    const bOrder = Number(b?.display_order);
    return (
      (Number.isFinite(aOrder) ? aOrder : 999999) -
      (Number.isFinite(bOrder) ? bOrder : 999999)
    );
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
  const {
    getAllProducts,
    getProductImageDefaultsByIds,
    saveProductImages,
    saveProductIcon,
  } = useProductContext();
  const { getProductAttributes, productImageType } = useMasterContext();
  const [attributesPickerOpen, setAttributesPickerOpen] = useState(false);
  const [catalogImages, setCatalogImages] = useState([]);
  const [imagesSaving, setImagesSaving] = useState(false);
  const [imagesError, setImagesError] = useState(null);
  const [productIcon, setProductIcon] = useState({ url: '', name: '' });
  const [iconSaving, setIconSaving] = useState(false);
  const [iconError, setIconError] = useState(null);

  const product = useMemo(() => {
    const list = getAllProducts() || [];
    return list.find(
      (p) =>
        String(p?.id || '').trim() === String(row?.product_id || '').trim(),
    );
  }, [getAllProducts, row?.product_id]);

  const productName = product
    ? getProductDisplayName(product)
    : 'Unknown product';
  const productId = toTrimmed(product?.id);

  const catalogImageTypeId = useMemo(
    () => resolveCatalogImageTypeId(productImageType || []),
    [productImageType],
  );

  // Load the product's "Edited - catalog" images live from `product_images`
  // (the same rows Product Master edits). Any change made here is persisted
  // straight back to `product_images`, so both modules share one source.
  useEffect(() => {
    let cancelled = false;

    if (!productId || !catalogImageTypeId) {
      setCatalogImages([]);
      return undefined;
    }

    (async () => {
      try {
        const products = await getProductImageDefaultsByIds([productId]);
        const productRow = products?.[0] || {};
        const productImages = productRow.product_images || [];
        const edited = resolveEditedCatalogImages({
          productImages,
          catalogTypeId: catalogImageTypeId,
        });
        if (!cancelled) {
          setCatalogImages(edited);
          setProductIcon({
            url: String(productRow.icon_url || '').trim(),
            name: String(productRow.icon_name || '').trim(),
          });
        }
      } catch (err) {
        console.error('Failed to load catalog images', err);
        if (!cancelled) setCatalogImages([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId, catalogImageTypeId, getProductImageDefaultsByIds]);

  const additionalImagesValue = useMemo(
    () =>
      catalogImages.map((img) => ({
        id: img.id,
        url: img.image_url || '',
        name: img.image_name || '',
      })),
    [catalogImages],
  );

  const attributeDisplays = useMemo(
    () =>
      Array.isArray(row?.catalog_product_row_attribute_displays)
        ? row.catalog_product_row_attribute_displays
        : [],
    [row?.catalog_product_row_attribute_displays],
  );

  const allAttributes = useMemo(() => {
    const list = getProductAttributes ? getProductAttributes() : [];
    return Array.isArray(list) ? list : [];
  }, [getProductAttributes]);

  const attributeLabelById = useMemo(() => {
    const map = new Map();
    allAttributes.forEach((attr) => {
      const id = toTrimmed(attr?.id);
      if (!id) return;
      map.set(id, toTrimmed(attr?.label || attr?.name) || id);
    });
    return map;
  }, [allAttributes]);

  const selectedAttributeIds = useMemo(
    () =>
      attributeDisplays
        .map((display) => toTrimmed(display?.attribute_id))
        .filter(Boolean),
    [attributeDisplays],
  );

  // Persist the product's own icon (the row's "Main image") via the product
  // API, so Product Master and Catalog always share the same source.
  const persistProductIcon = useCallback(
    async ({ icon_url, icon_name, base64Changed }) => {
      setIconSaving(true);
      setIconError(null);
      try {
        const saved = await saveProductIcon(productId, {
          icon_url,
          icon_name,
          base64Changed,
        });
        setProductIcon({ url: saved?.icon_url || '', name: saved?.icon_name || '' });
      } catch (err) {
        console.error('Failed to save product icon', err);
        setIconError(err?.message || 'Failed to save icon');
      } finally {
        setIconSaving(false);
      }
    },
    [productId, saveProductIcon],
  );

  const handleIconSelectFile = (file) => {
    if (!file || !productId) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setIconError(`Unsupported image type (${file.type})`);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setIconError(`File exceeds maximum size of ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    persistProductIcon({
      icon_url: objectUrl,
      icon_name: file.name || '',
      base64Changed: true,
    });
  };

  const handleIconSelectExisting = (entry) => {
    if (!entry?.path || !productId) return;
    persistProductIcon({
      icon_url: entry.path,
      icon_name: getEntryDisplayName(entry),
      base64Changed: false,
    });
  };

  const handleIconRemove = () => {
    if (!productId) return;
    persistProductIcon({
      icon_url: '',
      icon_name: '',
      base64Changed: false,
    });
  };

  const handleAdditionalImagesChange = useCallback(
    async (_oldList, newList) => {
      if (!productId || !catalogImageTypeId) return;

      const nextList = Array.isArray(newList) ? newList : [];
      const existingById = new Map(
        catalogImages.map((img) => [String(img.id).trim(), img]),
      );
      const fallbackImageRow = catalogImages[0]?.image_row || uuidv4();

      const desiredRows = nextList.map((img, index) => {
        const existing = existingById.get(String(img.id || '').trim());
        if (existing) {
          // Existing `product_images` row: only the display order may change.
          return { id: existing.id, display_order: index + 1 };
        }
        // New upload / file-bank pick → a brand-new `product_images` row under
        // the "Edited - catalog" type, grouped under the catalog image row.
        return {
          id: uuidv4(),
          product_id: productId,
          image_type_id: catalogImageTypeId,
          image_row: fallbackImageRow,
          display_order: index + 1,
          image_name: img.name || '',
          image_url: img.storedPath || img.url || '',
        };
      });

      setImagesSaving(true);
      setImagesError(null);
      try {
        const fresh = await saveProductImages(
          productId,
          desiredRows,
          catalogImages,
        );
        setCatalogImages(
          resolveEditedCatalogImages({
            productImages: fresh,
            catalogTypeId: catalogImageTypeId,
          }),
        );
      } catch (err) {
        console.error('Failed to save additional images', err);
        setImagesError(err?.message || 'Failed to save images');
      } finally {
        setImagesSaving(false);
      }
    },
    [
      productId,
      catalogImageTypeId,
      catalogImages,
      saveProductImages,
    ],
  );

  const handleToggleAttribute = (attributeId) => {
    const id = toTrimmed(attributeId);
    if (!id) return;

    const existing = attributeDisplays.find(
      (display) => toTrimmed(display?.attribute_id) === id,
    );

    if (existing) {
      onPatchRow(row.id, {
        catalog_product_row_attribute_displays: [
          { id: existing.id, _delete: true },
        ],
      });
      return;
    }

    onPatchRow(row.id, {
      catalog_product_row_attribute_displays: [
        {
          id: uuidv4(),
          catalog_product_row_id: row.id,
          attribute_id: id,
        },
      ],
    });
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

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.rowBadge}>{index + 1}</span>
          {productId ? (
            <a
              className={`${styles.name} ${styles.nameLink}`}
              href={`/panel/product_master/${productId}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open product page in new tab"
              onClick={(event) => event.stopPropagation()}
            >
              {productName}
            </a>
          ) : (
            <span className={styles.name}>{productName}</span>
          )}
        </div>

        <div className={styles.uploadSection}>
          <div className={styles.iconUploadRow}>
            <IconUpload
              inputId={`catalog-row-icon-${row.id}`}
              imageUrl={productIcon.url}
              imageName={productIcon.name || 'product-icon'}
              onSelectFile={handleIconSelectFile}
              onSelectExisting={handleIconSelectExisting}
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              size="M"
              title="Select product icon"
              directoryPath={productId ? buildProductImagesPath(productId) : ''}
            />
            {productIcon.url ? (
              <button
                type="button"
                className={styles.removeIconBtn}
                onClick={handleIconRemove}
                title="Remove icon"
                aria-label="Remove icon"
              >
                X
              </button>
            ) : null}
          </div>
          {iconSaving ? <span className={styles.muted}>Saving icon…</span> : null}
          {iconError ? <span className={styles.muted}>{iconError}</span> : null}
        </div>

        <div className={styles.uploadSection}>
          <Main_FileUploads
            mode="image"
            label="Additional images"
            maxFiles={Math.max(MAX_CATALOG_ROW_IMAGES, catalogImages.length)}
            multiple
            disabled={!productId || !catalogImageTypeId}
            showDownloadButton={false}
            enableSequenceEditor={false}
            fileBankDirectoryPath={
              productId ? buildProductImagesPath(productId) : ''
            }
            defaultImages={additionalImagesValue}
            onError={(error) => {
              console.error('Image upload error:', error);
              setImagesError(error?.message || 'Image upload error');
            }}
            onChange={handleAdditionalImagesChange}
          />
          {imagesSaving ? (
            <span className={styles.muted}>Saving images…</span>
          ) : null}
          {!catalogImageTypeId && !imagesSaving ? (
            <span className={styles.muted}>
              {'"Edited - Catalog" image type not found.'}
            </span>
          ) : null}
          {imagesError ? (
            <span className={styles.muted}>{imagesError}</span>
          ) : null}
        </div>

        <div className={styles.section}>
          <span className={styles.label}>Product Attributes</span>
          <button
            type="button"
            className={styles.selectAttributesBtn}
            onClick={() => setAttributesPickerOpen(true)}
          >
            {selectedAttributeIds.length > 0
              ? `Edit Attributes (${selectedAttributeIds.length})`
              : 'Edit Attributes'}
          </button>
          {selectedAttributeIds.length > 0 ? (
            <div className={styles.chips}>
              {selectedAttributeIds.map((attrId) => (
                <span
                  key={attrId}
                  className={`${styles.chip} ${styles.chipSelected}`}
                >
                  {attributeLabelById.get(attrId) || attrId}
                </span>
              ))}
            </div>
          ) : (
            <span className={styles.muted}>No attributes selected</span>
          )}
        </div>
      </div>

      <RemoveRowBtn
        onClick={() => onRemove(row.id)}
        ariaLabel="Remove row"
        className={styles.removeBtn}
      />

      {attributesPickerOpen ? (
        <CatalogRowAttributePickerModal
          row={row}
          product={product}
          onClose={() => setAttributesPickerOpen(false)}
          onToggleAttribute={handleToggleAttribute}
        />
      ) : null}
    </div>
  );
};

export default CatalogProductRow;
