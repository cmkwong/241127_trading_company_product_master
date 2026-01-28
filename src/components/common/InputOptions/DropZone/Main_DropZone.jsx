import { useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_DropZone.module.css';

/**
 * Main_DropZone Component
 * A unified drop zone component that can be used for both image and file uploads
 * Handles file drag & drop and selection functionality
 */
const Main_DropZone = ({
  // Core functionality
  onFileSelect,
  isDragging,
  setIsDragging,
  disabled,

  // Configuration
  maxFiles,
  maxSizeInMB,
  acceptedTypes,
  multiple,

  // Items (files/images)
  items = [],
  onRemoveItem,
  onMoveItem,

  // Preview/Display
  PreviewComponent,
  showPreview = true,
  showMaxItemsNotice = true,

  // Styling/Labels
  itemType = 'files', // 'files' or 'images'
  testIdPrefix = 'file', // 'file' or 'image'
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

  const canAddMoreItems = items.length < maxFiles;
  const hasItems = items.length > 0;

  return (
    <div
      className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${
        disabled ? styles.disabled : ''
      } ${hasItems ? styles.hasItems : ''} ${
        !showMaxItemsNotice && hasItems ? styles.fullSizeContainer : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-testid={`${testIdPrefix}-upload-dropzone`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.length > 0 ? acceptedTypes.join(',') : undefined}
        onChange={handleFileInputChange}
        multiple={multiple}
        disabled={disabled || !canAddMoreItems}
        className={styles.fileInput}
        data-testid={`${testIdPrefix}-upload-input`}
      />

      <div className={styles.dropZoneContent}>
        {/* Show preview/list if we have items and a PreviewComponent */}
        {showPreview && hasItems && PreviewComponent && (
          <div
            className={`${styles.previewContainer} ${
              !showMaxItemsNotice ? styles.fullSizePreviewContainer : ''
            }`}
          >
            {items.map((item, i) => (
              <PreviewComponent
                key={item.id || i}
                index={i}
                item={item}
                // For backwards compatibility with specific component props
                image={item}
                file={item}
                onRemove={() => onRemoveItem && onRemoveItem(i)}
                onMove={onMoveItem}
                disabled={disabled}
                fullSizePreview={!showMaxItemsNotice}
              />
            ))}
          </div>
        )}

        {/* Show upload prompt if we can add more or if max notice should be shown */}
        {(canAddMoreItems || showMaxItemsNotice) && (
          <div
            className={`${styles.uploadPrompt} ${
              hasItems ? styles.uploadPromptWithItems : ''
            }`}
            onClick={canAddMoreItems ? handleUploadClick : undefined}
          >
            {canAddMoreItems && (
              <div className={styles.uploadIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  {hasItems ? (
                    // Plus icon for adding more
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  ) : (
                    // Upload icon for initial upload
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                  )}
                </svg>
              </div>
            )}

            {canAddMoreItems && (
              <>
                <div className={styles.uploadText}>
                  {isDragging
                    ? `Drop ${itemType} here`
                    : hasItems
                      ? `Click or drop to add more ${itemType}`
                      : `Click to upload or drag ${itemType} here`}
                </div>

                <div className={styles.uploadInfo}>
                  {`${items.length}/${maxFiles} ${itemType}, up to ${maxSizeInMB}MB each`}
                  {acceptedTypes.length > 0 && (
                    <div className={styles.acceptedTypes}>
                      Accepted types: {acceptedTypes.join(', ')}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Show notice if max items reached */}
            {!canAddMoreItems && showMaxItemsNotice && (
              <div className={styles.maxItemsNotice}>
                Maximum {maxFiles} {itemType} reached
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Main_DropZone.propTypes = {
  // Core functionality
  onFileSelect: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  setIsDragging: PropTypes.func.isRequired,
  disabled: PropTypes.bool,

  // Configuration
  maxFiles: PropTypes.number.isRequired,
  maxSizeInMB: PropTypes.number.isRequired,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  multiple: PropTypes.bool,

  // Items
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      size: PropTypes.number,
      type: PropTypes.string,
    }),
  ),
  onRemoveItem: PropTypes.func,
  onMoveItem: PropTypes.func,

  // Preview/Display
  PreviewComponent: PropTypes.elementType,
  showPreview: PropTypes.bool,
  showMaxItemsNotice: PropTypes.bool,

  // Styling/Labels
  itemType: PropTypes.string,
  testIdPrefix: PropTypes.string,
};

export default Main_DropZone;
