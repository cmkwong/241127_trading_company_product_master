import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_DropZone.module.css';
import Sub_ImagePreview from './Sub_ImagePreview';

const Sub_DropZone = ({
  onFileSelect,
  isDragging,
  setIsDragging,
  disabled,
  maxFiles,
  maxSizeInMB,
  acceptedTypes,
  multiple,
  showPreview = true,
  showMaxImagesNotice = true,
  images = [],
  onRemoveImage,
  onMoveImage, // Received from parent
}) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e) => {
    onFileSelect(e.target.files);
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
      // This handles FILE drops from desktop
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files);
      }
    }
  };

  const canAddMoreImages = images.length < maxFiles;

  return (
    <div
      className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${
        disabled ? styles.disabled : ''
      } ${images.length > 0 ? styles.hasImages : ''} ${
        !showMaxImagesNotice && images.length > 0
          ? styles.fullSizeContainer
          : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-testid="image-upload-dropzone"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        multiple={multiple}
        disabled={disabled || !canAddMoreImages}
        className={styles.fileInput}
        data-testid="image-upload-input"
      />

      <div className={styles.dropZoneContent}>
        {showPreview && images.length > 0 && (
          <div
            className={`${styles.imagePreviewContainer} ${
              !showMaxImagesNotice ? styles.fullSizePreviewContainer : ''
            }`}
          >
            {images.map((image, i) => (
              <Sub_ImagePreview
                key={image.id || i} // Use ID if available for better React reconciliation
                index={i} // Pass index
                image={image}
                onRemove={() => onRemoveImage(i)} // Pass index to remove
                onMove={onMoveImage} // Pass move function
                disabled={disabled}
                fullSizePreview={!showMaxImagesNotice}
              />
            ))}
          </div>
        )}

        {(canAddMoreImages || showMaxImagesNotice) && (
          <div
            className={`${styles.uploadPrompt} ${
              images.length > 0 ? styles.uploadPromptWithImages : ''
            }`}
            onClick={canAddMoreImages ? handleUploadClick : undefined}
          >
            {canAddMoreImages && (
              <div className={styles.uploadIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </div>
            )}

            {canAddMoreImages && (
              <>
                <div className={styles.uploadText}>
                  {isDragging
                    ? 'Drop images here'
                    : images.length > 0
                    ? 'Click or drop to add more images'
                    : 'Click to upload or drag images here'}
                </div>

                <div className={styles.uploadInfo}>
                  {`${images.length}/${maxFiles} images, up to ${maxSizeInMB}MB each`}
                </div>
              </>
            )}

            {/* Show notice if max images reached */}
            {!canAddMoreImages && showMaxImagesNotice && (
              <div className={styles.maxImagesNotice}>
                Maximum {maxFiles} images reached
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Sub_DropZone.propTypes = {
  // ... props
  onMoveImage: PropTypes.func,
};

export default Sub_DropZone;
