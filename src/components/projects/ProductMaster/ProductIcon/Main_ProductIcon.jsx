import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_ProductIcon.module.css';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { useProductContext } from '../../../../store/ProductContext';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import { objectUrlToDataUri } from '../../../../utils/objectUrlUtils';

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
  useMemo(() => {
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
    }
  }, [pageData.id, pageData.icon_url, pageData.icon_name]);

  // Handle image changes from the ImageUpload component
  const handleImageChange = async (_, updatedImages) => {
    // Get the first image if it exists
    const newImage =
      updatedImages && updatedImages.length > 0 ? updatedImages[0] : null;
    console.log('New image selected: ', newImage);
    // Update the context with the new image
    if (!newImage) {
      updateProductPageData('root', {
        icon_url: '',
        base64_image: '',
        icon_name: '',
      });
      return;
    }
    updateProductPageData('root', {
      icon_url: newImage.url || '',
      base64_image: (await objectUrlToDataUri(newImage.file)) || '',
      icon_name: newImage.name || '',
    });

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
    updateProductPageData('root', { id: value });
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
            showMaxImagesNotice={showMaxImagesNotice}
          />
        </div>
        <Main_TextField
          placeholder={'Product ID'}
          defaultValue={id}
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
