import PropTypes from 'prop-types';
import styles from './Sub_ImagePreview.module.css';

const Sub_ImagePreview = ({
  image,
  onRemove,
  disabled,
  fullSizePreview = false,
}) => {
  // Check if image is valid before rendering
  if (!image || !image.url) {
    return null; // Don't render anything if image is invalid
  }

  // Convert size in bytes to readable format
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'Unknown size';
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Safely access image properties with fallbacks
  const name = image.name || 'Unknown file';
  const size = image.size || 0;
  const id = image.id || 'unknown-id';

  return (
    <div
      className={`${styles.imagePreview} ${
        fullSizePreview ? styles.fullSizePreview : ''
      }`}
    >
      <img src={image.url} alt={name} className={styles.previewImg} />
      <div className={styles.imageInfo}>
        <div className={styles.imageName} title={name}>
          {name.length > 15 ? name.substring(0, 12) + '...' : name}
        </div>
        <div className={styles.imageSize}>{formatFileSize(size)}</div>
      </div>
      {!disabled && (
        <button
          className={styles.removeButton}
          onClick={() => onRemove(id)}
          aria-label="Remove image"
        >
          &times;
        </button>
      )}
    </div>
  );
};

Sub_ImagePreview.propTypes = {
  image: PropTypes.shape({
    url: PropTypes.string.isRequired,
    name: PropTypes.string,
    size: PropTypes.number,
    type: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  fullSizePreview: PropTypes.bool,
};

export default Sub_ImagePreview;
