import { useCallback, useEffect, useState } from 'react';
import { useMasterContext } from '../../../../store/MasterContext';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import { useProductContext } from '../../../../store/ProductContext';
import styles from './Sub_ProductImagesRow.module.css';

const Sub_ProductImagesRow = (props) => {
  const { imageData, rowindex } = props;

  const { pageData, upsertProductPageData } = useProductContext();
  const { productImageType } = useMasterContext();
  const [productImageSubType, setProductImageSubType] = useState([]); // This is for the sub type dropdown, which is based on the selected main type

  const [mainImageTypeId, setMainImageTypeId] = useState();
  const [defaultImages, setDefaultImages] = useState([]);

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
      })),
    );
  }, [imageData, rowindex, productImageType, pageData?.product_images]);

  const getDefaultImagesBySubType = useCallback(
    (subTypeId) => {
      return defaultImages.filter((img) => img.image_type_id === subTypeId);
    },
    [defaultImages],
  );

  const getDefaultFilesBySubType = useCallback(
    (subTypeId) => {
      return defaultImages
        .filter((img) => img.image_type_id === subTypeId)
        .map((img) => ({
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
    (subTypeId, oldImages, newImages) => {
      if (newImages.length > oldImages.length) {
        // New image added
        const addedImages = newImages.filter(
          (img) => !oldImages.some((oldImg) => oldImg.id === img.id),
        );
        for (let i = 0; i < addedImages.length; i++) {
          upsertProductPageData({
            product_images: [
              {
                id: addedImages[i].id,
                product_id: pageData.id,
                image_type_id: subTypeId,
                image_name: addedImages[i].name,
                image_url: addedImages[i].url,
                size: addedImages[i].size,
                display_order: newImages.length,
              },
            ],
          });
        }
      } else if (newImages.length < oldImages.length) {
        // Image removed
        const removedImages = oldImages.filter(
          (img) => !newImages.some((newImg) => newImg.id === img.id),
        );
        for (let i = 0; i < removedImages.length; i++) {
          upsertProductPageData({
            product_images: [
              {
                id: removedImages[i].id,
                _delete: true,
              },
            ],
          });
        }
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
      // finding required image id
      const ids = pageData.product_images
        .filter((d) => d.image_type_id === ov || (!ov && !d.image_type_id))
        .map((d) => d.id);

      // check if nv is currently used by other images, if yes, we need to update those images to avoid duplicate image type id issue, if no, we can just update the current images with the new image type id
      const isNvUsed = pageData.product_images.some(
        (d) => d.image_type_id === nv,
      );
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
    [pageData.product_images, upsertProductPageData, pageData.id],
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
        {productImageSubType.map((subType) => {
          const isVideoType = /video/i.test(subType?.name || '');

          return (
            <div className={styles.uploadCell} key={subType.id}>
              <Main_FileUploads
                mode={isVideoType ? 'file' : 'image'}
                label={subType.name}
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
