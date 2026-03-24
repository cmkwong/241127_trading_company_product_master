import SearchSideBarListIcon from './SearchSideBarListIcon';
import SearchSideBarListInfo from './SearchSideBarListInfo';
import styles from './SearchSideBarList.module.css';

const SearchSideBarListItem = ({
  item,
  isSelected,
  onClick,
  itemRef,
  iconUrl,
  iconAlt,
  title,
  rows,
  renderIcon,
  renderInfo,
}) => {
  const hasIconUrl =
    typeof iconUrl === 'string' ? iconUrl.trim().length > 0 : !!iconUrl;

  return (
    <div
      ref={itemRef}
      tabIndex={-1}
      className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick?.(item)}
    >
      {renderIcon ? (
        renderIcon(item)
      ) : hasIconUrl ? (
        <SearchSideBarListIcon url={iconUrl} alt={iconAlt} />
      ) : null}

      {renderInfo ? (
        renderInfo(item)
      ) : (
        <SearchSideBarListInfo title={title} rows={rows} />
      )}
    </div>
  );
};

export default SearchSideBarListItem;
