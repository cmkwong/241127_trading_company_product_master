import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_FileUploads.module.css';
import Main_DropZone from '../DropZone/Main_DropZone';
import Sub_FileItem from './Sub_FileItem';
import { v4 as uuidv4 } from 'uuid';
import Sub_FileUploadsHeader from './Sub_FileUploadsHeader';
import Sub_SequenceEditorModal from './Sub_SequenceEditorModal';
import { apiPost } from '../../../../utils/crud';
import { useAuthContext } from '../../../../store/AuthContext';
import {
  processDefaultImages,
  shouldReplaceImageList,
} from './fileUploadsUtils';
import useWatermarkFile from './Watermark_file';

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
    figmaStrip = false,
    hoverPreview = false,
    enableSequenceEditor = true,
    showDownloadButton = true,
    downloadEndpoint = '',
    downloadRequestBody = null,
    downloadFileBaseName = 'files',
    downloadNameProductId = '',
    downloadNameImageType = '',
    watermarkImagePath = '/assets/watermark_v1.png',
    fileUrlBase = '',

    // Initial state
    defaultFiles = [],
    defaultImages = [],

    // Mode control
    mode = 'file', // 'file' or 'image'
  } = props;
  const { token } = useAuthContext();

  // Determine initial state based on mode
  const getInitialState = () => {
    if (mode === 'image' && defaultImages.length > 0) {
      return processDefaultImages(defaultImages);
    }
    return defaultFiles || [];
  };

  // State to store uploaded files/images
  const [fileList, setFileList] = useState(getInitialState);
  const fileListRef = useRef(getInitialState());
  const [selectedFileIds, setSelectedFileIds] = useState(() =>
    getInitialState()
      .map((file) => file?.id)
      .filter(Boolean),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isSequenceEditorOpen, setIsSequenceEditorOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [applyWatermarkOnDownload, setApplyWatermarkOnDownload] =
    useState(true);
  const { addWatermarkToImageBlob } = useWatermarkFile({
    watermarkImagePath,
  });

  useEffect(() => {
    fileListRef.current = fileList;
  }, [fileList]);

  const createBlobFromBase64 = useCallback((base64Value, filename = '') => {
    if (!base64Value || typeof base64Value !== 'string') return null;

    let mimeType = 'application/octet-stream';
    let base64Payload = base64Value;

    if (base64Value.startsWith('data:')) {
      const [metadata, payload] = base64Value.split(',');
      if (!payload) return null;
      base64Payload = payload;
      const mimeMatch = metadata.match(/data:(.*?);base64/i);
      if (mimeMatch?.[1]) {
        mimeType = mimeMatch[1];
      }
    } else {
      const ext = String(filename).split('.').pop()?.toLowerCase();
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      if (ext === 'webp') mimeType = 'image/webp';
      if (ext === 'gif') mimeType = 'image/gif';
      if (ext === 'mp4') mimeType = 'video/mp4';
      if (ext === 'webm') mimeType = 'video/webm';
      if (ext === 'mov') mimeType = 'video/quicktime';
    }

    try {
      const binary = atob(base64Payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: mimeType });
    } catch (error) {
      console.error('Failed to parse base64 payload:', error);
      return null;
    }
  }, []);

  const getExtensionFromName = useCallback((filename = '') => {
    const base = String(filename || '');
    const idx = base.lastIndexOf('.');
    if (idx < 0 || idx === base.length - 1) return '';
    return base.slice(idx + 1).toLowerCase();
  }, []);

  const getExtensionFromMime = useCallback((mime = '') => {
    const type = String(mime || '').toLowerCase();
    if (type.includes('jpeg')) return 'jpg';
    if (type.includes('png')) return 'png';
    if (type.includes('webp')) return 'webp';
    if (type.includes('gif')) return 'gif';
    if (type.includes('mp4')) return 'mp4';
    if (type.includes('webm')) return 'webm';
    if (type.includes('quicktime')) return 'mov';
    return 'bin';
  }, []);

  const buildDownloadFileName = useCallback(
    (record, fallbackName, fallbackMime, index) => {
      const rawOrder = record?.display_order ?? index + 1;
      const order = String(rawOrder || index + 1).trim();

      const productPrefix = String(downloadNameProductId || '')
        .trim()
        .slice(0, 4);
      const imageType = String(downloadNameImageType || '')
        .replace('-', '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9_-]/g, '');
      const extFromName = getExtensionFromName(
        record?.image_name || fallbackName || '',
      );
      const ext = extFromName || getExtensionFromMime(fallbackMime);

      if (productPrefix && imageType) {
        return `${productPrefix}${imageType}${order}.${ext}`;
      }

      return (
        record?.image_name ||
        fallbackName ||
        `file-${record?.id || Math.random().toString(36).slice(2)}.${ext}`
      );
    },
    [
      downloadNameProductId,
      downloadNameImageType,
      getExtensionFromName,
      getExtensionFromMime,
    ],
  );
  // Helper function to trigger browser download
  const triggerBrowserDownload = useCallback((blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Delay revoke so the browser can finish reading the blob before it's freed.
    // Revoking immediately causes truncated/corrupted downloads.
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, []);

  const resolveFileUrl = useCallback(
    (rawUrl) => {
      const url = String(rawUrl || '').trim();
      if (!url) {
        return '';
      }

      if (/^(blob:|data:|https?:\/\/)/i.test(url)) {
        return url;
      }

      const base = String(fileUrlBase || '')
        .trim()
        .replace(/\/+$/, '');
      if (!base) {
        return url;
      }

      const normalizedPath = url.replace(/^\/+/, '');
      return `${base}/${normalizedPath}`;
    },
    [fileUrlBase],
  );

  // Helper function to fetch blob from a given path (absolute URL or relative path with origin)
  const fetchBlobFromPath = useCallback(
    async (path, endpointForOrigin = '', fallbackName = '') => {
      if (!path) return null;

      const normalizedPath = resolveFileUrl(path);

      if (/^blob:/i.test(normalizedPath)) {
        const blobResponse = await fetch(normalizedPath);
        if (!blobResponse.ok) {
          throw new Error(`Download blob failed: ${blobResponse.status}`);
        }
        return blobResponse.blob();
      }

      if (/^data:/i.test(normalizedPath)) {
        const dataBlob = createBlobFromBase64(normalizedPath, fallbackName);
        if (!dataBlob) {
          throw new Error('Failed to parse data URL for download.');
        }
        return dataBlob;
      }

      const isAbsolute = /^https?:\/\//i.test(normalizedPath);
      const origin = endpointForOrigin ? new URL(endpointForOrigin).origin : '';
      const targetUrl = isAbsolute
        ? normalizedPath
        : `${origin}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;

      const response = await fetch(targetUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error(`Download file failed: ${response.status}`);
      }

      const contentType = String(
        response.headers.get('content-type') || '',
      ).toLowerCase();
      const blob = await response.blob();
      const lowerName = String(fallbackName || '').toLowerCase();
      const looksLikeHtmlName =
        lowerName.endsWith('.html') || lowerName.endsWith('.htm');

      // Guard against accidentally downloading frontend HTML fallback pages.
      if (
        contentType.includes('text/html') &&
        !looksLikeHtmlName &&
        blob.size <= 64 * 1024
      ) {
        throw new Error(
          'Download returned HTML instead of file binary. Please verify file server base URL.',
        );
      }

      return blob;
    },
    [token, resolveFileUrl, createBlobFromBase64],
  );

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const selectedIdSet = new Set(
        (selectedFileIds || []).map((id) => String(id || '').trim()),
      );

      let selectedRecords = [];
      let sourceMode = 'local';

      if (downloadEndpoint && downloadRequestBody) {
        sourceMode = 'api';
        const response = await apiPost(downloadEndpoint, downloadRequestBody, {
          token,
        });

        const records = response?.structuredData?.data?.product_images || [];
        if (!Array.isArray(records) || records.length === 0) {
          onError('No files available to download.');
          return;
        }

        selectedRecords = records.filter((record) =>
          selectedIdSet.has(String(record?.id || '').trim()),
        );
      } else {
        selectedRecords = (fileList || []).filter((record) =>
          selectedIdSet.has(String(record?.id || '').trim()),
        );
      }

      if (selectedRecords.length === 0) {
        onError('No selected files available to download.');
        return;
      }

      const files = [];
      for (let index = 0; index < selectedRecords.length; index += 1) {
        const record = selectedRecords[index];
        const fallbackName =
          record?.name ||
          record?.file_name ||
          record?.image_name ||
          `file-${record?.id || Math.random().toString(36).slice(2)}.bin`;

        let blob = null;
        if (record?.file && record.file instanceof Blob) {
          blob = record.file;
        }

        const candidateUrl =
          record?._original_file_url ||
          record?.file_url ||
          record?._original_image_url ||
          record?.image_url ||
          record?._original_url ||
          record?.url ||
          '';
        const normalizedCandidateUrl = String(candidateUrl || '').trim();
        const hasPersistedFileUrl =
          normalizedCandidateUrl.length > 0 &&
          !/^(blob:|data:)/i.test(normalizedCandidateUrl);

        if (!blob && normalizedCandidateUrl) {
          blob = await fetchBlobFromPath(
            normalizedCandidateUrl,
            sourceMode === 'api' ? downloadEndpoint : window.location.origin,
            fallbackName,
          );
        }

        // Use base64 only when we do not have a persisted file URL.
        // Persisted URLs should download the original binary (non-compressed).
        const base64Payload =
          record?.base64_image || record?.base64_file || record?.base64;
        if (!blob && !hasPersistedFileUrl && base64Payload) {
          blob = createBlobFromBase64(base64Payload, fallbackName);
        }

        if (blob) {
          if (
            applyWatermarkOnDownload &&
            String(blob?.type || '').startsWith('image/')
          ) {
            blob = await addWatermarkToImageBlob(blob);
          }

          const fileName = buildDownloadFileName(
            record,
            fallbackName,
            blob.type,
            index,
          );
          files.push({ name: fileName, blob });
        }
      }

      if (files.length === 0) {
        onError('No valid files could be prepared for download.');
        return;
      }

      if (files.length === 1) {
        triggerBrowserDownload(files[0].blob, files[0].name);
        return;
      }

      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.name, file.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      triggerBrowserDownload(
        zipBlob,
        `${downloadFileBaseName}-${timestamp}.zip`,
      );
    } catch (error) {
      console.error('Download failed:', error);
      onError(error?.message || 'Download failed.');
    } finally {
      setIsDownloading(false);
    }
  }, [
    downloadEndpoint,
    downloadRequestBody,
    token,
    onError,
    createBlobFromBase64,
    fetchBlobFromPath,
    triggerBrowserDownload,
    downloadFileBaseName,
    buildDownloadFileName,
    selectedFileIds,
    fileList,
    applyWatermarkOnDownload,
    addWatermarkToImageBlob,
  ]);

  // Update state when defaultImages changes (for image mode)
  useEffect(() => {
    if (mode === 'image') {
      const newProcessedImages = processDefaultImages(defaultImages);
      let replaced = false;

      setFileList((currentImages) => {
        if (shouldReplaceImageList(currentImages, newProcessedImages)) {
          replaced = true;
          return newProcessedImages;
        }

        return currentImages;
      });

      if (replaced) {
        setSelectedFileIds(
          newProcessedImages.map((file) => file?.id).filter(Boolean),
        );
      }
    } else {
      // For file mode, simply update if defaultFiles changes
      // We perform a shallow comparison to avoid unnecessary updates if ref changed but content is same
      let replaced = false;
      setFileList((prev) => {
        if (prev === defaultFiles) return prev;
        if (
          prev.length === defaultFiles.length &&
          prev.every((f, i) => f.id === defaultFiles[i]?.id)
        ) {
          return prev;
        }
        replaced = true;
        return defaultFiles || [];
      });

      if (replaced) {
        setSelectedFileIds(
          (defaultFiles || []).map((file) => file?.id).filter(Boolean),
        );
      }
    }
  }, [defaultImages, defaultFiles, mode]);

  // Handle file/image reordering (for image mode with drag-and-drop)
  const handleMoveItem = useCallback(
    (dragIndex, insertIndex) => {
      const oldFiles = [...fileListRef.current];
      const updatedFiles = [...fileListRef.current];
      const [draggedItem] = updatedFiles.splice(dragIndex, 1);

      let finalIndex = insertIndex;
      if (dragIndex < insertIndex) {
        finalIndex = insertIndex - 1;
      }

      updatedFiles.splice(finalIndex, 0, draggedItem);

      fileListRef.current = updatedFiles;
      setFileList(updatedFiles);
      onChange(oldFiles, updatedFiles);
    },
    [onChange],
  );

  // Handle file selection
  const handleFileSelection = useCallback(
    (selectedFiles) => {
      if (!selectedFiles || selectedFiles.length === 0) {
        return;
      }

      let newFile = null;

      // Check if adding these files would exceed the max count
      if (fileListRef.current.length + selectedFiles.length > maxFiles) {
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
        const oldFiles = [...fileListRef.current];
        const updatedFiles = [...fileListRef.current, ...newFiles];
        fileListRef.current = updatedFiles;
        setFileList(updatedFiles);
        setSelectedFileIds((prev) => [
          ...(prev || []),
          ...newFiles.map((file) => file?.id).filter(Boolean),
        ]);
        onChange(oldFiles, updatedFiles);
      }
    },
    [maxFiles, acceptedTypes, maxSizeInMB, mode, onError, onChange],
  );

  // Handle file removal
  const handleRemoveFile = useCallback(
    (index) => {
      if (disabled) return;

      const sourceFiles = [...fileListRef.current];
      const oldFiles = [...sourceFiles];
      const updatedFiles = sourceFiles.filter((_, i) => i !== index);
      const removedId = String(sourceFiles[index]?.id || '').trim();
      fileListRef.current = updatedFiles;
      setFileList(updatedFiles);
      if (removedId) {
        setSelectedFileIds((prev) =>
          (prev || []).filter((id) => String(id || '').trim() !== removedId),
        );
      }
      onChange(oldFiles, updatedFiles);
    },
    [disabled, onChange],
  );

  const handleToggleSelectFile = useCallback((fileId) => {
    const normalized = String(fileId || '').trim();
    if (!normalized) return;

    setSelectedFileIds((prev) => {
      const exists = (prev || []).some(
        (id) => String(id || '').trim() === normalized,
      );
      if (exists) {
        return (prev || []).filter(
          (id) => String(id || '').trim() !== normalized,
        );
      }
      return [...(prev || []), normalized];
    });
  }, []);

  const handleSortByName = useCallback(() => {
    if (fileListRef.current.length < 2) return;

    const oldFiles = [...fileListRef.current];
    const updatedFiles = [...fileListRef.current].sort((a, b) =>
      String(a?.name || '').localeCompare(String(b?.name || ''), undefined, {
        sensitivity: 'base',
        numeric: true,
      }),
    );

    fileListRef.current = updatedFiles;
    setFileList(updatedFiles);
    onChange(oldFiles, updatedFiles);
  }, [onChange]);

  const handleSortBySize = useCallback(() => {
    if (fileListRef.current.length < 2) return;

    const oldFiles = [...fileListRef.current];
    const updatedFiles = [...fileListRef.current].sort((a, b) => {
      const sizeA = Number(a?.size || 0);
      const sizeB = Number(b?.size || 0);
      if (sizeA !== sizeB) return sizeA - sizeB;

      return String(a?.name || '').localeCompare(
        String(b?.name || ''),
        undefined,
        {
          sensitivity: 'base',
          numeric: true,
        },
      );
    });

    fileListRef.current = updatedFiles;
    setFileList(updatedFiles);
    onChange(oldFiles, updatedFiles);
  }, [onChange]);

  // Determine item type label for DropZone
  const itemType = mode === 'image' ? 'images' : 'files';
  const testIdPrefix = mode === 'image' ? 'image' : 'file';
  const isFigmaStripMode = !tableCell && (mode === 'image' || figmaStrip);
  const canOpenSequenceEditor =
    enableSequenceEditor && (mode === 'image' || tableCell || isFigmaStripMode);
  const showSelectionTools =
    tableCell || mode === 'image' || (mode === 'file' && isFigmaStripMode);
  const effectiveShowDownloadButton =
    tableCell || isFigmaStripMode ? true : showDownloadButton;
  const showHeaderEditorButton = canOpenSequenceEditor;
  const selectableIds = useMemo(
    () => fileList.map((file) => String(file?.id || '').trim()).filter(Boolean),
    [fileList],
  );
  const selectedSet = useMemo(
    () => new Set((selectedFileIds || []).map((id) => String(id || '').trim())),
    [selectedFileIds],
  );
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedSet.has(id));
  const selectedCount = useMemo(
    () => selectableIds.filter((id) => selectedSet.has(id)).length,
    [selectableIds, selectedSet],
  );
  const showRemoveSelectedButton = showSelectionTools;
  const disableRemoveSelectedButton = disabled || selectedCount === 0;

  const handleToggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedFileIds([]);
      return;
    }
    setSelectedFileIds(selectableIds);
  }, [allSelected, selectableIds]);

  const handleToggleSelect = useCallback(() => {
    if (selectableIds.length === 0) return;

    setSelectedFileIds((prev) => {
      const prevSet = new Set(
        (prev || []).map((id) => String(id || '').trim()).filter(Boolean),
      );

      const selectedInCurrent = selectableIds.filter((id) => prevSet.has(id));

      if (selectedInCurrent.length === 0) {
        return selectableIds;
      }

      if (selectedInCurrent.length === selectableIds.length) {
        return [];
      }

      return selectableIds.filter((id) => !prevSet.has(id));
    });
  }, [selectableIds]);

  const handleRemoveSelected = useCallback(() => {
    if (disabled) return;

    const selectedIdSet = new Set(
      (selectedFileIds || []).map((id) => String(id || '').trim()),
    );
    if (selectedIdSet.size === 0) return;

    const oldFiles = [...fileListRef.current];
    const updatedFiles = oldFiles.filter(
      (file) => !selectedIdSet.has(String(file?.id || '').trim()),
    );

    if (updatedFiles.length === oldFiles.length) return;

    fileListRef.current = updatedFiles;
    setFileList(updatedFiles);
    setSelectedFileIds(
      updatedFiles.map((file) => String(file?.id || '').trim()).filter(Boolean),
    );
    onChange(oldFiles, updatedFiles);
  }, [disabled, selectedFileIds, onChange]);

  const sequencePreviewItems = useMemo(() => {
    if (mode !== 'image') return [];

    return (fileList || []).map((file, index) => ({
      id: file?.id || `sequence-preview-${index}`,
      name: String(file?.name || file?.image_name || `Image ${index + 1}`),
      size: Number(file?.size || 0),
      type: String(file?.type || ''),
      url: resolveFileUrl(file?.url),
    }));
  }, [mode, fileList, resolveFileUrl]);

  const renderFileItems = (forModal = false) => {
    return fileList.map((file, index) => (
      <Sub_FileItem
        key={file.id}
        file={file}
        resolveFileUrl={resolveFileUrl}
        index={index}
        onRemove={() => handleRemoveFile(index)}
        onMove={handleMoveItem}
        disabled={disabled}
        showAsImage={mode === 'image'}
        fullSizePreview={forModal || !showMaxItemsNotice}
        editMode={forModal}
        compactImage={forModal ? false : tableCell}
        largeImage={forModal ? false : mode === 'image' && isFigmaStripMode}
        largeFile={forModal ? false : mode === 'file' && isFigmaStripMode}
        compactFile={!forModal && tableCell && mode === 'file'}
        hoverPreview={forModal ? true : hoverPreview}
        isSelected={selectedSet.has(String(file?.id || '').trim())}
        onToggleSelected={
          showSelectionTools ? () => handleToggleSelectFile(file?.id) : null
        }
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
        label={label || (tableCell ? 'Files' : '')}
        tableCell={tableCell}
        isImageMode={mode === 'image'}
        figmaStrip={isFigmaStripMode}
        selectionLabel={mode === 'image' ? 'images' : 'files'}
        maxFiles={maxFiles}
        canOpenSequenceEditor={showHeaderEditorButton}
        onOpenSequenceEditor={() => setIsSequenceEditorOpen(true)}
        showDownloadButton={effectiveShowDownloadButton}
        isDownloading={isDownloading}
        onDownload={handleDownload}
        showSelectAll={showSelectionTools}
        allSelected={allSelected}
        selectedCount={selectedCount}
        totalCount={selectableIds.length}
        onToggleSelectAll={handleToggleSelectAll}
        showToggleSelectButton={showSelectionTools}
        onToggleSelect={handleToggleSelect}
        showRemoveSelectedButton={showRemoveSelectedButton}
        onRemoveSelected={handleRemoveSelected}
        disableRemoveSelected={disableRemoveSelectedButton}
        showWatermarkToggle={effectiveShowDownloadButton && mode === 'image'}
        applyWatermarkOnDownload={applyWatermarkOnDownload}
        onToggleApplyWatermark={() =>
          setApplyWatermarkOnDownload((prev) => !prev)
        }
      />

      <div className={styles.dropZoneEditorWrap}>
        <Main_DropZone
          {...baseDropZoneProps}
          testIdPrefix={testIdPrefix}
          compact={compact}
          tableCell={tableCell}
          figmaImageStrip={isFigmaStripMode}
        >
          {renderPreviewContent(false)}
        </Main_DropZone>
      </div>

      {canOpenSequenceEditor && (
        <Sub_SequenceEditorModal
          isOpen={isSequenceEditorOpen}
          onClose={() => setIsSequenceEditorOpen(false)}
          showDownloadButton={effectiveShowDownloadButton}
          isDownloading={isDownloading}
          onDownload={handleDownload}
          showSortButton
          canSort={fileList.length > 1 && !disabled}
          onSortByName={handleSortByName}
          onSortBySize={handleSortBySize}
          showSelectAll={showSelectionTools}
          allSelected={allSelected}
          selectedCount={selectedCount}
          totalCount={selectableIds.length}
          onToggleSelectAll={handleToggleSelectAll}
          showToggleSelectButton={showSelectionTools}
          onToggleSelect={handleToggleSelect}
          showRemoveSelectedButton={showRemoveSelectedButton}
          onRemoveSelected={handleRemoveSelected}
          disableRemoveSelected={disableRemoveSelectedButton}
          showWatermarkToggle={effectiveShowDownloadButton && mode === 'image'}
          applyWatermarkOnDownload={applyWatermarkOnDownload}
          onToggleApplyWatermark={() =>
            setApplyWatermarkOnDownload((prev) => !prev)
          }
          selectionLabel={mode === 'image' ? 'images' : 'files'}
          showSequencePreviewPanel={mode === 'image'}
          previewItems={sequencePreviewItems}
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
  figmaStrip: PropTypes.bool,
  hoverPreview: PropTypes.bool,
  enableSequenceEditor: PropTypes.bool,
  showDownloadButton: PropTypes.bool,
  downloadEndpoint: PropTypes.string,
  downloadRequestBody: PropTypes.object,
  downloadFileBaseName: PropTypes.string,
  downloadNameProductId: PropTypes.string,
  downloadNameImageType: PropTypes.string,
  watermarkImagePath: PropTypes.string,
  fileUrlBase: PropTypes.string,

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
