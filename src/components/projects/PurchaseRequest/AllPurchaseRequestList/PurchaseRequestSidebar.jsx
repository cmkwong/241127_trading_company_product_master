import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { toSafeString } from '../../SalesQuotation/utils/quotationTotals';
import styles from '../Main_PurchaseRequest.module.css';

const PurchaseRequestSidebar = ({
  rows = [],
  selectedId = '',
  searchValue = '',
  onSearchChange,
  onSelectRow,
  onCreate,
  onRefresh,
  isLoading = false,
  getItemTitle,
  getItemRows,
}) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>Purchase Requests</div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className={styles.sidebarListWrap}>
        <SearchSideBarList
          items={rows}
          selectedItemId={toSafeString(selectedId) || undefined}
          onSelectItem={onSelectRow}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onClearSearch={() => onSearchChange?.('')}
          searchPlaceholder="Search purchase requests..."
          onCreate={onCreate}
          createButtonTitle="Create New Purchase Request"
          createButtonAriaLabel="Create New Purchase Request"
          noResultsMessage="No purchase requests found"
          getItemId={(item) => toSafeString(item?.id)}
          getItemTitle={getItemTitle}
          getItemRows={getItemRows}
          exportFileName="purchase_requests_filtered_list"
          exportSheetName="Purchase Requests"
          className={styles.sidebarSearchList}
          listClassName={styles.sidebarSearchListScroll}
        />
      </div>
    </aside>
  );
};

export default PurchaseRequestSidebar;
