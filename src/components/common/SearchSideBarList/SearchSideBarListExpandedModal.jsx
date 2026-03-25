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

const SearchSideBarListExpandedModal = ({
  isOpen,
  onClose,
  items = [],
  selectedItemId,
  onSelectItem,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  noResultsMessage = 'No results found',
  getItemId = (item) => item?.id,
  getItemTitle = (item) => item?.name || '',
  getItemRows = () => [],
  getItemSubRows = () => [],
}) => {
  const [sortKey, setSortKey] = useState('Title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [previewImage, setPreviewImage] = useState(null);
  // Track which subrows are expanded (by itemId)
  const [expandedSubRows, setExpandedSubRows] = useState({});
  // Track global expand/collapse state
  const [allExpanded, setAllExpanded] = useState(true);
  const rowRefs = useRef(new Map());

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

    return ['Title', ...Array.from(labels)];
  }, [items, getItemRows]);

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
      if (column === 'Title') {
        return getItemTitle(item);
      }

      const normalizedLabel = normalizeLabel(column);
      const row = (getItemRows(item) || []).find(
        (detail) => normalizeLabel(detail?.label) === normalizedLabel,
      );

      return row?.value ?? '';
    },
    [getItemTitle, getItemRows],
  );

  const sortedItems = useMemo(() => {
    const sorted = [...items];

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
  }, [items, sortKey, sortDirection, getCellValue]);

  const handleSort = (column) => {
    if (sortKey === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(column);
    setSortDirection('asc');
  };

  const getSortIndicator = (column) => {
    if (sortKey !== column) {
      return '↕';
    }

    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleRowClick = (item) => {
    onSelectItem?.(item);
    onClose?.();
  };

  const setRowRef = useCallback((itemId, element) => {
    if (element) {
      rowRefs.current.set(itemId, element);
      return;
    }

    rowRefs.current.delete(itemId);
  }, []);

  const scrollToSelectedRow = useCallback(() => {
    if (selectedItemId === undefined || selectedItemId === null) {
      return;
    }

    const targetNode = rowRefs.current.get(selectedItemId);
    if (!targetNode) {
      return;
    }

    targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetNode.focus({ preventScroll: true });
  }, [selectedItemId]);

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

  const renderCellContent = (value, itemId, column) => {
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
              key={`${itemId}-${column}-line-${index}`}
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
            placeholder={searchPlaceholder}
          />
        </div>

        <div className={styles.overlayTableWrap}>
          <table className={styles.overlayTable}>
            <thead>
              <tr>
                {tableColumns.map((column) => (
                  <th key={column}>
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => handleSort(column)}
                    >
                      <span>{column}</span>
                      <span className={styles.sortIndicator}>
                        {getSortIndicator(column)}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedItems.length > 0 ? (
                sortedItems.map((item, index) => {
                  const itemId = getItemId(item) || index;
                  const isSelected = selectedItemId === getItemId(item);

                  return (
                    <Fragment key={`row-${itemId}`}>
                      <tr
                        ref={(element) => setRowRef(itemId, element)}
                        tabIndex={-1}
                        className={isSelected ? styles.overlaySelectedRow : ''}
                        onClick={() => handleRowClick(item)}
                        style={{ cursor: 'pointer' }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setExpandedSubRows((old) => ({
                            ...old,
                            [itemId]: !old[itemId],
                          }));
                        }}
                      >
                        {tableColumns.map((column) => (
                          <td key={`${itemId}-${column}`}>
                            {renderCellContent(
                              getCellValue(item, column),
                              itemId,
                              column,
                            )}
                          </td>
                        ))}
                      </tr>
                      {renderSubRows(item, itemId)}
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
    </div>
  );
};

export default SearchSideBarListExpandedModal;
