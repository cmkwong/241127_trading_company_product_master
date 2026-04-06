import { useCallback, useEffect, useRef, useState } from 'react';
import SearchSideBarListItem from './SearchSideBarListItem';
import SearchSideBarListNoResults from './SearchSideBarListNoResults';
import SearchSideBarListSearchBar from './SearchSideBarListSearchBar';
import SearchSideBarListExpandedModal from './SearchSideBarListExpandedModal';
import styles from './SearchSideBarList.module.css';

const toItemKey = (value) =>
  value === undefined || value === null ? '' : String(value);

const SearchSideBarList = ({
  items = [],
  selectedItemId,
  onSelectItem,
  searchValue = '',
  onSearchChange,
  searchHistory = [],
  onSelectSearchHistory,
  onClearSearch,
  onCommitSearch,
  onVisibleItemIdsChange,
  searchPlaceholder = 'Search...',
  onCreate,
  showCreateButton = true,
  showExpandButton = true,
  createButtonTitle = 'Create New',
  createButtonAriaLabel = 'Create New',
  expandButtonTitle = 'Expand list',
  expandButtonAriaLabel = 'Expand list',
  noResultsMessage = 'No results found',
  getItemId = (item) => item?.id,
  getItemTitle = (item) => item?.name || '',
  getItemRows = () => [],
  getExpandedRows,
  getExpandedSubRows,
  getItemIconUrl = (item) => item?.icon_url,
  getItemIconAlt = (item) => item?.name || 'item',
  renderItemIcon,
  renderItemInfo,
  className = '',
  listClassName = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemRefs = useRef(new Map());
  const listRef = useRef(null);

  const setItemRef = useCallback((itemId, element) => {
    const itemKey = toItemKey(itemId);
    if (!itemKey) {
      return;
    }

    if (element) {
      itemRefs.current.set(itemKey, element);
      return;
    }

    itemRefs.current.delete(itemKey);
  }, []);

  const scrollToSelectedItem = useCallback(() => {
    const selectedKey = toItemKey(selectedItemId);
    if (!selectedKey) {
      return;
    }

    const root = listRef.current;
    const targetNode = itemRefs.current.get(selectedKey);
    if (!targetNode) {
      return;
    }

    if (!root) {
      targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetNode.focus({ preventScroll: true });
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
    if (selectedItemId === undefined || selectedItemId === null) {
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      scrollToSelectedItem();
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [selectedItemId, items, scrollToSelectedItem]);

  const handleSelectHistory = useCallback(
    (entry) => {
      onSelectSearchHistory?.(entry);

      window.setTimeout(() => {
        scrollToSelectedItem();
      }, 0);

      window.setTimeout(() => {
        scrollToSelectedItem();
      }, 80);
    },
    [onSelectSearchHistory, scrollToSelectedItem],
  );

  useEffect(() => {
    if (typeof onVisibleItemIdsChange !== 'function') {
      return;
    }

    const root = listRef.current;
    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleIds = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.getAttribute('data-item-id'))
          .filter(Boolean);

        if (visibleIds.length > 0) {
          onVisibleItemIdsChange(visibleIds);
        }
      },
      {
        root,
        rootMargin: '120px 0px',
        threshold: 0.01,
      },
    );

    itemRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [items, onVisibleItemIdsChange]);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          <SearchSideBarListSearchBar
            value={searchValue}
            onChange={onSearchChange}
            searchHistory={searchHistory}
            onSelectHistory={handleSelectHistory}
            onClear={onClearSearch}
            onCommitSearch={onCommitSearch}
            placeholder={searchPlaceholder}
          />
        </div>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.focusButton}
            onClick={scrollToSelectedItem}
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

          {showExpandButton && (
            <button
              type="button"
              className={styles.expandButton}
              onClick={() => setIsExpanded(true)}
              title={expandButtonTitle}
              aria-label={expandButtonAriaLabel}
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
                width="20"
                height="20"
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
      </div>

      <SearchSideBarListExpandedModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        items={items}
        selectedItemId={selectedItemId}
        onSelectItem={onSelectItem}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchHistory={searchHistory}
        onSelectSearchHistory={onSelectSearchHistory}
        onClearSearch={onClearSearch}
        onCommitSearch={onCommitSearch}
        searchPlaceholder={searchPlaceholder}
        noResultsMessage={noResultsMessage}
        getItemId={getItemId}
        getItemTitle={getItemTitle}
        getItemRows={getExpandedRows || getItemRows}
        getItemSubRows={getExpandedSubRows}
        getItemIconUrl={getItemIconUrl}
        getItemIconAlt={getItemIconAlt}
        onVisibleItemIdsChange={onVisibleItemIdsChange}
      />

      <div ref={listRef} className={`${styles.list} ${listClassName}`}>
        {items.length > 0 ? (
          items.map((item, index) => {
            const itemId = getItemId(item) ?? index;
            const itemKey = toItemKey(itemId);
            const selectedKey = toItemKey(selectedItemId);
            return (
              <SearchSideBarListItem
                key={itemKey}
                itemRef={(element) => setItemRef(itemKey, element)}
                itemId={itemKey}
                item={item}
                isSelected={selectedKey === itemKey}
                onClick={onSelectItem}
                iconUrl={getItemIconUrl(item)}
                iconAlt={getItemIconAlt(item)}
                title={getItemTitle(item)}
                rows={getItemRows(item)}
                renderIcon={renderItemIcon}
                renderInfo={renderItemInfo}
              />
            );
          })
        ) : (
          <SearchSideBarListNoResults message={noResultsMessage} />
        )}
      </div>
    </div>
  );
};

export default SearchSideBarList;
