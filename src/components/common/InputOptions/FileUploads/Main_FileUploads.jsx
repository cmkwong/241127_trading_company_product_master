import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_FileUploads.module.css';
import Main_DropZone from '../DropZone/Main_DropZone';
import Sub_FileItem from './Sub_FileItem';
import { v4 as uuidv4 } from 'uuid';

/**
 * Main_FileUploads Component
 * A unified component for uploading files and images with support for both list and preview modes
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
    showPreview = true,
    showMaxItemsNotice = true,

    // Initial state
    defaultFiles = [],
    defaultImages = [],

    // Mode control
    mode = 'file', // 'file' or 'image'
  } = props;

  // Helper to process images and ensure they have IDs
  const processDefaultImages = useCallback((imgs) => {
    if (!Array.isArray(imgs)) return [];

    return imgs.map((image, index) => {
      if (typeof image === 'string') {
        const url = image;
        const nameFromUrl = url.split('/').pop();

        return {
          id: uuidv4(),
          url,
          name: nameFromUrl || `image-${index + 1}`,
          size: 0,
          type: 'image/*',
        };
      }

      if (image && typeof image === 'object') {
        const name =
          image.name || (image.url ? image.url.split('/').pop() : null);

        return {
          id: image.id || uuidv4(),
          url: image.url || '',
          name: name || `image-${index + 1}`,
          size: typeof image.size === 'number' ? image.size : 0,
          type: image.type || 'image/*',
          file: image.file,
        };
      }

      return {
        id: uuidv4(),
        url: '',
        name: `image-${index + 1}`,
        size: 0,
        type: 'image/*',
      };
    });
  }, []);

  // Determine initial state based on mode
  const getInitialState = () => {
    if (mode === 'image' && defaultImages.length > 0) {
      return processDefaultImages(defaultImages);
    }
    return defaultFiles || [];
  };

  // State to store uploaded files/images
  const [fileList, setFileList] = useState(getInitialState);
  const [isDragging, setIsDragging] = useState(false);

  // Update state when defaultImages changes (for image mode)
  useEffect(() => {
    if (mode === 'image') {
      const newProcessedImages = processDefaultImages(defaultImages);

      setFileList((currentImages) => {
        if (newProcessedImages.length !== currentImages.length) {
          return newProcessedImages;
        }

        const isDifferent = newProcessedImages.some((img, index) => {
          const current = currentImages[index];
          return (
            img.url !== current.url || (img.file && img.file !== current.file)
          );
        });

        if (isDifferent) {
          return newProcessedImages;
        }
        return currentImages;
      });
    } else {
      // For file mode, simply update if defaultFiles changes
      // We perform a shallow comparison to avoid unnecessary updates if ref changed but content is same
      setFileList((prev) => {
        if (prev === defaultFiles) return prev;
        if (
          prev.length === defaultFiles.length &&
          prev.every((f, i) => f.id === defaultFiles[i]?.id)
        ) {
          return prev;
        }
        return defaultFiles || [];
      });
    }
  }, [defaultImages, defaultFiles, mode, processDefaultImages]);

  // Handle file/image reordering (for image mode with drag-and-drop)
  const handleMoveItem = useCallback(
    (dragIndex, insertIndex) => {
      const oldFiles = [...fileList];
      const updatedFiles = [...fileList];
      const [draggedItem] = updatedFiles.splice(dragIndex, 1);

      let finalIndex = insertIndex;
      if (dragIndex < insertIndex) {
        finalIndex = insertIndex - 1;
      }

      updatedFiles.splice(finalIndex, 0, draggedItem);

      setFileList(updatedFiles);
      onChange(oldFiles, updatedFiles);
    },
    [fileList, onChange],
  );

  // Handle file selection
  const handleFileSelection = useCallback(
    (selectedFiles) => {
      if (!selectedFiles || selectedFiles.length === 0) {
        return;
      }

      let newFile = null;

      // Check if adding these files would exceed the max count
      if (fileList.length + selectedFiles.length > maxFiles) {
        onError(
          `You can only upload a maximum of ${maxFiles} ${mode === 'image' ? 'images' : 'files'}.`,
        );
        return;
      }

      const newFiles = [];
      const errors = [];

      Array.from(selectedFiles).forEach((file) => {
        // Validate file type if acceptedTypes is not empty
        if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
          errors.push(
            `File "${file.name}" is not a supported ${mode === 'image' ? 'image' : 'file'} type.`,
          );
          return;
        }

        // Validate file size
        if (file.size > maxSizeInMB * 1024 * 1024) {
          errors.push(
            `File "${file.name}" exceeds the maximum size of ${maxSizeInMB}MB.`,
          );
          return;
        }

        newFile = {
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          id: uuidv4(),
        };

        // Create object URL for preview/download
        newFile.url = URL.createObjectURL(file);

        newFiles.push(newFile);
      });

      // Report any errors
      if (errors.length > 0) {
        onError(errors.join('\n'));
      }

      // Update state with new files
      if (newFiles.length > 0) {
        const oldFiles = [...fileList];
        const updatedFiles = [...fileList, ...newFiles];
        setFileList(updatedFiles);
        onChange(oldFiles, updatedFiles);
      }
    },
    [fileList, maxFiles, acceptedTypes, maxSizeInMB, mode, onError, onChange],
  );

  // Handle file removal
  const handleRemoveFile = useCallback(
    (index) => {
      if (disabled) return;

      const oldFiles = [...fileList];
      const updatedFiles = fileList.filter((_, i) => i !== index);
      setFileList(updatedFiles);
      onChange(oldFiles, updatedFiles);
    },
    [fileList, disabled, onChange],
  );

  // Determine item type label for DropZone
  const itemType = mode === 'image' ? 'images' : 'files';
  const testIdPrefix = mode === 'image' ? 'image' : 'file';

  return (
    <div className={styles.fileUploadContainer}>
      {label && <label className={styles.label}>{label}</label>}

      <Main_DropZone
        onFileSelect={handleFileSelection}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        disabled={disabled}
        maxFiles={maxFiles}
        maxSizeInMB={maxSizeInMB}
        acceptedTypes={acceptedTypes}
        multiple={multiple}
        items={fileList}
        showPreview={showPreview}
        showMaxItemsNotice={showMaxItemsNotice}
        itemType={itemType}
        testIdPrefix={testIdPrefix}
      >
        {fileList.map((file, index) => (
          <Sub_FileItem
            key={file.id}
            file={file}
            index={index}
            onRemove={() => handleRemoveFile(index)}
            onMove={handleMoveItem}
            disabled={disabled}
            showAsImage={mode === 'image'}
            fullSizePreview={!showMaxItemsNotice}
          />
        ))}
      </Main_DropZone>
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
  showPreview: PropTypes.bool,
  showMaxItemsNotice: PropTypes.bool,

  // Initial state
  defaultFiles: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      type: PropTypes.string,
      id: PropTypes.string.isRequired,
    }),
  ),
  defaultImages: PropTypes.array,

  // Mode control
  mode: PropTypes.oneOf(['file', 'image']),
};

export default Main_FileUploads;
