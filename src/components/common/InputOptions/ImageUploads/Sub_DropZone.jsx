import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_DropZone.module.css';

const Sub_DropZone = ({
  onFileSelect,
  isDragging,
  setIsDragging,
  disabled,
  maxFiles,
  maxSizeInMB,
  acceptedTypes,
  multiple,
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

  return (
    <div
      className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${
        disabled ? styles.disabled : ''
      }`}
      onClick={handleUploadClick}
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
        disabled={disabled}
        className={styles.fileInput}
        data-testid="image-upload-input"
      />

      <div className={styles.uploadIcon}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
        </svg>
      </div>

      <div className={styles.uploadText}>
        {isDragging
          ? 'Drop images here'
          : 'Click to upload or drag images here'}
      </div>

      <div className={styles.uploadInfo}>
        {`Max ${maxFiles} files, up to ${maxSizeInMB}MB each`}
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
};

export default Sub_DropZone;
