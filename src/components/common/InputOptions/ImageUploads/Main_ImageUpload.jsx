import { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_ImageUpload.module.css';
import Sub_DropZone from './Sub_DropZone';

/**
 * Main_ImageUpload Component
 */
const Main_ImageUpload = (props) => {
  const {
    onChange = () => {},
    onError = () => {},
    maxFiles = 5,
    maxSizeInMB = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    label,
    multiple = true,
    disabled = false,
    showPreview = true,
    showMaxImagesNotice = true,
    defaultImages = [],
  } = props;

  // Helper to process images and ensure they have IDs
  const processDefaultImages = useCallback((imgs) => {
    if (!Array.isArray(imgs)) return [];

    return imgs.map((image) => {
      if (typeof image === 'string') {
        const url = image;
        const name = url.split('/').pop() || 'image';
        let type = 'image/jpeg';
        if (url.endsWith('.png')) type = 'image/png';
        else if (url.endsWith('.gif')) type = 'image/gif';

        return {
          url,
          name,
          size: 100000,
          type,
          id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
      }

      if (typeof image === 'object') {
        const processed = { ...image };
        if (!processed.name && processed.url) {
          processed.name = processed.url.split('/').pop() || 'image';
        }
        if (!processed.size) processed.size = 100000;
        if (!processed.type) processed.type = 'image/jpeg';
        // Only add ID if missing, to preserve identity across renders
        if (!processed.id) {
          processed.id = `image-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        }
        return processed;
      }

      return {
        url: '',
        name: 'unknown',
        size: 0,
        type: 'image/jpeg',
        id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    });
  }, []);

  const [images, setImages] = useState(() =>
    processDefaultImages(defaultImages)
  );
  const [isDragging, setIsDragging] = useState(false);

  // --- UPDATED: Safe useEffect to prevent loops ---
  useEffect(() => {
    const newProcessedImages = processDefaultImages(defaultImages);

    // Check if the new images are actually different from current state
    // This prevents infinite loops when parent passes new array reference with same content
    setImages((currentImages) => {
      if (newProcessedImages.length !== currentImages.length) {
        return newProcessedImages;
      }

      const isDifferent = newProcessedImages.some((img, index) => {
        const current = currentImages[index];
        // Compare URL or ID to determine if it's a different image
        return (
          img.url !== current.url || (img.file && img.file !== current.file)
        );
      });

      if (isDifferent) {
        return newProcessedImages;
      }

      return currentImages;
    });
  }, [defaultImages, processDefaultImages]);

  const handleMoveImage = (dragIndex, insertIndex) => {
    const updatedImages = [...images];
    const [draggedItem] = updatedImages.splice(dragIndex, 1);

    let finalIndex = insertIndex;
    if (dragIndex < insertIndex) {
      finalIndex = insertIndex - 1;
    }

    updatedImages.splice(finalIndex, 0, draggedItem);

    setImages(updatedImages);
    onChange(updatedImages);
  };

  const handleFileSelection = useCallback(
    (files) => {
      if (images.length + files.length > maxFiles) {
        onError(`You can only upload a maximum of ${maxFiles} images.`);
        return;
      }

      const newImages = [];
      const errors = [];

      Array.from(files).forEach((file) => {
        if (!acceptedTypes.includes(file.type)) {
          errors.push(`File "${file.name}" is not a supported image type.`);
          return;
        }

        if (file.size > maxSizeInMB * 1024 * 1024) {
          errors.push(
            `File "${file.name}" exceeds the maximum size of ${maxSizeInMB}MB.`
          );
          return;
        }

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

      if (errors.length > 0) {
        onError(errors.join('\n'));
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onChange(updatedImages);
      }
    },
    [images, maxFiles, acceptedTypes, maxSizeInMB, onError, onChange]
  );

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    onChange(updatedImages);
  };

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
        showMaxImagesNotice={showMaxImagesNotice}
        images={images}
        onRemoveImage={handleRemoveImage}
        onMoveImage={handleMoveImage}
      />
    </div>
  );
};

Main_ImageUpload.propTypes = {
  onChange: PropTypes.func,
  onError: PropTypes.func,
  maxFiles: PropTypes.number,
  maxSizeInMB: PropTypes.number,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  defaultImages: PropTypes.array,
  showPreview: PropTypes.bool,
  showMaxImagesNotice: PropTypes.bool,
};

export default Main_ImageUpload;
