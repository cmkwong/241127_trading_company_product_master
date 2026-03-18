import SearchSideBarListItem from './SearchSideBarListItem';
import SearchSideBarListNoResults from './SearchSideBarListNoResults';
import SearchSideBarListSearchBar from './SearchSideBarListSearchBar';
import styles from './SearchSideBarList.module.css';

const SearchSideBarList = ({
  items = [],
  selectedItemId,
  onSelectItem,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  onCreate,
  showCreateButton = true,
  createButtonTitle = 'Create New',
  createButtonAriaLabel = 'Create New',
  noResultsMessage = 'No results found',
  getItemId = (item) => item?.id,
  getItemTitle = (item) => item?.name || '',
  getItemRows = () => [],
  getItemIconUrl = (item) => item?.icon_url,
  getItemIconAlt = (item) => item?.name || 'item',
  renderItemIcon,
  renderItemInfo,
  className = '',
  listClassName = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.toolbar}>
        <SearchSideBarListSearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />

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

      <div className={`${styles.list} ${listClassName}`}>
        {items.length > 0 ? (
          items.map((item, index) => {
            const itemId = getItemId(item) || index;
            return (
              <SearchSideBarListItem
                key={itemId}
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
