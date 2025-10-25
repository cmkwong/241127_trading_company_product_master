import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_ProductIcon.module.css';
import Main_InputContainer from '../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_UploadArea from './Sub_UploadArea';
import Sub_IconPreview from './Sub_IconPreview';

/**
 * Main_ProductIcon Component
 * Allows selection and display of a single product image
 */
const Main_ProductIcon = ({ onChange = () => {} }) => {
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelection = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);

    const newImage = {
      file,
      url: imageUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    };

    setImage(newImage);
    onChange(newImage);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImage(null);
    onChange(null);
  };

  // Handle click on the upload button in the image preview
  const handleChangeClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Main_InputContainer label="Product Icon">
      <div className={styles.productIconContainer}>
        {!image ? (
          <Sub_UploadArea onFileSelect={handleFileSelection} />
        ) : (
          <Sub_IconPreview
            image={image}
            onChangeClick={handleChangeClick}
            onRemoveClick={handleRemoveImage}
          />
        )}
        {/* Hidden file input for the change button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelection(e.target.files[0]);
              e.target.value = ''; // Reset input
            }
          }}
          style={{ display: 'none' }}
        />
      </div>
    </Main_InputContainer>
  );
};

Main_ProductIcon.propTypes = {
  onChange: PropTypes.func, // Callback when image changes
};

export default Main_ProductIcon;
