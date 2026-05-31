import { useMemo } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';
import styles from './Main_SalesBasicInfo.module.css';

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

const buildAddressPreview = (address) => {
  const detail = String(address?.address_detail || '').trim();
  if (detail) {
    return detail;
  }

  const parts = [
    address?.address,
    address?.line1,
    address?.line2,
    address?.city,
    address?.state || address?.province,
    address?.country,
    address?.postal_code || address?.zip_code,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return String(address?.name || address?.label || address?.id || '').trim();
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
      name: buildAddressPreview(address),
      customer_id: String(address?.customer_id || '').trim(),
      address_detail: buildAddressPreview(address),
    }));

    if (!selectedCustomerId) {
      return normalized;
    }

    return normalized.filter(
      (address) => address.customer_id === selectedCustomerId,
    );
  }, [customerAddressOptions, selectedCustomerId]);

  const customerSuggestionOptions = useMemo(
    () =>
      (customerOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: (() => {
          const id = String(item?.id || '').trim();
          const fallbackLabel = String(item?.name || item?.label || '').trim();
          const customerCode = String(
            item?.customer_code || item?.code || '',
          ).trim();
          const customerDisplayName = String(
            item?.customer_display_name ||
              item?.display_name ||
              item?.customer_name ||
              fallbackLabel ||
              customerCode ||
              id,
          ).trim();

          if (
            customerDisplayName &&
            customerCode &&
            customerDisplayName.toLowerCase() !== customerCode.toLowerCase()
          ) {
            return `${customerDisplayName} (${customerCode})`;
          }

          return customerDisplayName || customerCode || id;
        })(),
        customer_display_name: String(
          item?.customer_display_name ||
            item?.display_name ||
            item?.customer_name ||
            item?.name ||
            item?.label ||
            '',
        ).trim(),
        customer_type_name: String(item?.customer_type_name || '').trim(),
        searchText: [
          String(item?.customer_display_name || '').trim(),
          String(item?.display_name || '').trim(),
          String(item?.customer_name || '').trim(),
          String(item?.name || item?.label || '').trim(),
          String(item?.customer_type_name || '').trim(),
          String(item?.customer_code || item?.code || '').trim(),
          String(item?.id || '').trim(),
        ]
          .filter(Boolean)
          .join(' '),
      })),
    [customerOptions],
  );

  const addressSuggestionOptions = useMemo(
    () =>
      (filteredAddressOptions || []).map((item) => ({
        id: item.id,
        name: item.name || item.id,
        customer_id: String(item?.customer_id || '').trim(),
        address_detail: String(item?.address_detail || item?.name || '').trim(),
        searchText: [
          String(item?.name || '').trim(),
          String(item?.address_detail || '').trim(),
          String(item?.customer_id || '').trim(),
          String(item?.id || '').trim(),
        ]
          .filter(Boolean)
          .join(' '),
      })),
    [filteredAddressOptions],
  );

  const selectedCustomerOption = useMemo(
    () =>
      customerSuggestionOptions.find(
        (item) => item.id === selectedCustomerId,
      ) || null,
    [customerSuggestionOptions, selectedCustomerId],
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
            <Main_Suggest
              defaultSuggestions={customerSuggestionOptions}
              defaultValue={selectedCustomerOption?.name || ''}
              placeholder="Type customer name or customer ID"
              getSuggestionLabel={(suggestion) =>
                String(suggestion?.name || suggestion?.id || '').trim()
              }
              getSuggestionSearchText={(suggestion) =>
                String(
                  suggestion?.searchText ||
                    suggestion?.name ||
                    suggestion?.customer_display_name ||
                    suggestion?.id ||
                    '',
                ).trim()
              }
              onSelectSuggestion={(suggestion) => {
                const normalizedNextCustomerId = String(
                  suggestion?.id || '',
                ).trim();

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
                  customer_id: normalizedNextCustomerId,
                  customer_address_id: hasMatchingAddress
                    ? currentAddressId
                    : '',
                });
              }}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Customer Type">
            <Main_TextField
              defaultValue={selectedCustomerOption?.customer_type_name || ''}
              disabled
              placeholder="Customer type"
            />
          </Main_InputContainer>

          <Main_InputContainer label="Customer Address">
            <Main_Suggest
              defaultSuggestions={addressSuggestionOptions}
              defaultValue={
                addressSuggestionOptions.find(
                  (item) =>
                    item.id === String(quotation?.customer_address_id || ''),
                )?.name || ''
              }
              placeholder="Search customer address"
              autoComplete="new-password"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                String(
                  suggestion?.searchText ||
                    [
                      suggestion?.name,
                      suggestion?.address_detail,
                      suggestion?.customer_id,
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
                    <span>Customer ID: {suggestion?.customer_id || '-'}</span>
                    <span>
                      Address Detail: {suggestion?.address_detail || '-'}
                    </span>
                  </div>
                </div>
              )}
              onChange={(ov, nv) => {
                if (!String(nv || '').trim()) {
                  onPatchQuotation({ customer_address_id: '' });
                }
              }}
              onSelectSuggestion={(suggestion) => {
                onPatchQuotation({
                  customer_address_id: String(suggestion?.id || '').trim(),
                });
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
