import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMasterContext } from '../../../../store/MasterContext';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import { useProductContext } from '../../../../store/ProductContext';

const Sub_ProductImagesRow = (props) => {
  const { data, rowindex, setRowRef } = props;

  const [imageTypeId, setImageTypeId] = useState();

  const { pageData, upsertProductPageData } = useProductContext();
  const { productImageType } = useMasterContext();
  const [defaultImages, setDefaultImages] = useState([]);

  // assign set default images when data changes
  useEffect(() => {
    if (data && data.length === 0) return;
    if (!data[rowindex]) return;

    setImageTypeId(data[rowindex].id);
    setDefaultImages(
      data[rowindex].images.map((el) => ({
        id: el.id,
        url: el.image_url,
        name: el.image_name,
        size: el.size,
      })),
    );
  }, [data, rowindex]);

  // hande the image changed
  const handleImageChange = useCallback(
    (oldImages, newImages) => {
      if (newImages.length > oldImages.length) {
        // New image added
        const addedImages = newImages.filter(
          (img) => !oldImages.some((oldImg) => oldImg.id === img.id),
        );
        console.log('Uploaded images: ', addedImages);
        upsertProductPageData('product_images', {
          id: addedImages[0].id,
          product_id: pageData.id,
          image_type_id: imageTypeId,
          image_name: addedImages[0].name,
          image_url: addedImages[0].url,
          size: addedImages[0].size,
          display_order: newImages.length,
        });
      } else if (newImages.length < oldImages.length) {
        // Image removed
        const removedImages = oldImages.filter(
          (img) => !newImages.some((newImg) => newImg.id === img.id),
        );
        console.log('Removed images: ', removedImages);
        upsertProductPageData('product_images', {
          id: removedImages[0].id,
          _delete: true,
        });
      }
    },
    [upsertProductPageData, imageTypeId, pageData.id],
  );

  // Handle image upload errors
  const handleImageError = useCallback((error) => {
    console.error('Image upload error:', error);
  }, []);

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
        selectedOptions={imageTypeId}
        label="Image Type"
        // defaultSelectedOption={packing.type || 1}
        onChange={() => {}}
      />
    </>
  );
};

export default Sub_ProductImagesRow;
