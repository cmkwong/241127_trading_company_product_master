import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMasterContext } from '../../../../store/MasterContext';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import { useProductContext } from '../../../../store/ProductContext';

const Sub_ProductImagesRow = (props) => {
  const { imageData, rowindex } = props;

  const [imageTypeId, setImageTypeId] = useState();
  const [defaultImages, setDefaultImages] = useState([]);

  const { pageData, upsertProductPageData } = useProductContext();
  const { productImageType } = useMasterContext();

  // assign set default images when imageData changes
  useMemo(() => {
    if ((imageData && imageData.length === 0) || !imageData[rowindex]) {
      setDefaultImages([]);
      return;
    }

    setImageTypeId(
      imageData[rowindex].images?.length > 0
        ? imageData[rowindex].images[0].image_type_id
        : undefined,
    );
    setDefaultImages(
      imageData[rowindex].images.map((el) => ({
        id: el.id,
        url: el.image_url,
        name: el.image_name,
        size: el.size,
      })),
    );
  }, [imageData, rowindex]);

  // hande the image changed
  const handleImageChange = useCallback(
    (oldImages, newImages) => {
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
                image_type_id: imageTypeId,
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
    [upsertProductPageData, imageTypeId, pageData.id],
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
        setImageTypeId(null);
        setTimeout(() => {
          setImageTypeId(ov);
        }, 0);
        return;
      } else {
        setImageTypeId(nv);
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
    <>
      <Main_FileUploads
        mode="image"
        label="Description"
        onError={handleImageError}
        onChange={handleImageChange}
        defaultImages={defaultImages}
      />
      <Main_FileUploads
        mode="image"
        label="Display"
        onError={handleImageError}
        onChange={handleImageChange}
        defaultImages={defaultImages}
      />
      <Main_FileUploads
        mode="file"
        label="Video"
        onError={handleImageError}
        onChange={handleImageChange}
        defaultImages={defaultImages}
      />
      <Main_Dropdown
        defaultOptions={productImageType}
        defaultSelectedOption={imageTypeId}
        label="Image Type"
        onChange={handleImageTypeChange}
      />
    </>
  );
};

export default Sub_ProductImagesRow;

/*
Q: 
But the old value is: 
User cancelled the image type switch:  {from: 'Amazon', to: '1688'}

Why did not update back to Amazon?

A:
The reason setImageTypeId(ov) (or Amazon) might not visually revert the dropdown back to "Amazon" is likely because the Main_Dropdown component's internal state mechanism isn't picking up the change.

When you call setImageTypeId(ov), you are setting the state to what it already was ("Amazon").
React's diffing algorithm sees:

Current State: "Amazon"
New State: "Amazon"
Because the value is identical, React skips the re-render for Sub_ProductImagesRow. Consequently, Main_Dropdown receives the same props as the previous render cycle.

The Main_Dropdown component relies on its useEffect hook to sync its internal state with the defaultSelectedOption prop.
*/
