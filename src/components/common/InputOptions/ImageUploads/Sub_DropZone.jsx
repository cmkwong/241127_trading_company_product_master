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
}) => {
  const fileInputRef = useRef(null);

  // Handle click on the upload icon/area
  const handleUploadClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    onFileSelect(e.target.files);
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  // Handle drag events
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
      onFileSelect(e.dataTransfer.files);
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

      {/* Always show the upload area - with different content based on whether images exist */}
      <div className={styles.dropZoneContent}>
        {/* Show previews if we have images and showPreview is true */}
        {showPreview && images.length > 0 && (
          <div
            className={`${styles.imagePreviewContainer} ${
              !showMaxImagesNotice ? styles.fullSizePreviewContainer : ''
            }`}
          >
            {images.map((image, i) => (
              <Sub_ImagePreview
                key={i}
                image={image}
                onRemove={onRemoveImage}
                disabled={disabled}
                fullSizePreview={!showMaxImagesNotice}
              />
            ))}
          </div>
        )}

        {/* Only show upload prompt if we can add more images or showMaxImagesNotice is true */}
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

            {/* Show the upload text and info if we can add more images */}
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

            {/* Show the maximum images reached notice only if requested */}
            {!canAddMoreImages && showMaxImagesNotice && (
              <>
                <div className={styles.uploadIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
                <div className={styles.uploadText}>
                  {`Maximum ${maxFiles} images reached`}
                </div>
                <div className={styles.uploadInfo}>
                  {`To add more images, remove some first`}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Sub_DropZone.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  setIsDragging: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  maxFiles: PropTypes.number.isRequired,
  maxSizeInMB: PropTypes.number.isRequired,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  multiple: PropTypes.bool,
  showPreview: PropTypes.bool,
  showMaxImagesNotice: PropTypes.bool,
  images: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      type: PropTypes.string,
      id: PropTypes.string.isRequired,
    })
  ),
  onRemoveImage: PropTypes.func,
};

export default Sub_DropZone;
