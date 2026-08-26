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
  onVisibleHistoryItemIdsChange,
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
  exportFileName = 'search_results',
  exportSheetName = 'Search Results',
  onResolveExportImage,
  onResolveExportImagesBatch,
  renderItemIcon,
  renderItemInfo,
  className = '',
  listClassName = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemRefs = useRef(new Map());
  const listRef = useRef(null);
  const pendingHistoryScrollRef = useRef(false);

  const emitVisibleItemIdsFromScroll = useCallback(() => {
    if (typeof onVisibleItemIdsChange !== 'function') {
      return;
    }

    const root = listRef.current;
    if (!root) {
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const visibleIds = [];

    itemRefs.current.forEach((element, itemId) => {
      if (!element || !itemId) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const isVisible =
        rect.bottom >= rootRect.top - 120 && rect.top <= rootRect.bottom + 120;

      if (isVisible) {
        visibleIds.push(itemId);
      }
    });

    if (visibleIds.length > 0) {
      onVisibleItemIdsChange(visibleIds);
    }
  }, [onVisibleItemIdsChange]);

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
    if (!pendingHistoryScrollRef.current) {
      return;
    }

    if (selectedItemId === undefined || selectedItemId === null) {
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      scrollToSelectedItem();

      window.setTimeout(() => {
        scrollToSelectedItem();
        pendingHistoryScrollRef.current = false;
      }, 80);
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [selectedItemId, items, scrollToSelectedItem]);

  const handleSelectHistory = useCallback(
    (entry) => {
      pendingHistoryScrollRef.current = true;
      onSelectSearchHistory?.(entry);
    },
    [onSelectSearchHistory],
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

  useEffect(() => {
    const root = listRef.current;
    if (!root || typeof onVisibleItemIdsChange !== 'function') {
      return;
    }

    let rafId = null;

    const handleScroll = () => {
      if (rafId !== null) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        emitVisibleItemIdsFromScroll();
        rafId = null;
      });
    };

    // Initial sync to hydrate icons for initially visible items.
    emitVisibleItemIdsFromScroll();

    root.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      root.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [items, onVisibleItemIdsChange, emitVisibleItemIdsFromScroll]);

  const countText = `${items.length} items${items.length === 1 ? '' : 's'}`;

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
            onVisibleHistoryItemIdsChange={onVisibleHistoryItemIdsChange}
            placeholder={searchPlaceholder}
            selectedItemId={selectedItemId}
            onScrollToSelectedItem={scrollToSelectedItem}
            onExpand={() => setIsExpanded(true)}
            showExpandButton={showExpandButton}
            showCreateButton={showCreateButton}
            onCreate={onCreate}
            createButtonTitle={createButtonTitle}
            createButtonAriaLabel={createButtonAriaLabel}
            expandButtonTitle={expandButtonTitle}
            expandButtonAriaLabel={expandButtonAriaLabel}
          />
        </div>
      </div>

      <div className={styles.listCountBar}>{countText}</div>

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
        exportFileName={exportFileName}
        exportSheetName={exportSheetName}
        onResolveExportImage={onResolveExportImage}
        onResolveExportImagesBatch={onResolveExportImagesBatch}
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
