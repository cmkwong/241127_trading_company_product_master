import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import styles from './Main_AllProductList.module.css';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className={styles.searchContainer}>
      <Main_TextField
        placeholder="Search products..."
        onChange={onChange}
        defaultValue={value}
      />
    </div>
  );
};

export default SearchBar;
