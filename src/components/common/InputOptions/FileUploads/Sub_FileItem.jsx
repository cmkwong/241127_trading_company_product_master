import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_FileItem.module.css';

/**
 * Sub_FileItem Component
 * Displays an individual file/image item with its details and a remove button
 * Supports drag-and-drop reordering for images
 */
const Sub_FileItem = ({
  file,
  index,
  onRemove,
  onMove,
  disabled,
  showAsImage = false,
  fullSizePreview = false,
}) => {
  const [dropPosition, setDropPosition] = useState(null);

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // If showing as image preview (and url exists)
  const isImagePreview = showAsImage && file.url;

  // Drag and drop handlers (for image reordering)
  const handleDragStart = (e) => {
    if (disabled || !onMove) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDropPosition(null);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDropPosition(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (disabled || !onMove) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 2) {
      setDropPosition('left');
    } else {
      setDropPosition('right');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropPosition(null);

    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    let insertIndex = index;
    if (dropPosition === 'right') {
      insertIndex = index + 1;
    }

    if (dragIndex === index && dropPosition === 'left') return;
    if (dragIndex === index && dropPosition === 'right') return;

    if (onMove) {
      onMove(dragIndex, insertIndex);
    }
  };

  // Determine shift classes for drag reordering
  let shiftClass = '';
  if (dropPosition === 'left') shiftClass = styles.shiftRight;
  if (dropPosition === 'right') shiftClass = styles.shiftLeft;

  // Render as image preview
  if (isImagePreview) {
    const name = file.name || 'Unknown file';

    return (
      <div
        className={`${styles.imagePreview} ${
          fullSizePreview ? styles.fullSizePreview : ''
        } ${shiftClass}`}
        draggable={!disabled && onMove}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        title={onMove ? 'Drag to reorder' : name}
      >
        {dropPosition === 'left' && (
          <div className={styles.dropIndicatorLeft} />
        )}
        {dropPosition === 'right' && (
          <div className={styles.dropIndicatorRight} />
        )}

        <img src={file.url} alt={name} className={styles.previewImg} />
        <div className={styles.imageInfo}>
          <div className={styles.imageName} title={name}>
            {name.length > 15 ? name.substring(0, 12) + '...' : name}
          </div>
          <div className={styles.imageSize}>
            {file.size ? (file.size / 1024).toFixed(0) + ' KB' : ''}
          </div>
        </div>

        {!disabled && (
          <button
            className={styles.removeButton}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            type="button"
            aria-label={`Remove ${name}`}
          >
            ×
          </button>
        )}
      </div>
    );
  }

  // Render as file list item
  return (
    <li className={styles.fileItem}>
      <div className={styles.fileInfo}>
        <div className={styles.fileIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        </div>
        <div className={styles.fileDetails}>
          <div className={styles.fileName}>{file.name}</div>
          <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
        </div>
      </div>
      <button
        className={styles.removeButton}
        onClick={() => onRemove()}
        disabled={disabled}
        aria-label={`Remove ${file.name}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </li>
  );
};

Sub_FileItem.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    type: PropTypes.string,
    id: PropTypes.string.isRequired,
    url: PropTypes.string, // For image preview
  }).isRequired,
  index: PropTypes.number,
  onRemove: PropTypes.func.isRequired,
  onMove: PropTypes.func,
  disabled: PropTypes.bool,
  showAsImage: PropTypes.bool,
  fullSizePreview: PropTypes.bool,
};

export default Sub_FileItem;
