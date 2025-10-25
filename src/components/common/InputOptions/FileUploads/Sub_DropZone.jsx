import { useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_DropZone.module.css';
import Sub_FileList from './Sub_FileList';

/**
 * Sub_DropZone Component
 * Handles file drag & drop and selection functionality
 */
const Sub_DropZone = ({
  onFileSelect,
  isDragging,
  setIsDragging,
  disabled,
  maxFiles,
  maxSizeInMB,
  acceptedTypes,
  multiple,
  files = [],
  onRemoveFile,
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
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
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
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const canAddMoreFiles = files.length < maxFiles;

  return (
    <div
      className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${
        disabled ? styles.disabled : ''
      } ${files.length > 0 ? styles.hasFiles : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-testid="file-upload-dropzone"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.length > 0 ? acceptedTypes.join(',') : undefined}
        onChange={handleFileInputChange}
        multiple={multiple}
        disabled={disabled || !canAddMoreFiles}
        className={styles.fileInput}
        data-testid="file-upload-input"
      />

      <div className={styles.dropZoneContent}>
        {/* Show file list if we have files */}
        {files.length > 0 && (
          <div className={styles.fileListContainer}>
            <Sub_FileList
              files={files}
              onRemoveFile={onRemoveFile}
              disabled={disabled}
            />
          </div>
        )}

        {/* Always show upload prompt, but style differently based on whether we have files */}
        <div
          className={`${styles.uploadPrompt} ${
            files.length > 0 ? styles.uploadPromptWithFiles : ''
          }`}
          onClick={canAddMoreFiles ? handleUploadClick : undefined}
        >
          <div className={styles.uploadIcon}>
            {canAddMoreFiles ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                {files.length > 0 ? (
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                ) : (
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                )}
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            )}
          </div>

          <div className={styles.uploadText}>
            {isDragging
              ? 'Drop files here'
              : canAddMoreFiles
              ? files.length > 0
                ? 'Click or drop to add more files'
                : 'Click to upload or drag files here'
              : `Maximum ${maxFiles} files reached`}
          </div>

          <div className={styles.uploadInfo}>
            {canAddMoreFiles
              ? `${files.length}/${maxFiles} files, up to ${maxSizeInMB}MB each`
              : `To add more files, remove some first`}
            {acceptedTypes.length > 0 && canAddMoreFiles && (
              <div className={styles.acceptedTypes}>
                Accepted types: {acceptedTypes.join(', ')}
              </div>
            )}
          </div>
        </div>
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
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      type: PropTypes.string,
      id: PropTypes.string.isRequired,
    })
  ),
  onRemoveFile: PropTypes.func,
};

export default Sub_DropZone;
