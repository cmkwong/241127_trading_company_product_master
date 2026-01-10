import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_ImagePreview.module.css';

const Sub_ImagePreview = ({
  image,
  index,
  onRemove,
  onMove,
  disabled,
  fullSizePreview = false,
}) => {
  // 'left', 'right', or null
  const [dropPosition, setDropPosition] = useState(null);

  if (!image || !image.url) {
    return null;
  }

  const name = image.name || 'Unknown file';

  const handleDragStart = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
    // Lower opacity to indicate this is the item being moved
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
    // Only clear if we are actually leaving the container
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDropPosition(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (disabled) return;

    // Calculate position within the element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Determine if we are on the left or right half
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

    // Calculate where to insert
    let insertIndex = index;
    if (dropPosition === 'right') {
      insertIndex = index + 1;
    }

    // Don't do anything if dropping on self
    if (dragIndex === index && dropPosition === 'left') return;
    if (dragIndex === index && dropPosition === 'right') return;

    if (onMove) {
      onMove(dragIndex, insertIndex);
    }
  };

  // Determine classes for shifting effect
  let shiftClass = '';
  if (dropPosition === 'left') shiftClass = styles.shiftRight;
  if (dropPosition === 'right') shiftClass = styles.shiftLeft;

  return (
    <div
      className={`${styles.imagePreview} ${
        fullSizePreview ? styles.fullSizePreview : ''
      } ${shiftClass}`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      title="Drag to reorder"
    >
      {/* Drop Indicators */}
      {dropPosition === 'left' && <div className={styles.dropIndicatorLeft} />}
      {dropPosition === 'right' && (
        <div className={styles.dropIndicatorRight} />
      )}

      <img src={image.url} alt={name} className={styles.previewImg} />
      <div className={styles.imageInfo}>
        <div className={styles.imageName} title={name}>
          {name.length > 15 ? name.substring(0, 12) + '...' : name}
        </div>
        <div className={styles.imageSize}>
          {image.size ? (image.size / 1024).toFixed(0) + ' KB' : ''}
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
        >
          ×
        </button>
      )}
    </div>
  );
};

Sub_ImagePreview.propTypes = {
  image: PropTypes.object,
  index: PropTypes.number,
  onRemove: PropTypes.func,
  onMove: PropTypes.func,
  disabled: PropTypes.bool,
  fullSizePreview: PropTypes.bool,
};

export default Sub_ImagePreview;
