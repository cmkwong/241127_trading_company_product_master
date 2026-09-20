import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';
import {
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { computeQuotationTotals, formatMoney } from '../utils/quotationTotals';
import styles from './Main_SalesBasicInfo.module.css';

export const STATUS_OPTIONS = [
  { id: 'open', name: 'Open', color: '#16a34a' },
  { id: 'close', name: 'Close', color: '#6b7280' },
];

const FILE_SERVER_BASE_URL = 'http://localhost:3001';

const toDateInputValue = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const toLocalDateInputValue = (value) => {
  if (!value) return '';
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const yyyy = String(parsed.getFullYear());
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const buildAddressPreview = (address) => {
  const detail = String(address?.address_detail || '').trim();
  if (detail) {
    return detail;
  }

  const parts = [
    address?.address_line1,
    address?.address_line2,
    address?.address_line3,
    address?.address,
    address?.line1,
    address?.line2,
    address?.line3,
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
  customerOptions = [],
  customerAddressOptions = [],
  onPatchQuotation,
  onRefreshReferenceOptions,
  baseCurrencyCode = 'USD',
  currencyCodeById = {},
  exchangeRateMap = {},
}) => {
  const quotationId = useEntityField('sales_quotations', 'id');
  const status = useEntityField('sales_quotations', 'status');
  const customerId = useEntityField('sales_quotations', 'customer_id');
  const customerAddressId = useEntityField(
    'sales_quotations',
    'customer_address_id',
  );
  const docType = useEntityField('sales_quotations', 'doc_type');
  const { docType: docTypeMaster = [] } = useMasterContext();
  const createdAt = useEntityField('sales_quotations', 'created_at');
  const updatedAt = useEntityField('sales_quotations', 'updated_at');
  const remark = useEntityField('sales_quotations', 'remark');
  const postingAt = useEntityField('sales_quotations', 'posting_at');
  const headerProformaPercent = useEntityField(
    'sales_quotations',
    'header_proforma_percent',
  );
  const assignedPicker = useEntityField('sales_quotations', 'assigned_picker');
  const assignedPickerAddress = useEntityField(
    'sales_quotations',
    'assigned_picker_address',
  );
  const shippingPriceRows = useEntityRows(
    'sales_quotations',
    'sales_shipping_prices',
  );
  const productDetailRows = useEntityRows(
    'sales_quotations',
    'sales_product_details',
  );
  const serviceDetailRows = useEntityRows(
    'sales_quotations',
    'sales_service_details',
  );
  const salesDocRows = useEntityRows('sales_quotations', 'sales_docs');

  const selectedCustomerId = String(customerId || '').trim();

  const docTypeName = useMemo(() => {
    const normalizedId = String(docType || '').trim();
    if (!normalizedId) return '';
    const found = (docTypeMaster || []).find(
      (item) => String(item?.id || '').trim() === normalizedId,
    );
    return found?.name || normalizedId;
  }, [docTypeMaster, docType]);

  const isDownpayment = docTypeName === 'AR Downpayment Invoice';
  const isPackingList = docTypeName === 'Packing List';

  const totalsSummary = useMemo(() => {
    return computeQuotationTotals(
      {
        sales_shipping_prices: shippingPriceRows,
        sales_product_details: productDetailRows,
        sales_service_details: serviceDetailRows,
      },
      {
        baseCurrencyCode,
        currencyCodeById,
        exchangeRateMap,
      },
    );
  }, [
    baseCurrencyCode,
    currencyCodeById,
    exchangeRateMap,
    productDetailRows,
    serviceDetailRows,
    shippingPriceRows,
  ]);

  const downpaymentAmount = useMemo(() => {
    const percent = Number(headerProformaPercent);
    const grandTotal = Number(totalsSummary?.grandTotal);
    if (!Number.isFinite(percent) || !Number.isFinite(grandTotal)) {
      return null;
    }
    return (percent / 100) * grandTotal;
  }, [headerProformaPercent, totalsSummary]);

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
            item?.customer_code || item?.customer_id || item?.code || '',
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
        customer_id: String(
          item?.customer_id || item?.customer_code || item?.code || '',
        ).trim(),
        customer_type_name: String(item?.customer_type_name || '').trim(),
        searchText: [
          String(item?.searchText || '').trim(),
          String(item?.customer_display_name || '').trim(),
          String(item?.display_name || '').trim(),
          String(item?.customer_name || '').trim(),
          String(item?.name || item?.label || '').trim(),
          String(item?.customer_type_name || '').trim(),
          String(item?.customer_id || '').trim(),
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

  const defaultSalesDocFiles = useMemo(() => {
    return (salesDocRows || [])
      .slice()
      .sort(
        (a, b) => Number(a?.display_order || 0) - Number(b?.display_order || 0),
      )
      .map((file, index) => ({
        id: file?.id || `sales-doc-${index + 1}`,
        name: file?.file_name || `sales-doc-${index + 1}`,
        url: file?.file_url || '',
        display_order: Number(file?.display_order || index + 1),
      }));
  }, [salesDocRows]);

  const handleSalesDocsChange = useCallback(
    (newFiles = []) => {
      const salesQuotationId = String(quotationId || '').trim();
      if (!salesQuotationId) {
        return;
      }

      const mappedRows = (newFiles || []).map((file, index) => ({
        id: file?.id || uuidv4(),
        sales_quotation_id: salesQuotationId,
        file_name: file?.name || `sales-doc-${index + 1}`,
        file_url: file?.url || '',
        display_order: index + 1,
      }));

      onPatchQuotation({ sales_docs: mappedRows });
    },
    [onPatchQuotation, quotationId],
  );

  return (
    <Main_InputContainer label="Sales Quotation Basic Info">
      <SplitLayout>
        <VerticalLayout>
          <Main_InputContainer label="Quotation ID">
            <Main_TextField
              defaultValue={String(quotationId || '')}
              disabled
              placeholder="Auto-generated"
            />
          </Main_InputContainer>

          <Main_InputContainer label="Order Status">
            <Main_Dropdown
              defaultOptions={STATUS_OPTIONS}
              defaultSelectedOption={status || 'open'}
              onChange={(ov, nv) => {
                onPatchQuotation({ status: nv });
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

                const currentAddressId = String(customerAddressId || '').trim();

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
              onFetchSuggestions={onRefreshReferenceOptions}
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
                  (item) => item.id === String(customerAddressId || ''),
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
              onFetchSuggestions={onRefreshReferenceOptions}
            />
          </Main_InputContainer>
          <Main_InputContainer label="Sales Docs">
            <Main_FileUploads
              mode="file"
              label=""
              compactButtonText="Upload"
              showDownloadButton={false}
              fileUrlBase={FILE_SERVER_BASE_URL}
              defaultFiles={defaultSalesDocFiles}
              onChange={(ov, nv) => handleSalesDocsChange(nv)}
              onError={(error) => {
                console.error('Sales doc upload error:', error);
              }}
            />
          </Main_InputContainer>
        </VerticalLayout>

        <VerticalLayout>
          <Main_InputContainer label="Document Type">
            <Main_TextField
              defaultValue={docTypeName}
              disabled
              placeholder=""
            />
          </Main_InputContainer>

          <Main_InputContainer label="Posting Date">
            <Main_DateSelector
              defaultValue={postingAt || ''}
              placeholder="Select posting date"
              onChange={(ov, nv) => {
                onPatchQuotation({ posting_at: toLocalDateInputValue(nv) });
              }}
            />
          </Main_InputContainer>

          {isPackingList ? (
            <>
              <Main_InputContainer label="Assigned Picker">
                <Main_TextField
                  defaultValue={assignedPicker || ''}
                  placeholder="e.g. Alex Wong (ID: #4092)"
                  onChange={(ov, nv) => {
                    onPatchQuotation({ assigned_picker: nv });
                  }}
                />
              </Main_InputContainer>

              <Main_InputContainer label="Assigned Picker Address">
                <Main_TextArea
                  defaultValue={assignedPickerAddress || ''}
                  placeholder="Picker address"
                  rows={4}
                  onChange={(ov, nv) => {
                    onPatchQuotation({ assigned_picker_address: nv });
                  }}
                />
              </Main_InputContainer>
            </>
          ) : null}

          {isDownpayment ? (
            <>
              <Main_InputContainer label="% Amount">
                <Main_TextField
                  type="number"
                  step="0.001"
                  min="0"
                  max="100"
                  defaultValue={
                    headerProformaPercent != null
                      ? String(headerProformaPercent)
                      : ''
                  }
                  placeholder="0.000"
                  onChange={(ov, nv) => {
                    const trimmed = String(nv ?? '').trim();
                    const parsed = Number(trimmed);
                    onPatchQuotation({
                      header_proforma_percent:
                        trimmed === '' || Number.isNaN(parsed) ? null : parsed,
                    });
                  }}
                />
              </Main_InputContainer>

              <Main_InputContainer label="Downpayment Amount">
                <Main_TextField
                  defaultValue={
                    downpaymentAmount !== null &&
                    Number.isFinite(downpaymentAmount)
                      ? `${
                          totalsSummary?.baseCurrencyCode || baseCurrencyCode
                        } ${formatMoney(downpaymentAmount)}`
                      : '-'
                  }
                  disabled
                  placeholder=""
                />
              </Main_InputContainer>
            </>
          ) : null}

          <Main_InputContainer label="Created At">
            <Main_DateSelector
              defaultValue={toDateInputValue(createdAt)}
              disabled
            />
          </Main_InputContainer>

          <Main_InputContainer label="Updated At">
            <Main_DateSelector
              defaultValue={toDateInputValue(updatedAt)}
              disabled
            />
          </Main_InputContainer>

          <Main_InputContainer label="Remark">
            <Main_TextArea
              defaultValue={remark || ''}
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
