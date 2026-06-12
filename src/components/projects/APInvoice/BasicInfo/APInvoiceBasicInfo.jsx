import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';

const APInvoiceBasicInfo = ({
  draft,
  supplierSuggestionOptions = [],
  selectedSupplierOption = null,
  purchaseRequestSuggestionOptions = [],
  selectedPurchaseRequestOption = null,
  supplierAddressSuggestionOptions = [],
  selectedSupplierAddressOption = null,
  onIdChange,
  onSupplierChange,
  onPurchaseRequestChange,
  onSupplierAddressChange,
  onInvoiceRefChange,
  onInvoiceDateChange,
  onDueDateChange,
  onRemarkChange,
}) => {
  return (
    <Main_InputContainer label="AP Invoice Basic Info">
      <SplitLayout>
        <VerticalLayout>
          <Main_InputContainer label="AP Invoice ID">
            <Main_TextField
              defaultValue={String(draft?.id || '')}
              onChange={(ov, nv) => onIdChange?.(nv)}
              placeholder="Auto-generated"
            />
          </Main_InputContainer>

          <Main_InputContainer label="Supplier">
            <Main_Suggest
              defaultSuggestions={supplierSuggestionOptions}
              defaultValue={selectedSupplierOption?.name || ''}
              placeholder="Search supplier"
              getSuggestionLabel={(item) => String(item?.name || '').trim()}
              getSuggestionSearchText={(item) =>
                String(item?.searchText || item?.name || '').trim()
              }
              onSelectSuggestion={(item) => onSupplierChange?.(item)}
              onChange={(ov, nv) => {
                if (!String(nv || '').trim()) {
                  onSupplierChange?.(null);
                }
              }}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Purchase Request">
            <Main_Suggest
              defaultSuggestions={purchaseRequestSuggestionOptions}
              defaultValue={selectedPurchaseRequestOption?.name || ''}
              placeholder="Search purchase request"
              getSuggestionLabel={(item) => String(item?.name || '').trim()}
              getSuggestionSearchText={(item) =>
                String(item?.searchText || item?.name || '').trim()
              }
              onSelectSuggestion={(item) => onPurchaseRequestChange?.(item)}
              onChange={(ov, nv) => {
                if (!String(nv || '').trim()) {
                  onPurchaseRequestChange?.(null);
                }
              }}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Supplier Address">
            <Main_Suggest
              defaultSuggestions={supplierAddressSuggestionOptions}
              defaultValue={selectedSupplierAddressOption?.name || ''}
              placeholder="Search supplier address"
              getSuggestionLabel={(item) => String(item?.name || '').trim()}
              getSuggestionSearchText={(item) =>
                String(item?.searchText || item?.name || '').trim()
              }
              onSelectSuggestion={(item) => onSupplierAddressChange?.(item)}
              onChange={(ov, nv) => {
                if (!String(nv || '').trim()) {
                  onSupplierAddressChange?.(null);
                }
              }}
            />
          </Main_InputContainer>
        </VerticalLayout>

        <VerticalLayout>
          <Main_InputContainer label="Invoice Ref">
            <Main_TextField
              defaultValue={String(draft?.invoice_ref || '')}
              placeholder="Supplier invoice reference"
              onChange={(ov, nv) => onInvoiceRefChange?.(nv)}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Invoice Date">
            <Main_DateSelector
              defaultValue={String(draft?.invoice_date || '')}
              onChange={(ov, nv) => onInvoiceDateChange?.(nv)}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Due Date">
            <Main_DateSelector
              defaultValue={String(draft?.due_date || '')}
              onChange={(ov, nv) => onDueDateChange?.(nv)}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Remark">
            <Main_TextArea
              defaultValue={String(draft?.remark || '')}
              placeholder="Internal AP remark"
              rows={5}
              onChange={(ov, nv) => onRemarkChange?.(nv)}
            />
          </Main_InputContainer>
        </VerticalLayout>
      </SplitLayout>
    </Main_InputContainer>
  );
};

export default APInvoiceBasicInfo;
