import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_ProductIcon.module.css';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { useProductContext } from '../../../../store/ProductContext';
import Main_ImageUpload from '../../../common/InputOptions/ImageUploads/Main_ImageUpload';

/**
 * Main_ProductIcon Component
 * Allows selection and display of a single product image
 */
const Main_ProductIcon = ({
  onChange = () => {},
  showMaxImagesNotice = false,
}) => {
  const { pageData, updateProductPageData } = useProductContext();

  // product ID state setup
  const [id, setId] = useState(pageData.id || '');
  const [defaultImages, setDefaultImages] = useState([]);

  // Process the image URL from pageData
  useEffect(() => {
    setId(pageData.id || '');

    // Process iconUrl into the format expected by Main_ImageUpload
    if (pageData.iconUrl) {
      // If iconUrl is already an object with url property
      if (typeof pageData.iconUrl === 'object' && pageData.iconUrl.url) {
        setDefaultImages([pageData.iconUrl]);
      }
      // If iconUrl is a string URL
      else if (
        typeof pageData.iconUrl === 'string' &&
        pageData.iconUrl.trim() !== ''
      ) {
        setDefaultImages([pageData.iconUrl]);
      }
      // Otherwise, clear the images
      else {
        setDefaultImages([]);
      }
    } else {
      setDefaultImages([]);
    }
  }, [pageData.id, pageData.iconUrl]);

  // Handle image changes from the ImageUpload component
  const handleImageChange = (updatedImages) => {
    // Get the first image if it exists
    const newImage =
      updatedImages && updatedImages.length > 0 ? updatedImages[0] : null;

    // Update the context with the new image
    updateProductPageData('iconUrl', newImage);

    // Call the onChange prop
    onChange(newImage);
  };

  // Handle errors from the ImageUpload component
  const handleImageError = (errorMessage) => {
    console.error('Image upload error:', errorMessage);
    // You could show a toast notification or alert here
  };

  // Handle product ID changes
  const handleProductIdChange = (value) => {
    setId(value);
    updateProductPageData('id', value);
  };

  return (
    <Main_InputContainer label="Product Icon">
      <div className={styles.productIconContainer}>
        <div className={styles.iconUploadContainer}>
          <Main_ImageUpload
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
            showMaxImagesNotice={showMaxImagesNotice}
          />
        </div>
        <Main_TextField
          placeholder={'Product ID'}
          value={id}
          onChange={handleProductIdChange}
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
