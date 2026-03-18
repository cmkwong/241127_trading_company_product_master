import styles from './SearchSideBarList.module.css';

const SearchSideBarListNoResults = ({ message = 'No results found' }) => {
  return <div className={styles.noResults}>{message}</div>;
};

export default SearchSideBarListNoResults;
