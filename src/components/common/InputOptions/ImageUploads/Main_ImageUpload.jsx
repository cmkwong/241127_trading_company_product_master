import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_ImageUpload.module.css';
import Sub_ImagePreview from './Sub_ImagePreview';
import Sub_DropZone from './Sub_DropZone';

/**
 * Main_ImageUpload Component
 * A component for uploading and displaying images
 */
const Main_ImageUpload = (props) => {
  const {
    // Callbacks
    onChange = () => {},
    onError = () => {},

    // Configuration
    maxFiles = 5,
    maxSizeInMB = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'],

    // UI
    label,
    multiple = true,
    disabled = false,
    showPreview = true, // New prop to control preview visibility

    // Initial state
    defaultImages = [],
  } = props;

  // State to store uploaded images
  const [images, setImages] = useState(defaultImages);
  const [isDragging, setIsDragging] = useState(false);

  // Update internal state when defaultImages prop changes
  useEffect(() => {
    setImages(defaultImages);
  }, [defaultImages]);

  // Handle file selection
  const handleFileSelection = useCallback(
    (files) => {
      // Check if adding these files would exceed the max count
      if (images.length + files.length > maxFiles) {
        onError(`You can only upload a maximum of ${maxFiles} images.`);
        return;
      }

      const newImages = [];
      const errors = [];

      Array.from(files).forEach((file) => {
        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
          errors.push(`File "${file.name}" is not a supported image type.`);
          return;
        }

        // Validate file size
        if (file.size > maxSizeInMB * 1024 * 1024) {
          errors.push(
            `File "${file.name}" exceeds the maximum size of ${maxSizeInMB}MB.`
          );
          return;
        }

        // Create object URL for preview
        const imageUrl = URL.createObjectURL(file);
        newImages.push({
          file,
          url: imageUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      });

      // Report any errors
      if (errors.length > 0) {
        onError(errors.join('\n'));
      }

      // Update state with new images
      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onChange(updatedImages);
      }
    },
    [images, maxFiles, maxSizeInMB, acceptedTypes, onChange, onError]
  );

  // Handle image removal
  const handleRemoveImage = useCallback(
    (id) => {
      if (disabled) return;

      const updatedImages = images.filter((image) => image.id !== id);
      setImages(updatedImages);
      onChange(updatedImages);
    },
    [disabled, images, onChange]
  );

  return (
    <div className={styles.imageUploadContainer}>
      {label && <label className={styles.label}>{label}</label>}

      <Sub_DropZone
        onFileSelect={handleFileSelection}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        disabled={disabled}
        maxFiles={maxFiles}
        maxSizeInMB={maxSizeInMB}
        acceptedTypes={acceptedTypes}
        multiple={multiple}
        showPreview={showPreview}
        images={images}
        onRemoveImage={handleRemoveImage}
      />
    </div>
  );
};

Main_ImageUpload.propTypes = {
  // Callbacks
  onChange: PropTypes.func,
  onError: PropTypes.func,

  // Configuration
  maxFiles: PropTypes.number,
  maxSizeInMB: PropTypes.number,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),

  // UI
  label: PropTypes.string,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  showPreview: PropTypes.bool, // Added prop type for showPreview

  // Initial state
  defaultImages: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      type: PropTypes.string,
      id: PropTypes.string.isRequired,
    })
  ),
};

export default Main_ImageUpload;
