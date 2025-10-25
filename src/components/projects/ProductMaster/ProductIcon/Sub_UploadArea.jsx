import { useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_UploadArea.module.css';

const Sub_UploadArea = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div
      className={styles.uploadArea}
      onClick={handleUploadClick}
      data-testid="product-icon-upload"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className={styles.fileInput}
        data-testid="product-icon-input"
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

      <div className={styles.uploadText}>Click to upload product icon</div>
    </div>
  );
};

Sub_UploadArea.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
};

export default Sub_UploadArea;
