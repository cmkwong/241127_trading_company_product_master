import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { toSafeString } from '../../SalesQuotation/utils/quotationTotals';
import styles from '../Main_PurchaseRequest.module.css';

const PurchaseRequestSidebar = ({
  rows = [],
  selectedId = '',
  searchValue = '',
  onSearchChange,
  onSelectRow,
  getItemTitle,
  getItemRows,
}) => {
  return (
    <aside className={styles.sidebar}>
      <SearchSideBarList
        items={rows}
        selectedItemId={toSafeString(selectedId) || undefined}
        onSelectItem={onSelectRow}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onClearSearch={() => onSearchChange?.('')}
        searchPlaceholder="Search purchase requests..."
        showCreateButton={false}
        noResultsMessage="No purchase requests found"
        getItemId={(item) => toSafeString(item?.id)}
        getItemTitle={getItemTitle}
        getItemRows={getItemRows}
        exportFileName="purchase_requests_filtered_list"
        exportSheetName="Purchase Requests"
        sidebarTitle="Request List"
        className={styles.sidebarSearchList}
        listClassName={styles.sidebarSearchListScroll}
      />
    </aside>
  );
};

export default PurchaseRequestSidebar;
