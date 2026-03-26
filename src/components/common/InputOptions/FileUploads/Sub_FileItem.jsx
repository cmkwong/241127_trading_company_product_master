import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Sub_FileItem.module.css';
import {
  DRAG_READY_LABEL,
  getDragPlacementUiState,
} from '../../../../utils/dragUi';

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
  editMode = false,
  compactImage = false,
  compactFile = false,
  hoverPreview = false,
}) => {
  const [dropPosition, setDropPosition] = useState(null);
  const [dragSourceIndex, setDragSourceIndex] = useState(null);
  const [isSelfDragging, setIsSelfDragging] = useState(false);
  const [showHoverPreview, setShowHoverPreview] = useState(false);
  const [hoverPreviewStyle, setHoverPreviewStyle] = useState(null);

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // If showing as image preview (and url exists)
  const isImagePreview = showAsImage && file.url;

  const shouldCreateHoverObjectUrl = !file?.url && !!file?.file;

  const hoverImageUrl = useMemo(() => {
    if (!file) return '';
    if (file.url) return file.url;
    if (shouldCreateHoverObjectUrl) return URL.createObjectURL(file.file);
    return '';
  }, [file, shouldCreateHoverObjectUrl]);

  useEffect(() => {
    return () => {
      if (
        shouldCreateHoverObjectUrl &&
        hoverImageUrl &&
        hoverImageUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(hoverImageUrl);
      }
    };
  }, [hoverImageUrl, shouldCreateHoverObjectUrl]);

  // Drag and drop handlers (for image reordering)
  const handleDragStart = (e) => {
    if (disabled || !onMove) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
    setIsSelfDragging(true);
    setDragSourceIndex(index);
  };

  const handleDragEnd = () => {
    setIsSelfDragging(false);
    setDragSourceIndex(null);
    setDropPosition(null);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDropPosition(null);
    setDragSourceIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (disabled || !onMove) return;

    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(dragIndex)) {
      setDragSourceIndex(dragIndex);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    const newPosition = x < width / 2 ? 'left' : 'right';
    if (newPosition !== dropPosition) {
      setDropPosition(newPosition);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    let insertIndex = index;
    if (dropPosition === 'right') {
      insertIndex = index + 1;
    }

    setDropPosition(null);
    setDragSourceIndex(null);

    if (dragIndex === index && dropPosition === 'left') {
      return;
    }
    if (dragIndex === index && dropPosition === 'right') {
      return;
    }

    if (onMove) {
      onMove(dragIndex, insertIndex);
    }
  };

  const { isDraggedItem, isDropTarget } = getDragPlacementUiState({
    draggedKey: isSelfDragging ? index : dragSourceIndex,
    overKey: dropPosition ? index : null,
    currentKey: index,
  });

  // Determine shift classes for drag reordering
  let shiftClass = '';
  if (dropPosition === 'left') shiftClass = styles.shiftRight;
  if (dropPosition === 'right') shiftClass = styles.shiftLeft;

  const handlePreview = () => {
    const ext = (file?.name || '').split('.').pop()?.toLowerCase();
    const isVideo =
      (file?.type || '').startsWith('video/') ||
      ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(ext);

    if (isVideo) {
      const videoUrl =
        file.url || (file.file ? URL.createObjectURL(file.file) : '');
      if (!videoUrl) return;

      const previewWindow = window.open('about:blank', '_blank');
      if (!previewWindow) return;

      const safeSrc = String(videoUrl).replace(/"/g, '&quot;');
      const safeTitle = String(file?.name || 'Video Preview').replace(
        /</g,
        '&lt;',
      );

      previewWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${safeTitle}</title>
            <style>
              html, body {
                margin: 0;
                width: 100%;
                height: 100%;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              video {
                max-width: 100%;
                max-height: 100%;
              }
            </style>
          </head>
          <body>
            <video controls autoplay playsinline src="${safeSrc}"></video>
          </body>
        </html>
      `);
      previewWindow.document.close();
      return;
    }

    if (file.url) {
      window.open(file.url, '_blank');
    } else if (file.file) {
      const url = URL.createObjectURL(file.file);
      window.open(url, '_blank');
    }
  };

  const hideHoverPreview = () => {
    setShowHoverPreview(false);
  };

  const showHoverImagePreview = (event) => {
    if (!hoverPreview || !isImagePreview || !hoverImageUrl) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const popupWidth = editMode ? 560 : 320;
    const popupHeight = editMode ? 560 : 240;
    const gap = 12;
    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    let left;
    let top;

    if (editMode) {
      const modal = document.querySelector(
        '[data-sequence-editor-modal="true"]',
      );
      const modalRect = modal?.getBoundingClientRect?.();

      if (modalRect) {
        const outsideRightLeft = modalRect.right + gap;
        const hasOutsideRightSpace =
          outsideRightLeft + popupWidth <= viewportWidth - 12;

        if (hasOutsideRightSpace) {
          left = outsideRightLeft;
        } else {
          left = Math.max(12, modalRect.right - popupWidth - 12);
        }

        const idealTop = rect.top + rect.height / 2 - popupHeight / 2;
        const minTop = Math.max(12, modalRect.top + 72);
        const maxTop = Math.max(minTop, viewportHeight - popupHeight - 12);
        top = Math.min(Math.max(minTop, idealTop), maxTop);
      } else {
        left = Math.max(12, viewportWidth - popupWidth - 12);
        const idealTop = rect.top + rect.height / 2 - popupHeight / 2;
        top = Math.min(
          Math.max(12, idealTop),
          Math.max(12, viewportHeight - popupHeight - 12),
        );
      }
    } else {
      const placeRight = rect.right + gap + popupWidth < viewportWidth - 8;
      left = placeRight
        ? rect.right + gap
        : Math.max(8, rect.left - popupWidth - gap);

      const idealTop = rect.top + rect.height / 2 - popupHeight / 2;
      top = Math.min(
        Math.max(8, idealTop),
        Math.max(8, viewportHeight - popupHeight - 8),
      );
    }

    setHoverPreviewStyle({
      position: 'fixed',
      left,
      top,
      width: popupWidth,
      maxHeight: popupHeight,
      zIndex: 10100,
    });
    setShowHoverPreview(true);
  };

  // Render as image preview
  if (isImagePreview) {
    const name = file.name || 'Unknown file';

    return (
      <div
        className={`${styles.imagePreview} ${
          fullSizePreview ? styles.fullSizePreview : ''
        } ${editMode ? styles.editorModePreview : ''} ${compactImage ? styles.compactImagePreview : ''} ${shiftClass} ${
          isDraggedItem ? styles.draggingItem : ''
        } ${isDropTarget ? styles.dragOverItem : ''}`}
        draggable={!disabled && !!onMove}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handlePreview}
        onMouseEnter={showHoverImagePreview}
        onMouseLeave={hideHoverPreview}
        title={onMove ? 'Drag to reorder' : name}
        style={{ cursor: 'pointer' }}
      >
        {isDropTarget && (
          <div className={styles.dropReadyBadge}>{DRAG_READY_LABEL}</div>
        )}

        <img src={file.url} alt={name} className={styles.previewImg} />
        <div className={styles.imageIndexBadge}>{index + 1}</div>
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

        {showHoverPreview &&
          hoverPreview &&
          hoverImageUrl &&
          createPortal(
            <div className={styles.hoverPreviewPopup} style={hoverPreviewStyle}>
              <div
                className={`${styles.hoverPreviewCard} ${
                  editMode ? styles.hoverPreviewCardEditMode : ''
                }`}
              >
                <img
                  src={hoverImageUrl}
                  alt={name}
                  className={styles.hoverPreviewImage}
                />
                <div className={styles.hoverPreviewName} title={name}>
                  {name}
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  }

  // Render as file list item
  return (
    <li
      className={`${styles.fileItem} ${compactFile ? styles.compactFileItem : ''} ${shiftClass} ${
        isDraggedItem ? styles.draggingItem : ''
      } ${isDropTarget ? styles.dragOverItem : ''}`}
      draggable={!disabled && !!onMove}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      title={onMove ? 'Drag to reorder' : file.name}
      onClick={handlePreview}
      style={{ cursor: 'pointer' }}
    >
      {isDropTarget && (
        <div className={styles.dropReadyBadge}>{DRAG_READY_LABEL}</div>
      )}

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
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
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
  editMode: PropTypes.bool,
  compactImage: PropTypes.bool,
  compactFile: PropTypes.bool,
  hoverPreview: PropTypes.bool,
};

export default Sub_FileItem;
