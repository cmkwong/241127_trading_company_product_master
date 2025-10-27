import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import Main_ImageUpload from '../../../common/InputOptions/ImageUploads/Main_ImageUpload';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Sub_ImagePreview from '../../../common/InputOptions/ImageUploads/Sub_ImagePreview';
import styles from './Sub_ProductLinkRow.module.css';

const Sub_ProductLinkRow = () => {
  // Each row has its own images state
  const [images, setImages] = useState([]);

  // handler for image uploads
  const handleImageChange = useCallback((updatedImages) => {
    setImages(updatedImages);
  }, []);

  // Handle image upload errors
  const handleImageError = (error) => {
    console.error('Image upload error:', error);
    // You could add a toast notification here
  };

  return (
    <div className={styles.rowContainer}>
      <Main_TextField placeholder={'Link'} />
      <div className={styles.contentRow}>
        <div className={styles.inputsColumn}>
          <Main_ImageUpload
            onError={handleImageError}
            onChange={handleImageChange}
            defaultImages={images}
          />
          <Main_TextArea label={'Remark'} />
          <Main_DateSelector />
        </div>
        {/* {images.length > 0 && (
          <div className={styles.previewContainer}>
            <div className={styles.previewGrid}>
              {images.map((image) => (
                <Sub_ImagePreview
                  key={image.id}
                  image={image}
                  onRemove={handleRemoveImage}
                />
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Sub_ProductLinkRow;
