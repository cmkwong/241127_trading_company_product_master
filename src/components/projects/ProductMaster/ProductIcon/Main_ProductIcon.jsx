import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_ProductIcon.module.css';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { useProductContext } from '../../../../store/ProductContext';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';

/**
 * Main_ProductIcon Component
 * Allows selection and display of a single product image
 */
const Main_ProductIcon = ({ showMaxImagesNotice = false }) => {
  const { pageData, upsertProductPageData } = useProductContext();

  // product ID state setup
  const [id, setId] = useState(pageData.id || '');
  const [defaultImages, setDefaultImages] = useState([]);

  // Process the image URL from pageData
  useEffect(() => {
    setId(pageData.id || '');

    const hasIconUrl =
      pageData?.icon_url &&
      typeof pageData.icon_url === 'string' &&
      pageData.icon_url.trim() !== '';

    if (hasIconUrl) {
      setDefaultImages([
        {
          url: pageData.icon_url,
          name: pageData?.icon_name || 'product-icon',
        },
      ]);
    } else {
      setDefaultImages([]);
    }
  }, [pageData.id, pageData.icon_url, pageData.icon_name]);

  // Handle image changes from the ImageUpload component
  const handleImageChange = async (oldImages, newImages) => {
    if (newImages.length > oldImages.length) {
      // New image added
      const addedImages = newImages.filter(
        (img) => !oldImages.some((oldImg) => oldImg.id === img.id),
      );
      for (let i = 0; i < addedImages.length; i++) {
        upsertProductPageData({
          icon_url: addedImages[i].url || '',
          icon_name: addedImages[i].name || '',
          _base64_changed: true, // Flag to indicate this is a base64 change for backend processing
        });
      }
    } else if (newImages.length < oldImages.length) {
      // Image removed, handle deletion in context
      const removedImages = oldImages.filter(
        (img) => !newImages.some((newImg) => newImg.id === img.id),
      );
      for (let i = 0; i < removedImages.length; i++) {
        upsertProductPageData({
          icon_url: '',
          icon_name: '',
        });
      }
    }
  };

  // Handle errors from the ImageUpload component
  const handleImageError = (errorMessage) => {
    console.error('Image upload error:', errorMessage);
    // You could show a toast notification or alert here
  };

  return (
    <Main_InputContainer label="Product Icon">
      <div className={styles.productIconContainer}>
        <div className={styles.iconUploadContainer}>
          <Main_FileUploads
            mode="image"
            onChange={handleImageChange}
            onError={handleImageError}
            maxFiles={1}
            multiple={false}
            defaultImages={defaultImages}
            showPreview={true}
            acceptedTypes={[
              'image/jpeg',
              'image/png',
              'image/gif',
              'image/webp',
            ]}
            maxSizeInMB={5}
            showMaxItemsNotice={showMaxImagesNotice}
          />
        </div>
        <Main_TextField
          placeholder={'Product ID'}
          defaultValue={id}
          onChange={() => {}}
          disabled={true} // Product ID is typically not editable, set to true to disable
        />
      </div>
    </Main_InputContainer>
  );
};

Main_ProductIcon.propTypes = {
  onChange: PropTypes.func, // Callback when image changes
  showMaxImagesNotice: PropTypes.bool, // Whether to show "Maximum 1 images reached" notice
};

export default Main_ProductIcon;
