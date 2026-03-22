import { useCallback, useEffect, useState } from 'react';
import styles from './Sub_CustomizationRow.module.css';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { mockSuppliers } from '../../../../datas/Suppliers/mockSuppliers';
import { useProductContext } from '../../../../store/ProductContext';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import { sortByDisplayOrder } from '../../../../utils/arr';
const Sub_CustomizationRow = (props) => {
  const { customizations, rowindex } = props;

  const { pageData, upsertProductPageData } = useProductContext();
  const [customization, setCustomization] = useState(customizations[rowindex]);

  useEffect(() => {
    setCustomization(customizations[rowindex]);
  }, [customizations, rowindex]);

  const handleNameChange = (ov, nv) => {
    upsertProductPageData({
      product_customizations: [
        {
          id: customization.id,
          product_id: pageData.id,
          name: nv,
        },
      ],
    });
  };

  const handleCodeChange = (ov, nv) => {
    console.log('Code changed:', nv);
    upsertProductPageData({
      product_customizations: [
        {
          id: customization.id,
          product_id: pageData.id,
          code: nv,
        },
      ],
    });
  };

  const handleRemarkChange = (ov, nv) => {
    upsertProductPageData({
      product_customizations: [
        {
          id: customization.id,
          product_id: pageData.id,
          remark: nv,
        },
      ],
    });
  };

  // Main_FileUploads passes the array directly, not an object.
  const handleImageChange = (ov = [], nv = []) => {
    const oldList = Array.isArray(ov) ? ov : [];
    const newList = Array.isArray(nv) ? nv : [];

    const removedImages = oldList.filter(
      (oldImg) => !newList.some((newImg) => newImg.id === oldImg.id),
    );
    const addedImages = newList.filter(
      (newImg) => !oldList.some((oldImg) => oldImg.id === newImg.id),
    );

    const sameLength = oldList.length === newList.length;
    const sameOrder =
      sameLength && oldList.every((img, i) => img.id === newList[i]?.id);

    if (removedImages.length === 0 && addedImages.length === 0 && sameOrder) {
      return;
    }

    if (removedImages.length > 0) {
      upsertProductPageData({
        product_customizations: [
          {
            id: customization.id,
            product_customization_images: removedImages.map((removedImage) => ({
              id: removedImage.id,
              _delete: true,
            })),
          },
        ],
      });
    }

    if (newList.length > 0) {
      const addedImageIds = new Set(addedImages.map((img) => img.id));

      upsertProductPageData({
        product_customizations: [
          {
            id: customization.id,
            product_customization_images: newList.map((img, index) => ({
              id: img.id,
              customization_id: customization.id,
              display_order: index + 1,
              ...(addedImageIds.has(img.id)
                ? {
                    image_name: img.name,
                    image_url: img.url,
                  }
                : {}),
            })),
          },
        ],
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
      <SplitLayout position="L">
        <VerticalLayout>
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
        </VerticalLayout>

        <Main_FileUploads
          mode="image"
          onError={handleImageError}
          onChange={handleImageChange}
          maxFiles={10}
          maxSizeInMB={5}
          defaultImages={sortByDisplayOrder(
            customization?.product_customization_images || [],
          ).map((img) => ({
            id: img.id,
            url: img.image_url,
            name: img.image_name,
            display_order: img.display_order,
          }))}
        />
      </SplitLayout>
    </>
  );
};

export default Sub_CustomizationRow;
