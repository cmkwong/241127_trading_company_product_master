import PropTypes from 'prop-types';
import styles from './Sub_FileItem.module.css';

/**
 * Sub_FileItem Component
 * Displays an individual file item with its details and a remove button
 */
const Sub_FileItem = ({ file, onRemove, disabled }) => {
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

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
        onClick={() => onRemove(file.id)}
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
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Sub_FileItem;
