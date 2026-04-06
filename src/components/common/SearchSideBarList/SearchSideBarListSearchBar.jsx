import { useState } from 'react';
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

const SearchSideBarListSearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  searchHistory = [],
  onSelectHistory,
  onClear,
  onCommitSearch,
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
          className={styles.searchInlineButton}
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

        <button
          type="button"
          className={styles.searchInlineButton}
          title="Clear search"
          aria-label="Clear search"
          onClick={() => {
            onClear?.();
            setShowHistory(false);
          }}
          disabled={!String(value || '').trim()}
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {showHistory &&
          Array.isArray(searchHistory) &&
          searchHistory.length > 0 && (
            <div className={styles.searchHistoryPanel}>
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
