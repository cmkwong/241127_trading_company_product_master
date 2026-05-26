import { useMemo } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';

const ORDER_STATUS_OPTIONS = [
  { id: 'false', name: 'Quotation' },
  { id: 'true', name: 'Ordered' },
];

const toDateInputValue = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const Main_SalesBasicInfo = ({
  quotation,
  customerOptions = [],
  customerAddressOptions = [],
  onPatchQuotation,
}) => {
  const selectedCustomerId = String(quotation?.customer_id || '').trim();

  const filteredAddressOptions = useMemo(() => {
    const normalized = (customerAddressOptions || []).map((address) => ({
      id: String(address?.id || '').trim(),
      name: String(address?.name || address?.label || '').trim(),
      customer_id: String(address?.customer_id || '').trim(),
    }));

    if (!selectedCustomerId) {
      return normalized;
    }

    return normalized.filter(
      (address) => address.customer_id === selectedCustomerId,
    );
  }, [customerAddressOptions, selectedCustomerId]);

  const customerDropdownOptions = useMemo(
    () =>
      (customerOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
      })),
    [customerOptions],
  );

  const addressDropdownOptions = useMemo(
    () =>
      (filteredAddressOptions || []).map((item) => ({
        id: item.id,
        name: item.name || item.id,
      })),
    [filteredAddressOptions],
  );

  return (
    <Main_InputContainer label="Sales Quotation Basic Info">
      <SplitLayout>
        <VerticalLayout>
          <Main_InputContainer label="Quotation ID">
            <Main_TextField
              defaultValue={String(quotation?.id || '')}
              disabled
              placeholder="Auto-generated"
            />
          </Main_InputContainer>

          <Main_InputContainer label="Order Status">
            <Main_Dropdown
              defaultOptions={ORDER_STATUS_OPTIONS}
              defaultSelectedOption={quotation?.to_order ? 'true' : 'false'}
              onChange={(ov, nv) => {
                onPatchQuotation({ to_order: nv === 'true' });
              }}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Customer">
            <Main_Dropdown
              defaultOptions={customerDropdownOptions}
              defaultSelectedOption={String(quotation?.customer_id || '')}
              onChange={(ov, nv) => {
                const normalizedNextCustomerId = String(nv || '').trim();
                const nextCustomerAddressOptions =
                  normalizedNextCustomerId.length === 0
                    ? customerAddressOptions || []
                    : (customerAddressOptions || []).filter(
                        (item) =>
                          String(item?.customer_id || '').trim() ===
                          normalizedNextCustomerId,
                      );

                const currentAddressId = String(
                  quotation?.customer_address_id || '',
                ).trim();

                const hasMatchingAddress = nextCustomerAddressOptions.some(
                  (item) => String(item?.id || '').trim() === currentAddressId,
                );

                onPatchQuotation({
                  customer_id: nv,
                  customer_address_id: hasMatchingAddress
                    ? currentAddressId
                    : '',
                });
              }}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Customer Address">
            <Main_Dropdown
              defaultOptions={addressDropdownOptions}
              defaultSelectedOption={String(
                quotation?.customer_address_id || '',
              )}
              onChange={(ov, nv) => {
                onPatchQuotation({ customer_address_id: nv });
              }}
            />
          </Main_InputContainer>
        </VerticalLayout>

        <VerticalLayout>
          <Main_InputContainer label="Created At">
            <Main_DateSelector
              defaultValue={toDateInputValue(quotation?.created_at)}
              disabled
            />
          </Main_InputContainer>

          <Main_InputContainer label="Updated At">
            <Main_DateSelector
              defaultValue={toDateInputValue(quotation?.updated_at)}
              disabled
            />
          </Main_InputContainer>

          <Main_InputContainer label="Remark">
            <Main_TextArea
              defaultValue={quotation?.remark || ''}
              placeholder="Sales quotation remark"
              rows={6}
              onChange={(ov, nv) => {
                onPatchQuotation({ remark: nv });
              }}
            />
          </Main_InputContainer>
        </VerticalLayout>
      </SplitLayout>
    </Main_InputContainer>
  );
};

export default Main_SalesBasicInfo;
