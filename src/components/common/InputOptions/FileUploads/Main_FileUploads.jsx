import { useState, useCallback, useEffect, useRef } from 'react';
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

  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);

  // State to store uploaded files
  const [files, setFiles] = useState(defaultFiles || []);
  const [isDragging, setIsDragging] = useState(false);

  // For debugging - remove in production
  useEffect(() => {
    console.log('Current files state:', files);
  }, [files]);

  // Update internal state when defaultFiles prop changes
  // Only sync with defaultFiles when the prop actually changes
  useEffect(() => {
    // Skip the first render since we already initialized with defaultFiles
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only update if defaultFiles has actually changed
    // This prevents unnecessary state updates
    const currentFileIds = (files || [])
      .map((file) => file.id)
      .sort()
      .join(',');
    const newFileIds = (defaultFiles || [])
      .map((file) => file.id)
      .sort()
      .join(',');

    if (currentFileIds !== newFileIds) {
      setFiles(defaultFiles || []);
    }
  }, [defaultFiles, files]);

  // Handle file selection
  const handleFileSelection = useCallback(
    (selectedFiles) => {
      if (!selectedFiles || selectedFiles.length === 0) {
        return; // No files selected
      }

      // Check if adding these files would exceed the max count
      if (files.length + selectedFiles.length > maxFiles) {
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

        newFiles.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          id: `file-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
        });
      });

      // Report any errors
      if (errors.length > 0) {
        onError(errors.join('\n'));
      }

      // Update state with new files
      if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);

        // Call onChange after the state has been updated
        onChange(updatedFiles);

        // For debugging - remove in production
        console.log('Files after update:', updatedFiles);
      }
    },
    [files, maxFiles, maxSizeInMB, acceptedTypes, onChange, onError]
  );

  // Handle file removal
  const handleRemoveFile = useCallback(
    (id) => {
      if (disabled) return;

      const updatedFiles = files.filter((file) => file.id !== id);
      setFiles(updatedFiles);
      onChange(updatedFiles);
    },
    [disabled, files, onChange]
  );

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

      {/* Add a debug message to see if files exist */}
      {files && files.length > 0 ? (
        <Sub_FileList
          files={files}
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
