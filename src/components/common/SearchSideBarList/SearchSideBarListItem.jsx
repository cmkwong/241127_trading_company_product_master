import SearchSideBarListIcon from './SearchSideBarListIcon';
import SearchSideBarListInfo from './SearchSideBarListInfo';
import styles from './SearchSideBarList.module.css';

const SearchSideBarListItem = ({
  item,
  isSelected,
  onClick,
  iconUrl,
  iconAlt,
  title,
  rows,
  renderIcon,
  renderInfo,
}) => {
  return (
    <div
      className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick?.(item)}
    >
      {renderIcon ? (
        renderIcon(item)
      ) : (
        <SearchSideBarListIcon url={iconUrl} alt={iconAlt} />
      )}

      {renderInfo ? (
        renderInfo(item)
      ) : (
        <SearchSideBarListInfo title={title} rows={rows} />
      )}
    </div>
  );
};

export default SearchSideBarListItem;
