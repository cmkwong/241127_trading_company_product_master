import PropTypes from 'prop-types';
import styles from './Sub_ImagePreview.module.css';

const Sub_ImagePreview = ({ image, onRemove, disabled }) => {
  // Convert size in bytes to readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className={styles.imagePreview}>
      <img src={image.url} alt={image.name} className={styles.previewImg} />
      <div className={styles.imageInfo}>
        <div className={styles.imageName} title={image.name}>
          {image.name.length > 15
            ? image.name.substring(0, 12) + '...'
            : image.name}
        </div>
        <div className={styles.imageSize}>{formatFileSize(image.size)}</div>
      </div>
      {!disabled && (
        <button
          className={styles.removeButton}
          onClick={() => onRemove(image.id)}
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
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    type: PropTypes.string,
    id: PropTypes.string.isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Sub_ImagePreview;
