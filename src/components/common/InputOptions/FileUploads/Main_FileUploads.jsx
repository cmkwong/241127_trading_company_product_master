import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_FileUploads.module.css';
import Main_DropZone from '../DropZone/Main_DropZone';
import Sub_FileItem from './Sub_FileItem';
import { v4 as uuidv4 } from 'uuid';
import Sub_FileUploadsHeader from './Sub_FileUploadsHeader';
import Sub_SequenceEditorModal from './Sub_SequenceEditorModal';
import {
  processDefaultImages,
  shouldReplaceImageList,
} from './fileUploadsUtils';

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
    maxFiles = 100,
    maxSizeInMB = 10,
    acceptedTypes = [], // Empty array means accept all file types

    // UI
    label = 'Upload Files',
    multiple = true,
    disabled = false,
    showPreview = true,
    showMaxItemsNotice = true,
    compact = false,
    compactButtonText = 'Select Files',
    tableCell = false,
    hoverPreview = false,
    enableSequenceEditor = true,

    // Initial state
    defaultFiles = [],
    defaultImages = [],

    // Mode control
    mode = 'file', // 'file' or 'image'
  } = props;

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
  const [isSequenceEditorOpen, setIsSequenceEditorOpen] = useState(false);

  // Update state when defaultImages changes (for image mode)
  useEffect(() => {
    if (mode === 'image') {
      const newProcessedImages = processDefaultImages(defaultImages);

      setFileList((currentImages) => {
        if (shouldReplaceImageList(currentImages, newProcessedImages)) {
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
  }, [defaultImages, defaultFiles, mode]);

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
  const canOpenSequenceEditor = enableSequenceEditor && mode === 'image';
  const showHeaderEditorButton = canOpenSequenceEditor && !tableCell;
  const showInlineEditorButton = canOpenSequenceEditor && tableCell;

  const renderFileItems = (forModal = false) => {
    return fileList.map((file, index) => (
      <Sub_FileItem
        key={file.id}
        file={file}
        index={index}
        onRemove={() => handleRemoveFile(index)}
        onMove={handleMoveItem}
        disabled={disabled}
        showAsImage={mode === 'image'}
        fullSizePreview={forModal || !showMaxItemsNotice}
        editMode={forModal}
        compactImage={forModal ? false : tableCell}
        compactFile={!forModal && tableCell && mode === 'file'}
        hoverPreview={forModal ? true : hoverPreview}
      />
    ));
  };

  const renderPreviewContent = (forModal = false) => {
    const items = renderFileItems(forModal);

    if (mode !== 'image') {
      return items;
    }

    return (
      <div
        className={
          forModal ? styles.sequenceGridEditor : styles.sequenceGridCompact
        }
      >
        {items}
      </div>
    );
  };

  const baseDropZoneProps = {
    onFileSelect: handleFileSelection,
    isDragging,
    setIsDragging,
    disabled,
    maxFiles,
    maxSizeInMB,
    acceptedTypes,
    multiple,
    items: fileList,
    showPreview,
    showMaxItemsNotice,
    itemType,
    compactButtonText,
  };

  return (
    <div
      className={`${styles.fileUploadContainer} ${
        tableCell ? styles.tableCellContainer : ''
      }`}
    >
      <Sub_FileUploadsHeader
        label={label}
        canOpenSequenceEditor={showHeaderEditorButton}
        onOpenSequenceEditor={() => setIsSequenceEditorOpen(true)}
      />

      <div className={styles.dropZoneEditorWrap}>
        {showInlineEditorButton && (
          <button
            type="button"
            className={styles.inlineSequenceEditorBtn}
            onClick={() => setIsSequenceEditorOpen(true)}
            title="Open sequence editor"
            aria-label="Open sequence editor"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 000-1.42L18.37 3.29a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
            </svg>
          </button>
        )}

        <Main_DropZone
          {...baseDropZoneProps}
          testIdPrefix={testIdPrefix}
          compact={compact}
          tableCell={tableCell}
        >
          {renderPreviewContent(false)}
        </Main_DropZone>
      </div>

      {canOpenSequenceEditor && (
        <Sub_SequenceEditorModal
          isOpen={isSequenceEditorOpen}
          onClose={() => setIsSequenceEditorOpen(false)}
          dropZoneProps={{
            ...baseDropZoneProps,
            testIdPrefix: `${testIdPrefix}-sequence-editor`,
            compact: false,
            tableCell: false,
          }}
        >
          {renderPreviewContent(true)}
        </Sub_SequenceEditorModal>
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
  showPreview: PropTypes.bool,
  showMaxItemsNotice: PropTypes.bool,
  compact: PropTypes.bool,
  compactButtonText: PropTypes.string,
  tableCell: PropTypes.bool,
  hoverPreview: PropTypes.bool,
  enableSequenceEditor: PropTypes.bool,

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
