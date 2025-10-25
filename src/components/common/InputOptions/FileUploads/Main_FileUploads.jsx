import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_FileUploads.module.css';
import Sub_DropZone from './Sub_DropZone';
import Sub_FileList from './Sub_FileList';

/**
 * Main_FileUploads Component
 * A component for uploading multiple files of various types
 */
const Main_FileUploads = (props) => {
  const {
    // Callbacks
    onChange = () => {},
    onError = () => {},

    // Configuration
    maxFiles = 10,
    maxSizeInMB = 10,
    acceptedTypes = [], // Empty array means accept all file types

    // UI
    label = 'Upload Files',
    multiple = true,
    disabled = false,

    // Initial state
    defaultFiles = [],
  } = props;

  // State to store uploaded files
  const [fileList, setFileList] = useState(defaultFiles || []);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection
  const handleFileSelection = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    // Check if adding these files would exceed the max count
    if (fileList.length + selectedFiles.length > maxFiles) {
      onError(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    const newFiles = [];
    const errors = [];

    Array.from(selectedFiles).forEach((file) => {
      // Validate file type if acceptedTypes is not empty
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        errors.push(`File "${file.name}" is not a supported file type.`);
        return;
      }

      // Validate file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        errors.push(
          `File "${file.name}" exceeds the maximum size of ${maxSizeInMB}MB.`
        );
        return;
      }

      const newFile = {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };

      newFiles.push(newFile);
    });

    // Report any errors
    if (errors.length > 0) {
      onError(errors.join('\n'));
    }

    // Update state with new files
    if (newFiles.length > 0) {
      const updatedFiles = [...fileList, ...newFiles];
      setFileList(updatedFiles);
      onChange(updatedFiles);
    }
  };

  // Handle file removal
  const handleRemoveFile = (id) => {
    if (disabled) return;

    const updatedFiles = fileList.filter((file) => file.id !== id);
    setFileList(updatedFiles);
    onChange(updatedFiles);
  };

  return (
    <div className={styles.fileUploadContainer}>
      {label && <label className={styles.label}>{label}</label>}

      <Sub_DropZone
        onFileSelect={handleFileSelection}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        disabled={disabled}
        maxFiles={maxFiles}
        maxSizeInMB={maxSizeInMB}
        acceptedTypes={acceptedTypes}
        multiple={multiple}
      />

      {fileList && fileList.length > 0 ? (
        <Sub_FileList
          files={fileList}
          onRemoveFile={handleRemoveFile}
          disabled={disabled}
        />
      ) : (
        <div className={styles.noFiles}>No files uploaded yet</div>
      )}
    </div>
  );
};

Main_FileUploads.propTypes = {
  // Callbacks
  onChange: PropTypes.func,
  onError: PropTypes.func,

  // Configuration
  maxFiles: PropTypes.number,
  maxSizeInMB: PropTypes.number,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),

  // UI
  label: PropTypes.string,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,

  // Initial state
  defaultFiles: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      type: PropTypes.string,
      id: PropTypes.string.isRequired,
    })
  ),
};

export default Main_FileUploads;
