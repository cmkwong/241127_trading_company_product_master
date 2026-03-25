import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMasterContext } from '../../../../store/MasterContext';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import { useProductContext } from '../../../../store/ProductContext';
import { sortByDisplayOrder } from '../../../../utils/arr';
import styles from './Sub_ProductImagesRow.module.css';

const Sub_ProductImagesRow = (props) => {
  const { imageData, rowindex } = props;

  const { pageData, upsertProductPageData } = useProductContext();
  const { productImageType } = useMasterContext();
  const [productImageSubType, setProductImageSubType] = useState([]); // This is for the sub type dropdown, which is based on the selected main type

  const [mainImageTypeId, setMainImageTypeId] = useState();
  const [defaultImages, setDefaultImages] = useState([]);

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

  // Update sub image type options when main image type changes
  useEffect(() => {
    // getting the sub image type ids based on the selected main image type id
    if (mainImageTypeId) {
      const subTypes = (productImageType || []).filter(
        (type) => type.parent_id === mainImageTypeId,
      );
      setProductImageSubType(subTypes);
    } else {
      setProductImageSubType([]);
    }
  }, [mainImageTypeId, productImageType]);

  // assign main image type from row + default images from pageData.product_images
  useEffect(() => {
    const rowImages = imageData?.[rowindex]?.images || [];
    const firstImageTypeId =
      rowImages.length > 0
        ? rowImages[0].image_type_id
        : imageData?.[rowindex]?.id;
    const firstImageType = (productImageType || []).find(
      (type) => type.id === firstImageTypeId,
    );
    const resolvedMainTypeId = firstImageType?.parent_id || firstImageTypeId;

    setMainImageTypeId(resolvedMainTypeId);

    const pageImages = pageData?.product_images || [];
    setDefaultImages(
      pageImages.map((el) => ({
        id: el.id,
        url: el.image_url,
        name: el.image_name,
        size: el.size,
        image_type_id: el.image_type_id,
        display_order: el.display_order,
      })),
    );
  }, [imageData, rowindex, productImageType, pageData?.product_images]);

  const getDefaultImagesBySubType = useCallback(
    (subTypeId) => {
      return sortByDisplayOrder(
        defaultImages.filter((img) => img.image_type_id === subTypeId),
      );
    },
    [defaultImages],
  );

  const getDefaultImagesByMainType = useCallback(() => {
    return sortByDisplayOrder(
      defaultImages.filter((img) => img.image_type_id === mainImageTypeId),
    );
  }, [defaultImages, mainImageTypeId]);

  const getDefaultFilesBySubType = useCallback(
    (subTypeId) => {
      return sortByDisplayOrder(
        defaultImages.filter((img) => img.image_type_id === subTypeId),
      ).map((img) => ({
        id: img.id,
        name: img.name,
        size: img.size || 0,
        type: 'application/octet-stream',
        url: img.url,
      }));
    },
    [defaultImages],
  );

  // hande the image changed
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
        upsertProductPageData({
          product_images: removedImages.map((img) => ({
            id: img.id,
            _delete: true,
          })),
        });
      }

      if (newList.length > 0) {
        const addedImageIds = new Set(addedImages.map((img) => img.id));

        upsertProductPageData({
          product_images: newList.map((img, index) => ({
            id: img.id,
            product_id: pageData.id,
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
    [upsertProductPageData, pageData.id],
  );

  // Handle image upload errors
  const handleImageError = useCallback((error) => {
    console.error('Image upload error:', error);
  }, []);

  // handle image type change
  const handleImageTypeChange = useCallback(
    (ov, nv) => {
      if (ov === nv) return;

      const productImages = pageData?.product_images || [];

      const currentRowHasFiles =
        (imageData?.[rowindex]?.images || []).length > 0;
      if (currentRowHasFiles) {
        window.alert(
          'Main image type cannot be changed while this row has images/files. Remove all images/files in this row first.',
        );
        // Force reset dropdown UI back to previous value
        setMainImageTypeId(null);
        setTimeout(() => {
          setMainImageTypeId(ov);
        }, 0);
        return;
      }

      // finding required image id
      const ids = productImages
        .filter((d) => d.image_type_id === ov || (!ov && !d.image_type_id))
        .map((d) => d.id);

      // check if nv is currently used by other images, if yes, we need to update those images to avoid duplicate image type id issue, if no, we can just update the current images with the new image type id
      const isNvUsed = productImages.some((d) => d.image_type_id === nv);
      let confirmSwitch = false;
      if (isNvUsed) {
        confirmSwitch = window.confirm(
          'The selected image type is currently used by other images. Do you want to switch the image type? This will update all images using this image type to the new image type.',
        );
      }
      if (isNvUsed && !confirmSwitch) {
        // if user cancel the switch, we need to reset the image type id to the previous value
        // Force reset
        setMainImageTypeId(null);
        setTimeout(() => {
          setMainImageTypeId(ov);
        }, 0);
        return;
      } else {
        setMainImageTypeId(nv);
        console.log('set nv as new image type id: ', nv);
        for (let i = 0; i < ids.length; i++) {
          upsertProductPageData({
            product_images: [
              {
                id: ids[i], // Assuming all images in the row have the same image_type_id, we can use the first image's id for the update
                product_id: pageData.id,
                image_type_id: nv,
              },
            ],
          });
        }
      }
    },
    [
      pageData?.product_images,
      upsertProductPageData,
      pageData.id,
      imageData,
      rowindex,
    ],
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
                label={subType.name}
                showDownloadButton
                downloadEndpoint="http://localhost:3001/api/v1/trade_business/products/data/images/download"
                downloadRequestBody={{
                  product_id: pageData.id,
                  image_type_id: subType.id,
                }}
                downloadFileBaseName={`${String(subType.name || 'images').replace(/\s+/g, '_')}`}
                downloadNameProductId={pageData.id || ''}
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
              label={`${
                (productImageType || []).find(
                  (type) => type.id === mainImageTypeId,
                )?.name || 'Main Type'
              } - main`}
              showDownloadButton
              downloadEndpoint="http://localhost:3001/api/v1/trade_business/products/data/images/download"
              downloadRequestBody={{
                product_id: pageData.id,
                image_type_id: mainImageTypeId,
              }}
              downloadFileBaseName={`${String(
                (productImageType || []).find(
                  (type) => type.id === mainImageTypeId,
                )?.name || 'main',
              ).replace(/\s+/g, '_')}_main`}
              downloadNameProductId={pageData.id || ''}
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

/*
Q: 
But the old value is: 
User cancelled the image type switch:  {from: 'Amazon', to: '1688'}

Why did not update back to Amazon?

A:
The reason setMainImageTypeId(ov) (or Amazon) might not visually revert the dropdown back to "Amazon" is likely because the Main_Dropdown component's internal state mechanism isn't picking up the change.

When you call setMainImageTypeId(ov), you are setting the state to what it already was ("Amazon").
React's diffing algorithm sees:

Current State: "Amazon"
New State: "Amazon"
Because the value is identical, React skips the re-render for Sub_ProductImagesRow. Consequently, Main_Dropdown receives the same props as the previous render cycle.

The Main_Dropdown component relies on its useEffect hook to sync its internal state with the defaultSelectedOption prop.
*/
