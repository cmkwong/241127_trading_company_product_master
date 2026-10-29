import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ExcelJS from 'exceljs';
import SearchSideBarListSearchBar from './SearchSideBarListSearchBar';
import Sub_ExpandedWindow from './Sub_ExpandedWindow';
import Main_ViewTables from '../Tables/Main_ViewTables';
import expandedStyles from './Sub_ExpandedWindow.module.css';

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

const fetchImageAsBase64 = async (src) => {
  const normalizedSrc = String(src || '').trim();
  if (!normalizedSrc) return '';

  if (normalizedSrc.startsWith('data:image/')) {
    const base64Segment = normalizedSrc.split(',')[1] || '';
    return base64Segment;
  }

  const response = await fetch(normalizedSrc);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const blob = await response.blob();

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return String(dataUrl).split(',')[1] || '';
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
  onExportCatalog,
  onVisibleItemIdsChange,
}) => {
  const [sortKey, setSortKey] = useState('Header');
  const [sortDirection, setSortDirection] = useState('asc');
  const [columnFilters, setColumnFilters] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState({});
  // Track which subrows are expanded (by itemId)
  const [expandedSubRows, setExpandedSubRows] = useState({});
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

    return ['Icon', 'Header', ...Array.from(labels), 'Select'];
  }, [items, getItemRows]);

  const filterableColumns = useMemo(() => {
    return new Set(tableColumns.filter((column) => column !== 'Icon'));
  }, [tableColumns]);

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
      if (column === 'Select') {
        return '';
      }

      if (column === 'Icon') {
        return String(getItemIconUrl(item) || '').trim();
      }

      if (column === 'Header') {
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

  const visibleSortedKeys = useMemo(
    () => sortedItems.map((item, index) => toRowKey(getItemId(item) ?? index)),
    [sortedItems, getItemId],
  );

  const allVisibleSelected = useMemo(() => {
    if (visibleSortedKeys.length === 0) return false;
    return visibleSortedKeys.every((key) => selectedRowKeys[key]);
  }, [visibleSortedKeys, selectedRowKeys]);

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

  const handleSort = (column) => {
    if (column === 'Icon' || column === 'Select') {
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
    if (column === 'Icon' || column === 'Select') {
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

  const toggleRowSelection = useCallback((rowKey) => {
    const normalizedKey = toRowKey(rowKey);
    if (!normalizedKey) return;

    setSelectedRowKeys((prev) => ({
      ...prev,
      [normalizedKey]: !prev[normalizedKey],
    }));
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedRowKeys((prev) => {
      const allSelected =
        visibleSortedKeys.length > 0 &&
        visibleSortedKeys.every((key) => prev[key]);

      const next = { ...prev };

      visibleSortedKeys.forEach((key) => {
        next[key] = !allSelected;
      });

      return next;
    });
  }, [visibleSortedKeys]);

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

  const getExcelCellText = useCallback((value) => {
    if (isNil(value) || value === '') {
      return '';
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'object') {
      if (value.type === 'link') {
        return String(value.text || value.href || value.url || '');
      }

      if (value.type === 'image') {
        return String(value.text || value.alt || value.url || value.src || '');
      }

      if (!isNil(value.label) || !isNil(value.value)) {
        return `${value.label ? `${value.label}: ` : ''}${String(value.value || '')}`;
      }

      return JSON.stringify(value);
    }

    return String(value);
  }, []);

  const getExcelRowData = useCallback(
    (item) => {
      const rowData = {};

      tableColumns.forEach((column) => {
        const cellValue = getCellValue(item, column);

        if (column === 'Select') {
          const itemKey = toRowKey(getItemId(item));
          rowData[column] = selectedRowKeys[itemKey] ? 'Selected' : '';
          return;
        }

        if (column === 'Icon') {
          rowData[column] = String(cellValue || '');
          return;
        }

        const lines = toArray(cellValue);
        rowData[column] = lines
          .map(getExcelCellText)
          .filter(Boolean)
          .join('\n');
      });

      return rowData;
    },
    [tableColumns, getCellValue, getExcelCellText, getItemId, selectedRowKeys],
  );

  const downloadExcel = useCallback(async () => {
    if (isDownloadingExcel) {
      return;
    }

    setIsDownloadingExcel(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const safeSheetName =
        String(exportSheetName || 'Search Results')
          .replace(/[[\\/:*?\]]/g, ' ')
          .slice(0, 31)
          .trim() || 'Search Results';

      const worksheet = workbook.addWorksheet(safeSheetName);

      worksheet.columns = tableColumns.map((column) => ({
        header: column,
        key: column,
      }));

      worksheet.getColumn('Select').width = 12;
      worksheet.getColumn('Icon').width = 12;

      sortedItems.forEach((item) => {
        worksheet.addRow(getExcelRowData(item));
      });

      for (let rowIndex = 0; rowIndex < sortedItems.length; rowIndex += 1) {
        const item = sortedItems[rowIndex];
        const iconUrl = String(getItemIconUrl(item) || '').trim();
        if (!iconUrl) {
          continue;
        }

        try {
          const base64 = await fetchImageAsBase64(iconUrl);
          if (!base64) continue;

          const imageId = workbook.addImage({
            base64,
            extension: 'png',
          });

          const excelRowNumber = rowIndex + 2;
          worksheet.getRow(excelRowNumber).height = 42;

          worksheet.addImage(imageId, {
            tl: { col: 1 + 0.15, row: excelRowNumber - 1 + 0.12 },
            ext: { width: 34, height: 34 },
          });
        } catch {
          // Ignore icon embedding failure and continue exporting text data.
        }
      }

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };

      worksheet.columns.forEach((column) => {
        let maxLength = String(column.header || '').length;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const content = String(cell.value || '');
          maxLength = Math.max(maxLength, content.length);
        });
        column.width = Math.min(Math.max(maxLength + 2, 12), 60);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileSafeName =
        String(exportFileName || 'search_results').trim() || 'search_results';
      const anchor = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      anchor.href = objectUrl;
      anchor.download = `${fileSafeName}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 500);
    } finally {
      setIsDownloadingExcel(false);
    }
  }, [
    isDownloadingExcel,
    exportSheetName,
    tableColumns,
    sortedItems,
    getExcelRowData,
    exportFileName,
    getItemIconUrl,
  ]);

  const handleExportCatalog = useCallback(() => {
    if (typeof onExportCatalog !== 'function') {
      return;
    }
    const selectedItems = sortedItems.filter((item, index) => {
      const key = toRowKey(getItemId(item) ?? index);
      return Boolean(selectedRowKeys[key]);
    });
    const items = selectedItems.length > 0 ? selectedItems : sortedItems;
    onExportCatalog({ items, getItemId });
  }, [onExportCatalog, sortedItems, selectedRowKeys, getItemId]);

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
            className={expandedStyles.expandedCellLink}
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
        return <span className={expandedStyles.expandedCellEmpty}>-</span>;
      }

      return (
        <button
          type="button"
          className={expandedStyles.overlayIconButton}
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
            className={expandedStyles.overlayIconImage}
          />
        </button>
      );
    }

    if (column === 'Select') {
      const itemKey =
        typeof itemOrId === 'object'
          ? toRowKey(getItemId(itemOrId))
          : toRowKey(itemOrId);

      return (
        <input
          type="checkbox"
          checked={Boolean(selectedRowKeys[itemKey])}
          onChange={(event) => {
            event.stopPropagation();
            toggleRowSelection(itemKey);
          }}
          onClick={(event) => event.stopPropagation()}
          className={expandedStyles.selectCheckbox}
          aria-label={`Select row ${itemKey}`}
        />
      );
    }

    const lines = toArray(value);
    if (lines.length === 0) {
      return <span className={expandedStyles.expandedCellEmpty}>-</span>;
    }
    // Special: horizontal image row for Images field
    if (column === 'Images') {
      return renderImageRow(lines);
    }
    if (lines.length === 1) {
      return renderLineContent(lines[0]);
    }
    return (
      <div className={expandedStyles.expandedCellMultiLine}>
        {lines.map((line, index) => {
          const content = renderLineContent(line);
          if (!content) return null;
          return (
            <div
              key={`${keyBase}-${column}-line-${index}`}
              className={expandedStyles.expandedCellLine}
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
      <tr key={`${itemId}-details`} className={expandedStyles.overlayDetailRow}>
        <td
          className={expandedStyles.overlayDetailCell}
          colSpan={tableColumns.length}
        >
          <div className={expandedStyles.overlayDetailGrid}>
            {subRows.map((subRow, subIndex) => {
              const fields = Array.isArray(subRow?.fields) ? subRow.fields : [];
              return (
                <div
                  key={`${itemId}-sub-${subIndex}`}
                  className={expandedStyles.overlayDetailCard}
                >
                  <div className={expandedStyles.overlayDetailTitle}>
                    {subRow?.title || `Detail ${subIndex + 1}`}
                  </div>
                  {fields.length > 0 ? (
                    <div className={expandedStyles.overlayDetailFields}>
                      {fields.map((field, fieldIndex) => (
                        <div
                          key={`${itemId}-sub-${subIndex}-field-${fieldIndex}`}
                          className={expandedStyles.overlayDetailField}
                        >
                          <div
                            className={expandedStyles.overlayDetailFieldLabel}
                          >
                            {field?.label || '-'}
                          </div>
                          <div
                            className={expandedStyles.overlayDetailFieldValue}
                          >
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
                    <div className={expandedStyles.expandedCellEmpty}>
                      No details
                    </div>
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

  const getColumnClassName = (column) => {
    const map = {
      Select: expandedStyles.overlayColSelect,
      Icon: expandedStyles.overlayColIcon,
      Header: expandedStyles.overlayColTitle,
      'Product Keywords': expandedStyles.overlayColProductKeywords,
      ID: expandedStyles.overlayColId,
      Status: expandedStyles.overlayColStatus,
      Categories: expandedStyles.overlayColCategories,
      Alibaba: expandedStyles.overlayColAlibaba,
      'Created At': expandedStyles.overlayColCreatedAt,
      'Updated At': expandedStyles.overlayColUpdatedAt,
    };

    return map[column] || '';
  };

  return (
    <Sub_ExpandedWindow
      title="Expanded Search Table"
      onClose={onClose}
      onReset={handleClearSearchAndFilters}
      onExportExcel={downloadExcel}
      onExportCatalog={handleExportCatalog}
      isExportingExcel={isDownloadingExcel}
      isSelectAllActive={allVisibleSelected}
      onToggleSelectAll={toggleSelectAll}
      searchBar={
        <SearchSideBarListSearchBar
          value={searchValue}
          onChange={onSearchChange}
          searchHistory={searchHistory}
          onSelectHistory={handleSelectHistoryInModal}
          onClear={handleClearSearchAndFilters}
          onCommitSearch={onCommitSearch}
          placeholder={searchPlaceholder}
          hideToolbarActions
          containerClassName={expandedStyles.expandedSearchContainer}
          fieldWrapperClassName={expandedStyles.expandedSearchFieldWrapper}
          inputClassName={expandedStyles.expandedSearchInput}
          inlineButtonClassName={expandedStyles.expandedSearchInlineButton}
        />
      }
      tableWrapRef={tableWrapRef}
      previewImage={previewImage}
      onClosePreviewImage={() => setPreviewImage(null)}
      hoverPreview={hoverPreview}
    >
      <Main_ViewTables
        rows={sortedItems}
        columns={tableColumns.map((column) => ({
          key: column,
          label: column,
          sortable: column !== 'Icon' && column !== 'Select',
        }))}
        rowKey={(item, index) => toRowKey(getItemId(item) ?? index)}
        emptyMessage={noResultsMessage}
        sortState={{
          columnKey: sortKey,
          direction: sortDirection,
        }}
        onSort={(column) => handleSort(column.key)}
        sortIndicator={Object.fromEntries(
          tableColumns.map((column) => [column, getSortIndicator(column)]),
        )}
        filterRow={tableColumns.map((column) => {
          const isFilterable = filterableColumns.has(column);

          return (
            <th key={`${column}-filter`} className={getColumnClassName(column)}>
              {isFilterable ? (
                <input
                  type="text"
                  value={columnFilters[column] || ''}
                  onChange={(event) =>
                    handleFilterChange(column, event.target.value)
                  }
                  className={expandedStyles.overlayColumnFilterInput}
                  placeholder={`Filter ${column}...`}
                  aria-label={`Filter ${column}`}
                />
              ) : (
                <div
                  className={expandedStyles.overlayColumnFilterPlaceholder}
                />
              )}
            </th>
          );
        })}
        rowClassName={(item, rowIndex) =>
          `${expandedStyles.overlayDataRow} ${
            rowIndex % 2 === 1 ? expandedStyles.overlayDataRowAlt : ''
          }`.trim()
        }
        selectedRowClassName={expandedStyles.overlaySelectedRow}
        getIsRowSelected={(_, __, key) => toRowKey(selectedItemId) === key}
        onRowClick={(item, _rowIndex, rowKey, event) => {
          const isCheckboxTarget =
            event?.target instanceof HTMLInputElement &&
            event.target.type === 'checkbox';

          if (isCheckboxTarget) {
            return;
          }

          handleRowClick(item, rowKey);
        }}
        onRowDoubleClick={(event, _item, _rowIndex, key) => {
          event.stopPropagation();
          setExpandedSubRows((old) => ({
            ...old,
            [key]: !old[key],
          }));
        }}
        setRowRef={setRowRef}
        colClassNameMap={Object.fromEntries(
          tableColumns.map((column) => {
            const className = `${
              column === 'Icon'
                ? expandedStyles.overlayIconCell
                : column === 'Select'
                  ? expandedStyles.overlaySelectCell
                  : ''
            } ${getColumnClassName(column)}`.trim();
            return [column, className];
          }),
        )}
        renderAfterRow={(item, _rowIndex, key) => renderSubRows(item, key)}
        renderCell={({ row, column }) =>
          renderCellContent(getCellValue(row, column.key), row, column.key)
        }
        minWidth="1130px"
        wrapClassName={expandedStyles.overlayTableScrollInner}
        emptyCellClassName={expandedStyles.overlayNoRows}
      />
    </Sub_ExpandedWindow>
  );
};

export default SearchSideBarListExpandedModal;
