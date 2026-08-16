import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';
import { formatMoney } from '../../SalesQuotation/utils/quotationTotals';
import styles from '../Main_PurchaseRequest.module.css';

export const STATUS_OPTIONS = [
  { id: 'draft', name: 'Draft', color: '#6b7280' },
  { id: 'ordered', name: 'Ordered', color: '#16a34a' },
  { id: 'pending', name: 'Pending', color: '#f59e0b' },
  { id: 'cancelled', name: 'Cancelled', color: '#383131' },
  { id: 'ap_invoiced', name: 'AP Invoiced', color: '#2563eb' },
];

const toSafeString = (value) => String(value || '').trim();

const PurchaseRequestBasicInfo = ({
  draft,
  supplierSuggestionOptions,
  selectedSupplierOption,
  supplierAddressSuggestionOptions,
  selectedSupplierAddressOption,
  salesQuotationSuggestionOptions,
  selectedSalesQuotationOption,
  onIdChange,
  onSupplierInputChange,
  onSupplierSelect,
  onSupplierAddressInputChange,
  onSupplierAddressSelect,
  onSalesQuotationInputChange,
  onSalesQuotationSelect,
  onFetchSupplierSuggestions,
  onFetchSalesQuotationSuggestions,
  onStatusChange,
  onRemarkChange,
}) => {
  return (
    <Main_InputContainer label="Purchase Request Basic Info">
      <SplitLayout>
        <VerticalLayout>
          <Main_InputContainer label="Purchase Request ID">
            <Main_TextField
              defaultValue={toSafeString(draft?.id)}
              placeholder="Purchase request ID"
              onChange={(ov, nv) => onIdChange?.(nv)}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Supplier">
            <Main_Suggest
              defaultSuggestions={supplierSuggestionOptions}
              defaultValue={selectedSupplierOption?.name || ''}
              placeholder="Search supplier"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                toSafeString(
                  suggestion?.searchText ||
                    [
                      suggestion?.name,
                      suggestion?.supplier_type_name,
                      suggestion?.supplier_code,
                      suggestion?.id,
                    ]
                      .filter(Boolean)
                      .join(' '),
                )
              }
              renderSuggestion={(suggestion) => (
                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionTitle}>
                    {suggestion?.name || ''}
                  </div>
                  <div className={styles.suggestionMeta}>
                    <span>
                      Supplier Type:{' '}
                      {suggestion?.supplier_type_name || 'Unknown'}
                    </span>
                    <span>
                      Supplier Code: {suggestion?.supplier_code || '-'}
                    </span>
                  </div>
                </div>
              )}
              onChange={(ov, nv) => onSupplierInputChange?.(nv)}
              onSelectSuggestion={onSupplierSelect}
              onFetchSuggestions={onFetchSupplierSuggestions}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Supplier Address">
            <Main_Suggest
              defaultSuggestions={supplierAddressSuggestionOptions}
              defaultValue={selectedSupplierAddressOption?.name || ''}
              placeholder="Search supplier address"
              autoComplete="new-password"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                toSafeString(
                  suggestion?.searchText ||
                    [
                      suggestion?.name,
                      suggestion?.address_detail,
                      suggestion?.supplier_id,
                      suggestion?.id,
                    ]
                      .filter(Boolean)
                      .join(' '),
                )
              }
              renderSuggestion={(suggestion) => (
                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionTitle}>
                    {suggestion?.name || suggestion?.id || ''}
                  </div>
                  <div className={styles.suggestionMeta}>
                    <span>Address ID: {suggestion?.id || '-'}</span>
                  </div>
                </div>
              )}
              onChange={(ov, nv) => onSupplierAddressInputChange?.(nv)}
              onSelectSuggestion={onSupplierAddressSelect}
            />
          </Main_InputContainer>
        </VerticalLayout>

        <VerticalLayout>
          <Main_InputContainer label="Sales Quotation">
            <Main_Suggest
              defaultSuggestions={salesQuotationSuggestionOptions}
              defaultValue={selectedSalesQuotationOption?.name || ''}
              placeholder="Search sales quotation"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                toSafeString(
                  suggestion?.searchText ||
                    [
                      suggestion?.id,
                      suggestion?.customer_name,
                      formatMoney(suggestion?.total_usd),
                    ]
                      .filter(Boolean)
                      .join(' '),
                )
              }
              renderSuggestion={(suggestion) => (
                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionTitle}>
                    {suggestion?.id || ''}
                  </div>
                  <div className={styles.suggestionMeta}>
                    <span>Customer: {suggestion?.customer_name || '-'}</span>
                    <span>
                      Total (USD): USD{' '}
                      {formatMoney(Number(suggestion?.total_usd || 0))}
                    </span>
                  </div>
                </div>
              )}
              onChange={(ov, nv) => onSalesQuotationInputChange?.(nv)}
              onSelectSuggestion={onSalesQuotationSelect}
              onFetchSuggestions={onFetchSalesQuotationSuggestions}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Order Status">
            <Main_Dropdown
              defaultOptions={STATUS_OPTIONS}
              defaultSelectedOption={draft?.status || 'draft'}
              onChange={(ov, nv) => onStatusChange?.(nv)}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Remark">
            <Main_TextArea
              defaultValue={toSafeString(draft?.remark)}
              rows={4}
              placeholder="Purchase request remark"
              onChange={(ov, nv) => onRemarkChange?.(nv)}
            />
          </Main_InputContainer>
        </VerticalLayout>
      </SplitLayout>
    </Main_InputContainer>
  );
};

export default PurchaseRequestBasicInfo;
