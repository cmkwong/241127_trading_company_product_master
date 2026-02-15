import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMasterContext } from '../../../../store/MasterContext';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import { useProductContext } from '../../../../store/ProductContext';

const Sub_ProductImagesRow = (props) => {
  const { imageData, rowindex } = props;

  console.log(
    'Rendering Sub_ProductImagesRow with imageData:',
    imageData,
    'and rowindex:',
    rowindex,
  );

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

    setImageTypeId(imageData[rowindex].id);
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
        upsertProductPageData({
          product_images: [
            {
              id: addedImages[0].id,
              product_id: pageData.id,
              image_type_id: imageTypeId,
              image_name: addedImages[0].name,
              image_url: addedImages[0].url,
              size: addedImages[0].size,
              display_order: newImages.length,
            },
          ],
        });
      } else if (newImages.length < oldImages.length) {
        // Image removed
        const removedImages = oldImages.filter(
          (img) => !newImages.some((newImg) => newImg.id === img.id),
        );
        upsertProductPageData({
          product_images: [
            {
              id: removedImages[0].id,
              _delete: true,
            },
          ],
        });
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
      setImageTypeId(nv);
      // finding required image id
      const ids = pageData.product_images
        .filter((d) => d.image_type_id === ov)
        .map((d) => d.id);
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
    },
    [pageData.product_images, upsertProductPageData, pageData.id],
  );

  return (
    <>
      <Main_FileUploads
        mode="image"
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
