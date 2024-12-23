import styles from './SearchBox.module.css';
import search_icon from '../assets/search_icon.svg';
import Button from './common/Button';

const SearchBox = () => {
  return (
    <>
      <div className={styles['searchbox']}>
        <input type="text" />
        <img src={search_icon} alt="Search Icon" />
        <div className={styles['saveButton']}>
          <Button text={'Save'} />
        </div>
      </div>
    </>
  );
};

export default SearchBox;
