import Main_TextField from '../InputOptions/TextField/Main_TextField';
import styles from './SearchSideBarList.module.css';

const SearchSideBarListSearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
}) => {
  const handleInputChange = (ov, nv) => {
    onChange?.(nv, ov);
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchFieldWrapper}>
        <Main_TextField
          placeholder={placeholder}
          onChange={handleInputChange}
          defaultValue={value}
        />
      </div>
    </div>
  );
};

export default SearchSideBarListSearchBar;
