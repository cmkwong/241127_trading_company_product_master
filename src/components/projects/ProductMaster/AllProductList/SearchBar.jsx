import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import styles from './SearchBar.module.css';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchFieldWrapper}>
        <Main_TextField
          placeholder="Search products..."
          onChange={onChange}
          defaultValue={value}
        />
      </div>
    </div>
  );
};

export default SearchBar;
