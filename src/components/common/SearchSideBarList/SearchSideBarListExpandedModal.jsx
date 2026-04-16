import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import SearchSideBarListSearchBar from './SearchSideBarListSearchBar';
import styles from './SearchSideBarList.module.css';

const normalizeLabel = (value) => String(value || '').replace(/:\s*$/, '');
const toRowKey = (value) =>
  value === undefined || value === null ? '' : String(value);

const isNil = (value) => value === null || value === undefined;

const toArray = (value) => {
  if (isNil(value) || value === '') return [];
  return Array.isArray(value) ? value : [value];
};

const getLineText = (line) => {
  if (isNil(line)) return '';
  if (typeof line === 'string' || typeof line === 'number') {
    return String(line);
  }

  if (typeof line === 'object') {
    if (line.type === 'link') {
      return String(line.text || line.href || '');
    }

    if (line.type === 'image') {
      return String(line.text || line.alt || line.url || '');
    }

    if (!isNil(line.label) || !isNil(line.value)) {
      return `${line.label ? `${line.label}: ` : ''}${String(line.value || '')}`;
    }

    return JSON.stringify(line);
  }

  return String(line);
};

const getImageSource = (line) => {
  if (!line || typeof line !== 'object') return '';

  return String(
    line.url || line.src || line.image_url || line._objUrl || '',
  ).trim();
};

const getSortableText = (value) => {
  const lines = toArray(value);
  if (lines.length === 0) {
    return '';
  }

  return lines.map(getLineText).join(' | ');
};

const IMAGE_MIME_TO_EXTENSION = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image blob.'));
    reader.readAsDataURL(blob);
  });

const getImageExtensionFromDataUrl = (dataUrl) => {
  const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9+.-]+);/i);
  const mimeType = String(match?.[1] || '').toLowerCase();
  return IMAGE_MIME_TO_EXTENSION[mimeType] || 'png';
};

const getImageExtensionFromUrl = (url) => {
  const normalized = String(url || '')
    .trim()
    .toLowerCase();
  if (!normalized) {
    return 'png';
  }

  if (normalized.includes('.jpeg') || normalized.includes('.jpg')) {
    return 'jpeg';
  }
  if (normalized.includes('.webp')) {
    return 'webp';
  }
  if (normalized.includes('.gif')) {
    return 'gif';
  }
  if (normalized.includes('.bmp')) {
    return 'bmp';
  }

  return 'png';
};

const sanitizeExportName = (value, fallback) => {
  const cleaned = String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_');

  return cleaned || fallback;
};

const sanitizeSheetName = (value, fallback = 'Sheet1') => {
  const cleaned = String(value || '')
    .replace(/[\\/?*\]:]+/g, ' ')
    .replace(/\[/g, ' ')
    .trim();

  if (!cleaned) {
    return fallback;
  }

  return cleaned.slice(0, 31);
};

const getExportCellText = (value) => {
  const lines = toArray(value);
  if (lines.length === 0) {
    return '';
  }

  return lines
    .map((line) => {
      if (line && typeof line === 'object' && line.type === 'image') {
        return String(line.text || line.alt || '').trim();
      }
      return getLineText(line);
    })
    .filter((line) => String(line || '').trim().length > 0)
    .join('\n');
};

const getFirstImageLine = (value) => {
  const lines = toArray(value);
  return lines.find(
    (line) => line && typeof line === 'object' && line.type === 'image',
  );
};

const EXPORT_IMAGE_BATCH_LIMIT = 10;

const chunkArray = (list, size) => {
  const chunkSize = Math.max(1, Number(size) || 1);
  const chunks = [];

  for (let index = 0; index < list.length; index += chunkSize) {
    chunks.push(list.slice(index, index + chunkSize));
  }

  return chunks;
};

