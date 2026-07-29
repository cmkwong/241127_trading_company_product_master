import { useMemo, useState } from 'react';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import styles from '../Main_MasterControl.module.css';

const MasterControlSidebar = ({ tableNames = [], selectedTable, onSelect }) => {
  const [searchValue, setSearchValue] = useState('');

  const filteredTableNames = useMemo(() => {
    const keyword = String(searchValue || '')
      .trim()
      .toLowerCase();

    if (!keyword) {
      return tableNames;
    }

    return (tableNames || []).filter((tableName) =>
      String(tableName || '')
        .toLowerCase()
        .includes(keyword),
    );
  }, [searchValue, tableNames]);

  return (
    <div className={styles.sidebar}>
      <SearchSideBarList
        items={filteredTableNames}
        selectedItemId={selectedTable}
        onSelectItem={(tableName) => onSelect?.(tableName)}
        searchValue={searchValue}
        onSearchChange={(value) => setSearchValue(value)}
        onClearSearch={() => setSearchValue('')}
        searchPlaceholder="Search tables..."
        noResultsMessage="No master tables found"
        showCreateButton={false}
        getItemId={(tableName) => tableName}
        getItemTitle={(tableName) => tableName}
        getItemRows={(tableName) => [{ label: 'Table', value: tableName }]}
      />
    </div>
  );
};

export default MasterControlSidebar;
