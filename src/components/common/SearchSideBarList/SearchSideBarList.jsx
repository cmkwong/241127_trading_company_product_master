import { useCallback, useRef, useState } from 'react';
import SearchSideBarListItem from './SearchSideBarListItem';
import SearchSideBarListNoResults from './SearchSideBarListNoResults';
import SearchSideBarListSearchBar from './SearchSideBarListSearchBar';
import SearchSideBarListExpandedModal from './SearchSideBarListExpandedModal';
import styles from './SearchSideBarList.module.css';

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

  const setItemRef = useCallback((itemId, element) => {
    if (element) {
      itemRefs.current.set(itemId, element);
      return;
    }

    itemRefs.current.delete(itemId);
  }, []);

  const scrollToSelectedItem = useCallback(() => {
    if (selectedItemId === undefined || selectedItemId === null) {
      return;
    }

    const targetNode = itemRefs.current.get(selectedItemId);
    if (!targetNode) {
      return;
    }

    targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetNode.focus({ preventScroll: true });
  }, [selectedItemId]);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          <SearchSideBarListSearchBar
            value={searchValue}
            onChange={onSearchChange}
            searchHistory={searchHistory}
            onSelectHistory={onSelectSearchHistory}
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
        searchPlaceholder={searchPlaceholder}
        noResultsMessage={noResultsMessage}
        getItemId={getItemId}
        getItemTitle={getItemTitle}
        getItemRows={getExpandedRows || getItemRows}
        getItemSubRows={getExpandedSubRows}
        getItemIconUrl={getItemIconUrl}
        getItemIconAlt={getItemIconAlt}
      />

      <div className={`${styles.list} ${listClassName}`}>
        {items.length > 0 ? (
          items.map((item, index) => {
            const itemId = getItemId(item) || index;
            return (
              <SearchSideBarListItem
                key={itemId}
                itemRef={(element) => setItemRef(itemId, element)}
                item={item}
                isSelected={selectedItemId === getItemId(item)}
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
