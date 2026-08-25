import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMasterContext } from '../../../../store/MasterContext';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { sortByDisplayOrder } from '../../../../utils/arr';
import styles from './Sub_ProductImagesRow.module.css';

const Sub_ProductImagesRow = (props) => {
  const { imageData, rowindex, rowId } = props;

  const { productImageType } = useMasterContext();
  const productId = useEntityField('products', 'id');
  const pageImages = useEntityRows('products', 'product_images');
  const [productImageSubType, setProductImageSubType] = useState([]);

  const [mainImageTypeId, setMainImageTypeId] = useState();
  const [defaultImages, setDefaultImages] = useState([]);

  const currentImageRow = rowId || imageData?.[rowindex]?.id;

  const getImageTypePriority = useCallback((name = '', isMain = false) => {
    if (isMain) return 99;
    const normalized = String(name || '').toLowerCase();
    if (normalized.includes('display')) return 1;
    if (normalized.includes('description')) return 2;
    if (normalized.includes('video')) return 3;
    return 50;
  }, []);

  const orderedSubTypes = useMemo(() => {
    return [...productImageSubType].sort((a, b) => {
      const pa = getImageTypePriority(a?.name, false);
      const pb = getImageTypePriority(b?.name, false);
      if (pa !== pb) return pa - pb;
      return String(a?.name || '').localeCompare(String(b?.name || ''));
    });
  }, [productImageSubType, getImageTypePriority]);

  useEffect(() => {
    if (mainImageTypeId) {
      const subTypes = (productImageType || []).filter(
        (type) => type.parent_id === mainImageTypeId,
      );
      setProductImageSubType(subTypes);
    } else {
      setProductImageSubType([]);
    }
  }, [mainImageTypeId, productImageType]);

  useEffect(() => {
    const rowImages = imageData?.[rowindex]?.images || [];
    const firstImageTypeId =
      rowImages.length > 0 ? rowImages[0].image_type_id : null;
    const firstImageType = (productImageType || []).find(
      (type) => type.id === firstImageTypeId,
    );
    const resolvedMainTypeId = firstImageTypeId
      ? firstImageType?.parent_id || firstImageTypeId
      : null;

    setMainImageTypeId(resolvedMainTypeId);

    setDefaultImages(
      (pageImages || []).map((el) => ({
        id: el.id,
        url: el.image_url,
        name: el.image_name,
        size: el.size,
        image_row: el.image_row,
        image_type_id: el.image_type_id,
        display_order: el.display_order,
      })),
    );
  }, [imageData, rowindex, productImageType, pageImages]);

  const getDefaultImagesBySubType = useCallback(
    (subTypeId) => {
      return sortByDisplayOrder(
        defaultImages.filter(
          (img) =>
            img.image_row === currentImageRow &&
            img.image_type_id === subTypeId,
        ),
      );
    },
    [defaultImages, currentImageRow],
  );

  const getDefaultImagesByMainType = useCallback(() => {
    return sortByDisplayOrder(
      defaultImages.filter(
        (img) =>
          img.image_row === currentImageRow &&
          img.image_type_id === mainImageTypeId,
      ),
    );
  }, [defaultImages, mainImageTypeId, currentImageRow]);

  const getDefaultFilesBySubType = useCallback(
    (subTypeId) => {
      return sortByDisplayOrder(
        defaultImages.filter(
          (img) =>
            img.image_row === currentImageRow &&
            img.image_type_id === subTypeId,
        ),
      ).map((img) => ({
        id: img.id,
        name: img.name,
        size: img.size || 0,
        type: 'application/octet-stream',
        url: img.url,
      }));
    },
    [defaultImages, currentImageRow],
  );

  const handleImageChange = useCallback(
    (subTypeId, oldImages = [], newImages = []) => {
      const oldList = Array.isArray(oldImages) ? oldImages : [];
      const newList = Array.isArray(newImages) ? newImages : [];

      const addedImages = newList.filter(
        (img) => !oldList.some((oldImg) => oldImg.id === img.id),
      );
      const removedImages = oldList.filter(
        (img) => !newList.some((newImg) => newImg.id === img.id),
      );

      const sameLength = oldList.length === newList.length;
      const sameOrder =
        sameLength && oldList.every((img, i) => img.id === newList[i]?.id);

      if (addedImages.length === 0 && removedImages.length === 0 && sameOrder) {
        return;
      }

      if (removedImages.length > 0) {
        upsertEntityData('products', {
          product_images: removedImages.map((img) => ({
            id: img.id,
            _delete: true,
          })),
        });
      }

      if (newList.length > 0) {
        const addedImageIds = new Set(addedImages.map((img) => img.id));

        upsertEntityData('products', {
          product_images: newList.map((img, index) => ({
            id: img.id,
            product_id: productId,
            image_row: currentImageRow,
            image_type_id: subTypeId,
            display_order: index + 1,
            ...(addedImageIds.has(img.id)
              ? {
                  image_name: img.name,
                  image_url: img.url,
                  size: img.size,
                }
              : {}),
          })),
        });
      }
    },
    [upsertEntityData, productId, currentImageRow],
  );

  const handleImageError = useCallback((error) => {
    console.error('Image upload error:', error);
  }, []);

  const handleImageTypeChange = useCallback(
    (ov, nv) => {
      if (ov === nv) return;

      const currentRowHasFiles =
        (imageData?.[rowindex]?.images || []).length > 0;
      if (currentRowHasFiles) {
        window.alert(
          'Main image type cannot be changed while this row has images/files. Remove all images/files in this row first.',
        );
        setMainImageTypeId(null);
        setTimeout(() => {
          setMainImageTypeId(ov);
        }, 0);
        return;
      }

      setMainImageTypeId(nv);
    },
    [imageData, rowindex],
  );

  return (
    <div className={styles.container}>
      <div className={styles.imageTypeRow}>
        <Main_Dropdown
          defaultOptions={(productImageType || [])
            .filter((type) => type.parent_id === null)
            .map((type) => ({
              id: type.id,
              name: type.name,
            }))}
          defaultSelectedOption={mainImageTypeId}
          label="Image Type"
          onChange={handleImageTypeChange}
        />
      </div>

      <div className={styles.uploadArea}>
        {orderedSubTypes.map((subType) => {
          const isVideoType = /video/i.test(subType?.name || '');

          return (
            <div className={styles.uploadCell} key={subType.id}>
              <Main_FileUploads
                mode={isVideoType ? 'file' : 'image'}
                figmaStrip
                label={subType.name}
                showDownloadButton
                downloadEndpoint="http://localhost:3001/api/v1/trade_business/products/data/images/download"
                downloadRequestBody={{
                  product_id: productId,
                  image_type_id: subType.id,
                  image_row: currentImageRow,
                }}
                downloadFileBaseName={`${String(subType.name || 'images').replace(/\s+/g, '')}`}
                downloadNameProductId={productId || ''}
                downloadNameImageType={subType.name || 'images'}
                onError={handleImageError}
                onChange={(oldImages, newImages) =>
                  handleImageChange(subType.id, oldImages, newImages)
                }
                defaultImages={
                  isVideoType
                    ? undefined
                    : getDefaultImagesBySubType(subType.id)
                }
                defaultFiles={
                  isVideoType ? getDefaultFilesBySubType(subType.id) : undefined
                }
              />
            </div>
          );
        })}

        {mainImageTypeId && (
          <div className={styles.uploadCell} key={`main-${mainImageTypeId}`}>
            <Main_FileUploads
              mode="image"
              figmaStrip
              label={`${
                (productImageType || []).find(
                  (type) => type.id === mainImageTypeId,
                )?.name || 'Main Type'
              } - main`}
              showDownloadButton
              downloadEndpoint="http://localhost:3001/api/v1/trade_business/products/data/images/download"
              downloadRequestBody={{
                product_id: productId,
                image_type_id: mainImageTypeId,
                image_row: currentImageRow,
              }}
              downloadFileBaseName={`${String(
                (productImageType || []).find(
                  (type) => type.id === mainImageTypeId,
                )?.name || 'main',
              ).replace(/\s+/g, '')}_main`}
              downloadNameProductId={productId || ''}
              downloadNameImageType="main"
              onError={handleImageError}
              onChange={(oldImages, newImages) =>
                handleImageChange(mainImageTypeId, oldImages, newImages)
              }
              defaultImages={getDefaultImagesByMainType()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sub_ProductImagesRow;
