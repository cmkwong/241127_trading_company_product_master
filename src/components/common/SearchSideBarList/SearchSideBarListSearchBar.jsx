import { useCallback, useEffect, useState } from 'react';
import Main_TextField from '../InputOptions/TextField/Main_TextField';
import styles from './SearchSideBarList.module.css';

const getHistoryLabel = (entry) => {
  if (typeof entry === 'string') return entry;
  if (entry && typeof entry === 'object') {
    return String(entry.title || entry.name || entry.label || entry.id || '');
  }
  return '';
};

const getHistoryIconUrl = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return '';
  }

  return String(
    entry.icon_url || entry.iconUrl || entry.icon || entry.src || '',
  ).trim();
};

const getHistoryEntryId = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return '';
  }

  return String(entry.id || '').trim();
};

const SearchSideBarListSearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  searchHistory = [],
  onSelectHistory,
  onClear,
  onCommitSearch,
  onVisibleHistoryItemIdsChange,
  onScrollToSelectedItem,
  selectedItemId,
  onExpand,
  showCreateButton = true,
  showExpandButton = true,
  onCreate,
  createButtonTitle = 'Create New',
  createButtonAriaLabel = 'Create New',
  expandButtonTitle = 'Expand list',
  expandButtonAriaLabel = 'Expand list',
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [hoverPreview, setHoverPreview] = useState(null);

  const handleInputChange = (ov, nv) => {
    onChange?.(nv, ov);
  };

  const handleIconMouseEnter = (event, src, alt) => {
    if (!src) return;

    setHoverPreview({
      src,
      alt,
      x: event.clientX + 18,
      y: event.clientY + 18,
    });
  };

  const handleIconMouseMove = (event) => {
    setHoverPreview((prev) => {
      if (!prev?.src) return prev;
      return {
        ...prev,
        x: event.clientX + 18,
        y: event.clientY + 18,
      };
    });
  };

  const handleIconMouseLeave = () => {
    setHoverPreview(null);
  };

  const notifyVisibleHistoryIds = useCallback(() => {
    if (typeof onVisibleHistoryItemIdsChange !== 'function') {
      return;
    }

    const ids = (searchHistory || [])
      .map((entry) => getHistoryEntryId(entry))
      .filter(Boolean);

    if (ids.length > 0) {
      onVisibleHistoryItemIdsChange(ids);
    }
  }, [onVisibleHistoryItemIdsChange, searchHistory]);

  useEffect(() => {
    if (!showHistory) {
      return;
    }

    notifyVisibleHistoryIds();
  }, [showHistory, notifyVisibleHistoryIds]);

  const hasSearchValue = String(value || '').trim().length > 0;

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchFieldWrapper}>
        <Main_TextField
          placeholder={placeholder}
          onChange={handleInputChange}
          defaultValue={value}
          onBlur={() => onCommitSearch?.(value)}
        />

        <button
          type="button"
          className={`${styles.searchInlineButton} ${styles.searchHistoryButton}`}
          title="Search history"
          aria-label="Search history"
          onClick={() => setShowHistory((prev) => !prev)}
          disabled={!Array.isArray(searchHistory) || searchHistory.length === 0}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v5h5" />
            <path d="M3.05 13a9 9 0 1 0 .5-4" />
            <path d="M12 7v5l3 2" />
          </svg>
        </button>

        {hasSearchValue ? (
          <button
            type="button"
            className={`${styles.searchInlineButton} ${styles.searchClearButton}`}
            title="Clear search"
            aria-label="Clear search"
            onClick={() => {
              onClear?.();
              setShowHistory(false);
            }}
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.focusButton}
            onClick={onScrollToSelectedItem}
            title="Scroll to selected item"
            aria-label="Scroll to selected item"
            disabled={selectedItemId === undefined || selectedItemId === null}
          >
            <svg
              width="19"
              height="19"
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

          {showExpandButton && (
            <button
              type="button"
              className={styles.expandButton}
              onClick={onExpand}
              title={expandButtonTitle}
              aria-label={expandButtonAriaLabel}
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
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          )}

          {showCreateButton && (
            <button
              type="button"
              className={styles.createButton}
              onClick={onCreate}
              title={createButtonTitle}
              aria-label={createButtonAriaLabel}
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          )}
        </div>

        {showHistory &&
          Array.isArray(searchHistory) &&
          searchHistory.length > 0 && (
            <div
              className={styles.searchHistoryPanel}
              onScroll={notifyVisibleHistoryIds}
            >
              {searchHistory.map((entry, index) => {
                const label = getHistoryLabel(entry);
                const iconUrl = getHistoryIconUrl(entry);
                if (!label) return null;

                return (
                  <button
                    key={`${label}-${index}`}
                    type="button"
                    className={styles.searchHistoryItem}
                    onClick={() => {
                      onSelectHistory?.(entry);
                      setShowHistory(false);
                    }}
                    title={label}
                  >
                    <span className={styles.searchHistoryIconWrap}>
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={label}
                          className={styles.searchHistoryIcon}
                          onMouseEnter={(event) =>
                            handleIconMouseEnter(event, iconUrl, label)
                          }
                          onMouseMove={handleIconMouseMove}
                          onMouseLeave={handleIconMouseLeave}
                        />
                      ) : (
                        <span
                          className={styles.searchHistoryIconFallback}
                          aria-hidden="true"
                        >
                          ⌕
                        </span>
                      )}
                    </span>
                    <span className={styles.searchHistoryLabel}>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
      </div>

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

export default SearchSideBarListSearchBar;
