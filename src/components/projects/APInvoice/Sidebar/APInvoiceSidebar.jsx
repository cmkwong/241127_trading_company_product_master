import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import styles from './APInvoiceSidebar.module.css';

const APInvoiceSidebar = ({
  rows = [],
  selectedId,
  searchValue,
  onSearchChange,
  onSelectRow,
  onCreate,
  supplierNameById = new Map(),
}) => {
  const getItemTitle = (row) => {
    const supplierName =
      supplierNameById.get(String(row?.supplier_id || '').trim()) ||
      'Unknown supplier';

    return supplierName;
  };

  const getItemRows = (row) => [
    {
      label: 'Invoice Ref:',
      value: String(row?.invoice_ref || '').trim() || '-',
    },
    {
      label: 'Purchase Request:',
      value: String(row?.purchase_request_id || '').trim() || '-',
    },
    {
      label: 'Row Details:',
      value: String(row?.ap_invoice_row_details?.length || 0),
    },
    {
      label: 'Updated At:',
      value: String(row?.updated_at || row?.created_at || '').replace('T', ' '),
    },
  ];

  const filteredRows = rows.filter((row) => {
    const supplierName =
      supplierNameById.get(String(row?.supplier_id || '').trim()) ||
      String(row?.supplier_id || '').trim();

    const summary = [
      row?.id,
      row?.invoice_ref,
      row?.remark,
      row?.purchase_request_id,
      row?.supplier_id,
      supplierName,
    ]
      .map((value) =>
        String(value || '')
          .toLowerCase()
          .trim(),
      )
      .filter(Boolean)
      .join(' ');

    const query = String(searchValue || '')
      .toLowerCase()
      .trim();
    if (!query) return true;
    return summary.includes(query);
  });

  return (
    <div className={styles.sidebar}>
      <SearchSideBarList
        items={filteredRows}
        selectedItemId={selectedId}
        onSelectItem={(row) => onSelectRow?.(String(row?.id || '').trim())}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search AP invoices..."
        onCreate={onCreate}
        createButtonTitle="Create New AP Invoice"
        createButtonAriaLabel="Create New AP Invoice"
        noResultsMessage="No AP invoices found"
        getItemId={(row) => row?.id}
        getItemTitle={getItemTitle}
        getItemRows={getItemRows}
        exportFileName="ap_invoices_filtered_list"
        exportSheetName="AP Invoices"
      />
    </div>
  );
};

export default APInvoiceSidebar;
