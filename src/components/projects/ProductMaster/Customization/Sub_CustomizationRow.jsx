import { useCallback, useEffect, useState } from 'react';
import styles from './Sub_CustomizationRow.module.css';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { mockSuppliers } from '../../../../datas/Suppliers/mockSuppliers';
import { useProductContext } from '../../../../store/ProductContext';
import { v4 as uuidv4 } from 'uuid';
const Sub_CustomizationRow = (props) => {
  const { customizations, rowindex } = props;

  const { pageData, upsertProductPageData } = useProductContext();
  const [customization, setCustomization] = useState(customizations[rowindex]);

  useEffect(() => {
    setCustomization(customizations[rowindex]);
  }, [customizations, rowindex]);

  const handleNameChange = (ov, nv) => {
    upsertProductPageData('product_customizations', {
      id: customization.id,
      product_id: pageData.id,
      name: nv,
    });
  };

  const handleCodeChange = (ov, nv) => {
    upsertProductPageData('product_customizations', {
      id: customization.id,
      product_id: pageData.id,
      code: nv,
    });
  };

  const handleRemarkChange = (ov, nv) => {
    upsertProductPageData('product_customizations', {
      id: customization.id,
      product_id: pageData.id,
      remark: nv,
    });
  };

  // Main_FileUploads passes the array directly, not an object.
  const handleImageChange = (ov, nv) => {
    if (nv.length > ov.length) {
      // Image(s) added
      const addedImages = nv.filter(
        (newImg) => !ov.some((oldImg) => oldImg.id === newImg.id),
      );

      // Handle each added image individually
      addedImages.forEach((addedImage, index) => {
        upsertProductPageData(
          'product_customizations.product_customization_images',
          {
            id: addedImage.id,
            customization_id: customization.id,
            image_name: addedImage.name,
            image_url: addedImage.url,
            display_order: ov.length + index + 1,
          },
        );
      });
    } else if (nv.length < ov.length) {
      // Image(s) removed
      const removedImages = ov.filter(
        (oldImg) => !nv.some((newImg) => newImg.id === oldImg.id),
      );

      // Handle each removed image individually
      removedImages.forEach((removedImage) => {
        upsertProductPageData(
          'product_customizations.product_customization_images',
          {
            id: removedImage.id,
            _delete: true,
          },
        );
      });
    }
  };

  // Handle image upload errors
  const handleImageError = (error) => {
    console.error('Image upload error:', error);
    // You could add a toast notification here
  };

  return (
    <>
      <div className={styles.textInput}>
        <Main_TextField
          placeholder={'Customization Title'}
          onChange={handleNameChange}
          defaultValue={customization?.name}
        />
        <Main_Suggest
          defaultSuggestions={mockSuppliers.map((supplier) => supplier.code)}
          placeholder={'Suppliers'}
          onChange={handleCodeChange}
          defaultValue={customization?.code}
        />
        <Main_TextArea
          onChange={handleRemarkChange}
          placeholder={'Customization remarks ... '}
          defaultValue={customization?.remark}
        />
      </div>
      <Main_FileUploads
        mode="image"
        onError={handleImageError}
        onChange={handleImageChange}
        maxFiles={10}
        maxSizeInMB={5}
        defaultImages={
          customization?.product_customization_images?.map((img) => ({
            id: img.id,
            url: img.image_url,
            name: img.image_name,
          })) || []
        }
      />
    </>
  );
};

export default Sub_CustomizationRow;
