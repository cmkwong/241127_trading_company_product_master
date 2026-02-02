import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMasterContext } from '../../../../store/MasterContext';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import { useProductContext } from '../../../../store/ProductContext';

const Sub_ProductImagesRow = (props) => {
  const { data, rowIndex = 0, setRowRef } = props;

  const [imageTypeId, setImageTypeId] = useState();

  // Handle image upload errors
  const handleImageError = useCallback((error) => {
    console.error('Image upload error:', error);
  }, []);

  const handleImageChange = useCallback((images) => {
    console.log('Uploaded images: ', images);
    // setDefaultImages(images);
  }, []);

  const { pageData, updateProductPageData } = useProductContext();
  const { productImageType } = useMasterContext();
  const [defaultImages, setDefaultImages] = useState([]);
  console.log('Product Image in pageData: ', pageData);

  // assign set default images when data changes
  useEffect(() => {
    if (data && data.length === 0) return;
    if (!data[rowIndex]) return;
    console.log('data[rowIndex]: ', data[rowIndex]);
    // let [imageTypeId, images] = Object.entries(data[rowIndex])[0];

    setImageTypeId(data[rowIndex].id);
    setDefaultImages(data[rowIndex].images.map((el) => el.image_url));
  }, [data, rowIndex]);

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
