import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { useCatalogContext } from '../../../../store/CatalogContext';
import styles from './CatalogSidebar.module.css';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : '';
};

const CatalogSidebar = ({ isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { catalogs, selectedCatalogId, getCatalogData } = useCatalogContext();
  const [searchTerm, setSearchTerm] = useState('');

  const list = useMemo(() => catalogs?.catalogs || [], [catalogs]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter((item) => {
      const name = String(item?.catalog_name || '').toLowerCase();
      const header = String(item?.display_header || '').toLowerCase();
      return name.includes(term) || header.includes(term);
    });
  }, [list, searchTerm]);

  const handleSelect = useCallback(
    (catalog) => {
      const id = String(catalog?.id || '').trim();
      if (!id) return;
      const loaded = getCatalogData(id);
      if (loaded) {
        navigate(`/panel/catalog/${id}`, { replace: false });
      }
    },
    [getCatalogData, navigate],
  );

  const getCatalogName = useCallback(
    (catalog) => catalog?.catalog_name || 'Untitled Catalog',
    [],
  );

  const getCatalogRows = useCallback(
    (catalog) => [
      { label: 'Header:', value: catalog?.display_header || '' },
      { label: 'ID:', value: catalog?.id || '' },
      { label: 'Created:', value: formatDate(catalog?.created_at) },
      { label: 'Updated:', value: formatDate(catalog?.updated_at) },
    ],
    [],
  );

  return (
    <>
      <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <SearchSideBarList
          items={filtered}
          selectedItemId={selectedCatalogId}
          onSelectItem={handleSelect}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search catalogs..."
          showCreateButton={false}
          showExpandButton={false}
          noResultsMessage="No catalogs found"
          getItemId={(catalog) => catalog.id}
          getItemTitle={getCatalogName}
          getItemRows={getCatalogRows}
          exportFileName="catalogs_list"
          exportSheetName="Catalogs"
          sidebarTitle="Catalog List"
        />
      </div>

      <div
        className={`${styles.sidebarToggle} ${isCollapsed ? styles.collapsed : ''}`}
        onClick={() => onToggleCollapse(!isCollapsed)}
      >
        {isCollapsed ? '›' : '‹'}
      </div>
    </>
  );
};

export default CatalogSidebar;
