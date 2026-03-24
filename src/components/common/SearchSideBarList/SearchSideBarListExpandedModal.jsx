import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SearchSideBarListSearchBar from './SearchSideBarListSearchBar';
import styles from './SearchSideBarList.module.css';

const normalizeLabel = (value) => String(value || '').replace(/:\s*$/, '');

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
}) => {
  const [sortKey, setSortKey] = useState('Title');
  const [sortDirection, setSortDirection] = useState('asc');
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
      const left = String(getCellValue(a, sortKey) ?? '');
      const right = String(getCellValue(b, sortKey) ?? '');
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
                    <tr
                      key={itemId}
                      ref={(element) => setRowRef(itemId, element)}
                      tabIndex={-1}
                      className={isSelected ? styles.overlaySelectedRow : ''}
                      onClick={() => handleRowClick(item)}
                    >
                      {tableColumns.map((column) => (
                        <td key={`${itemId}-${column}`}>
                          {getCellValue(item, column)}
                        </td>
                      ))}
                    </tr>
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
    </div>
  );
};

export default SearchSideBarListExpandedModal;