const SearchSideBarListExpandedModal = ({
  isOpen,
  onClose,
  items = [],
  selectedItemId,
  onSelectItem,
  searchValue = '',
  onSearchChange,
  searchHistory = [],
  onSelectSearchHistory,
  onClearSearch,
  onCommitSearch,
  searchPlaceholder = 'Search...',
  noResultsMessage = 'No results found',
  getItemId = (item) => item?.id,
  getItemTitle = (item) => item?.name || '',
  getItemIconUrl = (item) => item?.icon_url,
  getItemIconAlt = (item) => item?.name || 'item',
  getItemRows = () => [],
  getItemSubRows = () => [],
  exportFileName = 'search_results',
  exportSheetName = 'Search Results',
  onResolveExportImage,
  onResolveExportImagesBatch,
  onVisibleItemIdsChange,
}) => {
  const [sortKey, setSortKey] = useState('Title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [columnFilters, setColumnFilters] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  // Track which subrows are expanded (by itemId)
  const [expandedSubRows, setExpandedSubRows] = useState({});
  // Track global expand/collapse state
  const [allExpanded, setAllExpanded] = useState(true);
  const rowRefs = useRef(new Map());
  const tableWrapRef = useRef(null);
  const pendingHistoryScrollRef = useRef(false);

  const tableColumns = useMemo(() => {
    const labels = new Set();

    items.forEach((item) => {
      const rows = getItemRows(item) || [];
      rows.forEach((row) => {
        if (row?.label) {
          labels.add(normalizeLabel(row.label));
        }
      });
    });

    return ['Icon', 'Title', ...Array.from(labels)];
  }, [items, getItemRows]);

  const filterableColumns = useMemo(() => {
    return new Set(tableColumns.filter((column) => column !== 'Icon'));
  }, [tableColumns]);

  const hasAnySubRows = useMemo(() => {
    return items.some((item) => {
      const subRows = getItemSubRows(item) || [];
      return Array.isArray(subRows) && subRows.length > 0;
    });
  }, [items, getItemSubRows]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const getCellValue = useCallback(
    (item, column) => {
      if (column === 'Icon') {
        return String(getItemIconUrl(item) || '').trim();
      }

      if (column === 'Title') {
        return getItemTitle(item);
      }

      const normalizedLabel = normalizeLabel(column);
      const row = (getItemRows(item) || []).find(
        (detail) => normalizeLabel(detail?.label) === normalizedLabel,
      );

      return row?.value ?? '';
    },
    [getItemTitle, getItemRows, getItemIconUrl],
  );

  const filteredItems = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([, value]) =>
      String(value || '').trim(),
    );

    if (activeFilters.length === 0) {
      return items;
    }

    return items.filter((item) => {
      return activeFilters.every(([columnKey, query]) => {
        const cellText = getSortableText(getCellValue(item, columnKey));
        return cellText.toLowerCase().includes(
          String(query || '')
            .trim()
            .toLowerCase(),
        );
      });
    });
  }, [items, columnFilters, getCellValue]);

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];

    sorted.sort((a, b) => {
      const left = getSortableText(getCellValue(a, sortKey));
      const right = getSortableText(getCellValue(b, sortKey));
      const result = left.localeCompare(right, undefined, {
        numeric: true,
        sensitivity: 'base',
      });

      return sortDirection === 'asc' ? result : -result;
    });

    return sorted;
  }, [filteredItems, sortKey, sortDirection, getCellValue]);

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleClearSearchAndFilters = useCallback(() => {
    onClearSearch?.();
    setColumnFilters({});
  }, [onClearSearch]);

  const fetchImageAsDataUrl = useCallback(async (source) => {
    const normalized = String(source || '').trim();
    if (!normalized) {
      return null;
    }

    if (normalized.startsWith('data:image/')) {
      return {
        dataUrl: normalized,
        extension: getImageExtensionFromDataUrl(normalized),
      };
    }

    const response = await fetch(normalized);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);

    return {
      dataUrl,
      extension:
        IMAGE_MIME_TO_EXTENSION[String(blob.type || '').toLowerCase()] ||
        getImageExtensionFromDataUrl(dataUrl) ||
        getImageExtensionFromUrl(normalized),
    };
  }, []);

  const resolveImageForExport = useCallback(
    async ({ item, column, value, currentSource, skipResolverCallback }) => {
      const normalizeResolverValue = async (resolved) => {
        if (!resolved) {
          return null;
        }

        if (typeof resolved === 'string') {
          return fetchImageAsDataUrl(resolved);
        }

        if (resolved instanceof Blob) {
          const dataUrl = await blobToDataUrl(resolved);
          return {
            dataUrl,
            extension:
              IMAGE_MIME_TO_EXTENSION[
                String(resolved.type || '').toLowerCase()
              ] || getImageExtensionFromDataUrl(dataUrl),
          };
        }

        if (resolved instanceof ArrayBuffer) {
          const blob = new Blob([resolved], {
            type: 'image/png',
          });
          const dataUrl = await blobToDataUrl(blob);
          return {
            dataUrl,
            extension: 'png',
          };
        }

        if (ArrayBuffer.isView(resolved)) {
          const blob = new Blob([resolved.buffer], {
            type: 'image/png',
          });
          const dataUrl = await blobToDataUrl(blob);
          return {
            dataUrl,
            extension: 'png',
          };
        }

        if (typeof resolved === 'object') {
          const fromDataUrl = String(
            resolved.dataUrl || resolved.base64 || '',
          ).trim();
          if (fromDataUrl) {
            const normalizedDataUrl = fromDataUrl.startsWith('data:image/')
              ? fromDataUrl
              : `data:image/${String(
                  resolved.extension || 'png',
                ).toLowerCase()};base64,${fromDataUrl}`;

            return {
              dataUrl: normalizedDataUrl,
              extension:
                String(resolved.extension || '').toLowerCase() ||
                getImageExtensionFromDataUrl(normalizedDataUrl),
            };
          }

          const src = String(resolved.src || resolved.url || '').trim();
          if (src) {
            return fetchImageAsDataUrl(src);
          }
        }

        return null;
      };

      try {
        const fromCurrent = await normalizeResolverValue(currentSource);
        if (fromCurrent) {
          return fromCurrent;
        }
      } catch (error) {
        console.warn('Export image fetch failed for current source:', error);
      }

      if (skipResolverCallback || typeof onResolveExportImage !== 'function') {
        return null;
      }

      try {
        const resolvedFromCallback = await onResolveExportImage({
          item,
          itemId: getItemId(item),
          itemTitle: getItemTitle(item),
          column,
          value,
          currentSource,
        });

        return normalizeResolverValue(resolvedFromCallback);
      } catch (error) {
        console.warn('Export image resolver callback failed:', error);
      }

      return null;
    },
    [fetchImageAsDataUrl, onResolveExportImage, getItemId, getItemTitle],
  );

  const handleExportXlsx = useCallback(async () => {
    if (isExporting) {
      return;
    }

    if (sortedItems.length === 0) {
      alert('No filtered rows to export.');
      return;
    }

    setIsExporting(true);

    try {
      const excelModule = await import('exceljs');
      const ExcelJS = excelModule?.default || excelModule;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        sanitizeSheetName(exportSheetName, 'Search Results'),
      );

      worksheet.columns = tableColumns.map((column) => ({
        header: column,
        key: column,
        width: column === 'Icon' ? 14 : 20,
      }));

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle' };
      headerRow.height = 22;

      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: tableColumns.length },
      };

      const prefetchedIconByItemId = new Map();

      if (typeof onResolveExportImagesBatch === 'function') {
        const missingIconRequests = sortedItems
          .map((item) => {
            const itemId = toRowKey(getItemId(item));
            const currentSource = String(
              getCellValue(item, 'Icon') || '',
            ).trim();

            if (!itemId || currentSource) {
              return null;
            }

            return {
              item,
              itemId,
              itemTitle: getItemTitle(item),
              column: 'Icon',
              value: '',
              currentSource: '',
            };
          })
          .filter(Boolean);

        const iconRequestBatches = chunkArray(
          missingIconRequests,
          EXPORT_IMAGE_BATCH_LIMIT,
        );

        for (const requests of iconRequestBatches) {
          try {
            const resolved = await onResolveExportImagesBatch({
              requests,
              maxBatchSize: EXPORT_IMAGE_BATCH_LIMIT,
            });

            if (!resolved || typeof resolved !== 'object') {
              continue;
            }

            requests.forEach((request) => {
              const source = String(resolved[request.itemId] || '').trim();
              if (!source) {
                return;
              }

              prefetchedIconByItemId.set(request.itemId, source);
            });
          } catch (error) {
            console.warn('Export image batch resolver callback failed:', error);
          }
        }
      }

      for (const item of sortedItems) {
        const itemId = toRowKey(getItemId(item));
        const rowData = {};

        tableColumns.forEach((column) => {
          const value = getCellValue(item, column);
          rowData[column] = column === 'Icon' ? '' : getExportCellText(value);
        });

        const row = worksheet.addRow(rowData);
        row.alignment = { vertical: 'top', wrapText: true };

        let rowHasImage = false;

        for (let index = 0; index < tableColumns.length; index += 1) {
          const column = tableColumns[index];
          const cellValue = getCellValue(item, column);
          const imageLine =
            column === 'Icon' ? null : getFirstImageLine(cellValue);

          if (column !== 'Icon' && !imageLine) {
            continue;
          }

          const sourceCandidate =
            column === 'Icon'
              ? String(
                  cellValue || prefetchedIconByItemId.get(itemId) || '',
                ).trim()
              : getImageSource(imageLine);

          const skipResolverCallback =
            column === 'Icon' &&
            typeof onResolveExportImagesBatch === 'function';

          const imagePayload = await resolveImageForExport({
            item,
            column,
            value: cellValue,
            currentSource: sourceCandidate,
            skipResolverCallback,
          });

          if (!imagePayload?.dataUrl) {
            continue;
          }

          const imageId = workbook.addImage({
            base64: imagePayload.dataUrl,
            extension: String(imagePayload.extension || 'png').toLowerCase(),
          });

          worksheet.addImage(imageId, {
            tl: { col: index + 0.1, row: row.number - 1 + 0.1 },
            ext: { width: 64, height: 64 },
          });

          rowHasImage = true;

          if (column !== 'Icon') {
            const currentText = String(
              row.getCell(index + 1).value || '',
            ).trim();
            if (!currentText) {
              row.getCell(index + 1).value = String(
                imageLine?.text || imageLine?.alt || 'image',
              );
            }
          }
        }

        if (rowHasImage) {
          row.height = 52;
        }
      }

      tableColumns.forEach((column, index) => {
        if (column === 'Icon') {
          worksheet.getColumn(index + 1).width = 14;
          return;
        }

        let longest = String(column).length;

        worksheet
          .getColumn(index + 1)
          .eachCell({ includeEmpty: true }, (cell) => {
            const text = String(cell.value || '');
            const localLongest = text
              .split('\n')
              .reduce((max, part) => Math.max(max, part.length), 0);
            longest = Math.max(longest, localLongest);
          });

        worksheet.getColumn(index + 1).width = Math.max(
          14,
          Math.min(52, longest + 2),
        );
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileBlob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const downloadUrl = URL.createObjectURL(fileBlob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `${sanitizeExportName(exportFileName, 'search_results')}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (error) {
      console.error('Failed to export filtered table as xlsx:', error);
      alert('Failed to export xlsx. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [
    isExporting,
    sortedItems,
    exportFileName,
    exportSheetName,
    tableColumns,
    getCellValue,
    getItemId,
    getItemTitle,
    onResolveExportImagesBatch,
    resolveImageForExport,
  ]);

  const handleSort = (column) => {
    if (column === 'Icon') {
      return;
    }

    if (sortKey === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(column);
    setSortDirection('asc');
  };

  const getSortIndicator = (column) => {
    if (column === 'Icon') {
      return '';
    }

    if (sortKey !== column) {
      return '↕';
    }

    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleRowClick = (item) => {
    onSelectItem?.(item);
    onClose?.();
  };

  const handleIconMouseEnter = useCallback((event, src, alt) => {
    setHoverPreview({
      src,
      alt,
      x: event.clientX + 20,
      y: event.clientY + 20,
    });
  }, []);

  const handleIconMouseMove = useCallback((event) => {
    setHoverPreview((prev) => {
      if (!prev?.src) return prev;
      return {
        ...prev,
        x: event.clientX + 20,
        y: event.clientY + 20,
      };
    });
  }, []);

  const handleIconMouseLeave = useCallback(() => {
    setHoverPreview(null);
  }, []);

  const setRowRef = useCallback((itemId, element) => {
    const rowKey = toRowKey(itemId);
    if (!rowKey) {
      return;
    }

    if (element) {
      rowRefs.current.set(rowKey, element);
      return;
    }

    rowRefs.current.delete(rowKey);
  }, []);

  const scrollToSelectedRow = useCallback(() => {
    const selectedKey = toRowKey(selectedItemId);
    if (!selectedKey) {
      return;
    }

    const root = tableWrapRef.current;
    const targetNode = rowRefs.current.get(selectedKey);
    if (!targetNode) {
      return;
    }

    if (!root) {
      targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const targetTop = targetNode.offsetTop;
    const targetHeight = targetNode.offsetHeight;
    const desiredTop = Math.max(
      0,
      targetTop - root.clientHeight / 2 + targetHeight / 2,
    );

    root.scrollTo({
      top: desiredTop,
      behavior: 'smooth',
    });

    targetNode.focus({ preventScroll: true });
  }, [selectedItemId]);

  useEffect(() => {
    if (!isOpen || !pendingHistoryScrollRef.current) {
      return;
    }

    if (selectedItemId === undefined || selectedItemId === null) {
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      scrollToSelectedRow();

      window.setTimeout(() => {
        scrollToSelectedRow();
        pendingHistoryScrollRef.current = false;
      }, 80);
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [isOpen, selectedItemId, sortedItems, scrollToSelectedRow]);

  const handleSelectHistoryInModal = useCallback(
    (entry) => {
      pendingHistoryScrollRef.current = true;
      onSelectSearchHistory?.(entry);
    },
    [onSelectSearchHistory],
  );

  useEffect(() => {
    if (!isOpen || typeof onVisibleItemIdsChange !== 'function') {
      return;
    }

    const root = tableWrapRef.current;
    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const ids = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.getAttribute('data-item-id'))
          .filter(Boolean);

        if (ids.length > 0) {
          onVisibleItemIdsChange(ids);
        }
      },
      {
        root,
        rootMargin: '180px 0px',
        threshold: 0.01,
      },
    );

    rowRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    // Prime initial visible range quickly
    onVisibleItemIdsChange(
      sortedItems
        .slice(0, 60)
        .map((item) => getItemId(item))
        .filter(Boolean),
    );

    return () => observer.disconnect();
  }, [isOpen, sortedItems, getItemId, onVisibleItemIdsChange]);

  // Helper for horizontal image row, double size, no caption
  const renderImageRow = (images) => {
    if (!Array.isArray(images) || images.length === 0) return null;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 16,
          alignItems: 'center',
          margin: '8px 0',
        }}
      >
        {images.map((line, idx) => {
          const src = getImageSource(line);
          const alt = String(line.alt || line.text || 'image');
          if (!src) return null;
          return (
            <button
              key={src + idx}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage({ src, alt });
              }}
              title="Preview image"
            >
              <img
                src={src}
                alt={alt}
                style={{
                  width: 128,
                  height: 128,
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 1px 6px #0002',
                }}
              />
            </button>
          );
        })}
      </div>
    );
  };

  const renderLineContent = (line) => {
    if (isNil(line) || line === '') {
      return null;
    }

    if (typeof line === 'string' || typeof line === 'number') {
      return <span>{String(line)}</span>;
    }

    if (typeof line === 'object') {
      if (line.type === 'link') {
        const href = String(line.href || line.url || '').trim();
        const linkText = String(line.text || href || '');
        if (!href) {
          return <span>{linkText}</span>;
        }
        return (
          <a
            className={styles.expandedCellLink}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            {linkText}
          </a>
        );
      }
      // Images handled in renderCellContent for horizontal row

      if (!isNil(line.label) || !isNil(line.value)) {
        return (
          <span>
            {line.label ? `${line.label}: ` : ''}
            {String(line.value || '')}
          </span>
        );
      }

      return <span>{JSON.stringify(line)}</span>;
    }

    return <span>{String(line)}</span>;
  };

  const renderCellContent = (value, itemOrId, column) => {
    const keyBase =
      typeof itemOrId === 'object'
        ? getItemId(itemOrId) || 'item'
        : String(itemOrId || 'item');

    if (column === 'Icon') {
      const iconUrl = String(value || '').trim();
      if (!iconUrl) {
        return <span className={styles.expandedCellEmpty}>-</span>;
      }

      return (
        <button
          type="button"
          className={styles.overlayIconButton}
          onClick={(event) => {
            event.stopPropagation();
            setPreviewImage({
              src: iconUrl,
              alt: getItemIconAlt(itemOrId) || 'icon',
            });
          }}
          onMouseEnter={(event) =>
            handleIconMouseEnter(
              event,
              iconUrl,
              getItemIconAlt(itemOrId) || 'icon',
            )
          }
          onMouseMove={handleIconMouseMove}
          onMouseLeave={handleIconMouseLeave}
          title="Hover to preview, click to zoom"
        >
          <img
            src={iconUrl}
            alt={getItemIconAlt(itemOrId) || 'icon'}
            className={styles.overlayIconImage}
          />
        </button>
      );
    }

    const lines = toArray(value);
    if (lines.length === 0) {
      return <span className={styles.expandedCellEmpty}>-</span>;
    }
    // Special: horizontal image row for Images field
    if (column === 'Images') {
      return renderImageRow(lines);
    }
    if (lines.length === 1) {
      return renderLineContent(lines[0]);
    }
    return (
      <div className={styles.expandedCellMultiLine}>
        {lines.map((line, index) => {
          const content = renderLineContent(line);
          if (!content) return null;
          return (
            <div
              key={`${keyBase}-${column}-line-${index}`}
              className={styles.expandedCellLine}
            >
              {content}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSubRows = (item, itemId) => {
    const subRows = getItemSubRows(item) || [];
    if (!Array.isArray(subRows) || subRows.length === 0) {
      return null;
    }
    const expanded = expandedSubRows[itemId] !== false;
    if (!expanded) return null;
    return (
      <tr key={`${itemId}-details`} className={styles.overlayDetailRow}>
        <td className={styles.overlayDetailCell} colSpan={tableColumns.length}>
          <div className={styles.overlayDetailGrid}>
            {subRows.map((subRow, subIndex) => {
              const fields = Array.isArray(subRow?.fields) ? subRow.fields : [];
              return (
                <div
                  key={`${itemId}-sub-${subIndex}`}
                  className={styles.overlayDetailCard}
                >
                  <div className={styles.overlayDetailTitle}>
                    {subRow?.title || `Detail ${subIndex + 1}`}
                  </div>
                  {fields.length > 0 ? (
                    <div className={styles.overlayDetailFields}>
                      {fields.map((field, fieldIndex) => (
                        <div
                          key={`${itemId}-sub-${subIndex}-field-${fieldIndex}`}
                          className={styles.overlayDetailField}
                        >
                          <div className={styles.overlayDetailFieldLabel}>
                            {field?.label || '-'}
                          </div>
                          <div className={styles.overlayDetailFieldValue}>
                            {renderCellContent(
                              field?.value,
                              `${itemId}-sub-${subIndex}`,
                              field?.label || `field-${fieldIndex}`,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.expandedCellEmpty}>No details</div>
                  )}
                </div>
              );
            })}
          </div>
        </td>
      </tr>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Expanded Search Table</div>
          <div className={styles.modalHeaderActions}>
            <button
              type="button"
              className={styles.exportButton}
              onClick={handleExportXlsx}
              title="Export filtered table to XLSX"
              aria-label="Export filtered table to XLSX"
              disabled={isExporting || sortedItems.length === 0}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.focusButton}
              onClick={scrollToSelectedRow}
              title="Scroll to selected item"
              aria-label="Scroll to selected item"
              disabled={selectedItemId === undefined || selectedItemId === null}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
              </svg>
            </button>
            {hasAnySubRows ? (
              <button
                type="button"
                style={{
                  marginRight: 8,
                  borderRadius: 6,
                  border: '1px solid #bcd',
                  background: allExpanded ? '#e3f2fd' : '#fff',
                  color: '#1976d2',
                  cursor: 'pointer',
                  height: 32,
                  width: 40,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => {
                  setAllExpanded((prev) => {
                    const next = !prev;
                    setExpandedSubRows(() => {
                      const newState = {};
                      sortedItems.forEach((item, idx) => {
                        const itemId = getItemId(item) || idx;
                        newState[itemId] = next;
                      });
                      return newState;
                    });
                    return next;
                  });
                }}
                title={
                  allExpanded ? 'Collapse all details' : 'Expand all details'
                }
                aria-label={
                  allExpanded ? 'Collapse all details' : 'Expand all details'
                }
              >
                {allExpanded ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>
            ) : null}
            <button
              type="button"
              className={styles.closeOverlayButton}
              onClick={onClose}
              aria-label="Close expanded table"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.overlaySearchBar}>
          <SearchSideBarListSearchBar
            value={searchValue}
            onChange={onSearchChange}
            searchHistory={searchHistory}
            onSelectHistory={handleSelectHistoryInModal}
            onClear={handleClearSearchAndFilters}
            onCommitSearch={onCommitSearch}
            placeholder={searchPlaceholder}
          />
          <button
            type="button"
            className={styles.overlayResetFiltersBtn}
            onClick={handleClearSearchAndFilters}
            title="Reset all search fields"
            aria-label="Reset all search fields"
          >
            Reset All
          </button>
        </div>

        <div ref={tableWrapRef} className={styles.overlayTableWrap}>
          <table className={styles.overlayTable}>
            <thead>
              <tr className={styles.overlayHeaderRow}>
                {tableColumns.map((column) => (
                  <th key={column}>
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => handleSort(column)}
                      disabled={column === 'Icon'}
                    >
                      <span>{column}</span>
                      <span className={styles.sortIndicator}>
                        {getSortIndicator(column)}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
              <tr className={styles.overlayFilterRow}>
                {tableColumns.map((column) => {
                  const isFilterable = filterableColumns.has(column);

                  return (
                    <th key={`${column}-filter`}>
                      {isFilterable ? (
                        <input
                          type="text"
                          value={columnFilters[column] || ''}
                          onChange={(event) =>
                            handleFilterChange(column, event.target.value)
                          }
                          className={styles.overlayColumnFilterInput}
                          placeholder={`Filter ${column}...`}
                          aria-label={`Filter ${column}`}
                        />
                      ) : (
                        <div
                          className={styles.overlayColumnFilterPlaceholder}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedItems.length > 0 ? (
                sortedItems.map((item, index) => {
                  const itemId = getItemId(item) ?? index;
                  const rowKey = toRowKey(itemId);
                  const isSelected = toRowKey(selectedItemId) === rowKey;

                  return (
                    <Fragment key={`row-${rowKey}`}>
                      <tr
                        ref={(element) => setRowRef(rowKey, element)}
                        data-item-id={rowKey}
                        tabIndex={-1}
                        className={isSelected ? styles.overlaySelectedRow : ''}
                        onClick={() => handleRowClick(item)}
                        style={{ cursor: 'pointer' }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setExpandedSubRows((old) => ({
                            ...old,
                            [rowKey]: !old[rowKey],
                          }));
                        }}
                      >
                        {tableColumns.map((column) => (
                          <td
                            key={`${rowKey}-${column}`}
                            className={
                              column === 'Icon' ? styles.overlayIconCell : ''
                            }
                          >
                            {renderCellContent(
                              getCellValue(item, column),
                              item,
                              column,
                            )}
                          </td>
                        ))}
                      </tr>
                      {renderSubRows(item, rowKey)}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    className={styles.overlayNoRows}
                    colSpan={tableColumns.length}
                  >
                    {noResultsMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage?.src && (
        <div
          className={styles.imagePreviewOverlay}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className={styles.imagePreviewModal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.imagePreviewClose}
              onClick={() => setPreviewImage(null)}
              aria-label="Close image preview"
            >
              ✕
            </button>
            <img
              src={previewImage.src}
              alt={previewImage.alt || 'preview-image'}
              className={styles.imagePreviewLarge}
            />
          </div>
        </div>
      )}

      {hoverPreview?.src && (
        <div
          className={styles.hoverImagePreview}
          style={{ left: hoverPreview.x, top: hoverPreview.y }}
        >
          <img
            src={hoverPreview.src}
            alt={hoverPreview.alt || 'hover-preview'}
            className={styles.hoverImagePreviewLarge}
          />
        </div>
      )}
    </div>
  );
};

export default SearchSideBarListExpandedModal;
