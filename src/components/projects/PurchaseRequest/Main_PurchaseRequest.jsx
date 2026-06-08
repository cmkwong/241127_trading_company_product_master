import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../../utils/crud';
import { useAuthContext } from '../../../store/AuthContext';
import { processChangesWithBase64 } from '../../../utils/objectUrlUtils';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import bottomBarDeleteStyles from '../../common/Buttons/BottomBarDeleteAction.module.css';
import PurchaseRequestSavePageContainer from './Container/PurchaseRequestSavePageContainer';
import PurchaseRequestSidebar from './AllPurchaseRequestList/PurchaseRequestSidebar';
import PurchaseRequestBasicInfo from './PurchaseBasicInfo/PurchaseRequestBasicInfo';
import PurchaseRequestShippingDetails from './ShippingDetails/PurchaseRequestShippingDetails';
import PurchaseRequestProductDetails from './ProductDetails/PurchaseRequestProductDetails';
import PurchaseRequestServiceDetails from './ServiceDetails/PurchaseRequestServiceDetails';
import {
  buildCurrencyCodeById,
  buildExchangeRateMap,
  buildNormalizedCurrencies,
  computeQuotationTotals,
  formatMoney,
  getLatestExchangeRateRow,
  toSafeString,
} from '../SalesQuotation/utils/quotationTotals';
import styles from './Main_PurchaseRequest.module.css';

const PURCHASE_API_BASE =
  'http://localhost:3001/api/v1/trade_business/purchase/data';
const SUPPLIERS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/suppliers/data/list';
const PRODUCTS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/products/data/list';
const CUSTOMERS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/customers/data';
const MASTER_API_BASE = 'http://localhost:3001/api/v1/trade_business/master';
const SALES_API_BASE = 'http://localhost:3001/api/v1/trade_business/sales/data';
const FILE_SERVER_BASE_URL = 'http://localhost:3001';

const DEFAULT_PURCHASE_FILE_MAPPINGS = {
  purchase_shipping_images: { url: 'image_url', base64: 'base64_image' },
  purchase_product_images: { url: 'image_url', base64: 'base64_image' },
  purchase_service_images: { url: 'image_url', base64: 'base64_image' },
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const stripAuditTimestamps = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => stripAuditTimestamps(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce((acc, [key, nestedValue]) => {
    if (key === 'created_at' || key === 'updated_at') {
      return acc;
    }

    acc[key] = stripAuditTimestamps(nestedValue);
    return acc;
  }, {});
};

const toNullableId = (value) => {
  const normalized = toSafeString(value);
  return normalized || null;
};

const extractRowsFromResponse = (response, tableName) => {
  if (Array.isArray(response?.structuredData?.data?.[tableName])) {
    return response.structuredData.data[tableName];
  }
  if (Array.isArray(response?.data?.[tableName])) {
    return response.data[tableName];
  }
  if (Array.isArray(response?.[tableName])) {
    return response[tableName];
  }
  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }
  if (Array.isArray(response?.results)) {
    return response.results;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
};

const newId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createNewPurchaseRequest = () => ({
  id: newId(),
  to_order: false,
  remark: '',
  sales_quotation_id: '',
  supplier_id: '',
  supplier_address_id: '',
  purchase_shipping_details: [],
  purchase_product_details: [],
  purchase_service_details: [],
});

const buildAddressPreview = (address) => {
  const detail = toSafeString(address?.address_detail);
  if (detail) {
    return detail;
  }

  const parts = [
    address?.address,
    address?.address_1,
    address?.line1,
    address?.address_2,
    address?.line2,
    address?.city,
    address?.state || address?.province,
    address?.country,
    address?.postal_code || address?.zip_code,
  ]
    .map((value) => toSafeString(value))
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return toSafeString(address?.name || address?.label || address?.id);
};

const getCustomerDisplayLabel = (customer) => {
  const firstCustomerName = toArray(customer?.customer_names)
    .map((row) => toSafeString(row?.name))
    .find(Boolean);

  return toSafeString(
    customer?.customer_display_name ||
      customer?.display_name ||
      customer?.customer_name ||
      customer?.name ||
      firstCustomerName ||
      customer?.customer_code ||
      customer?.label,
  );
};

const resolveFileUrl = (url) => {
  const normalized = toSafeString(url);
  if (!normalized) {
    return '';
  }

  if (/^(blob:|data:|https?:\/\/)/i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return `${FILE_SERVER_BASE_URL}${normalized}`;
  }

  return `${FILE_SERVER_BASE_URL}/${normalized}`;
};

const getProductDisplayName = (product) => {
  const productId = toSafeString(product?.id).toLowerCase();
  const nestedNames = toArray(product?.product_names)
    .map((row) => toSafeString(row?.name))
    .filter(Boolean);

  const candidates = [
    product?.product_display_name,
    product?.display_name,
    product?.product_name,
    ...nestedNames,
    product?.name,
    product?.id,
  ]
    .map((value) => toSafeString(value))
    .filter(Boolean);

  return (
    candidates.find((value) => value.toLowerCase() !== productId) ||
    candidates[0] ||
    ''
  );
};

const getProductCategoryLabel = (product, categoryNameById = new Map()) => {
  const firstNestedCategory = toArray(product?.product_categories).find((row) =>
    toSafeString(row?.category_name || row?.name || row?.category_id),
  );

  const nestedCategoryId = toSafeString(firstNestedCategory?.category_id);
  const mappedCategoryName =
    categoryNameById.get(nestedCategoryId) ||
    categoryNameById.get(toSafeString(product?.category_id));

  return toSafeString(
    product?.category_name ||
      product?.product_category_name ||
      firstNestedCategory?.category_name ||
      firstNestedCategory?.name ||
      mappedCategoryName ||
      firstNestedCategory?.category_id,
  );
};

const getProductAlibabaIdValue = (product) => {
  const firstNestedAlibaba = toArray(product?.product_alibaba_ids).find((row) =>
    toSafeString(row?.value || row?.alibaba_id || row?.id),
  );

  return toSafeString(
    product?.alibaba_id_value ||
      product?.alibaba_id ||
      firstNestedAlibaba?.value ||
      firstNestedAlibaba?.alibaba_id,
  );
};

const flattenSalesShippingPrices = (quotation) => {
  const directRows = toArray(quotation?.sales_shipping_prices);
  if (directRows.length > 0) {
    return directRows;
  }

  return toArray(quotation?.sales_shipping_details).flatMap((detailRow) =>
    toArray(detailRow?.sales_shipping_prices),
  );
};

const normalizeQuotationForTotals = (quotation) => ({
  ...quotation,
  sales_shipping_prices: flattenSalesShippingPrices(quotation),
  sales_product_details: toArray(quotation?.sales_product_details),
  sales_service_details: toArray(quotation?.sales_service_details),
});

const Main_PurchaseRequest = () => {
  const { token } = useAuthContext();

  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [salesQuotations, setSalesQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [exchangeRateRows, setExchangeRateRows] = useState([]);

  const [
    shippingQuotationSuggestionValue,
    setShippingQuotationSuggestionValue,
  ] = useState('');
  const [productQuotationSuggestionValue, setProductQuotationSuggestionValue] =
    useState('');
  const [serviceQuotationSuggestionValue, setServiceQuotationSuggestionValue] =
    useState('');

  const selectedIdRef = useRef('');

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const supplierSuggestionOptions = useMemo(
    () =>
      toArray(suppliers).map((item) => ({
        id: toSafeString(item?.id),
        name: toSafeString(
          item?.supplier_display_name ||
            item?.display_name ||
            item?.supplier_name ||
            item?.name ||
            item?.id,
        ),
        supplier_code: toSafeString(item?.supplier_code || item?.code),
        supplier_type_name: toSafeString(item?.supplier_type_name),
        supplier_addresses: toArray(item?.supplier_addresses),
        searchText: [
          item?.supplier_display_name,
          item?.display_name,
          item?.supplier_name,
          item?.name,
          item?.supplier_type_name,
          item?.supplier_code,
          item?.id,
        ]
          .map((value) => toSafeString(value))
          .filter(Boolean)
          .join(' '),
      })),
    [suppliers],
  );

  const supplierNameById = useMemo(() => {
    const map = new Map();
    supplierSuggestionOptions.forEach((item) => {
      if (!item.id) return;
      map.set(item.id, item.name || item.id);
    });
    return map;
  }, [supplierSuggestionOptions]);

  const selectedSupplierAddresses = useMemo(() => {
    const selectedSupplierId = toSafeString(draft?.supplier_id);
    if (!selectedSupplierId) return [];

    const supplier = supplierSuggestionOptions.find(
      (item) => item.id === selectedSupplierId,
    );

    return toArray(supplier?.supplier_addresses);
  }, [draft?.supplier_id, supplierSuggestionOptions]);

  const supplierAddressSuggestionOptions = useMemo(
    () =>
      selectedSupplierAddresses.map((address) => ({
        id: toSafeString(address?.id),
        name: buildAddressPreview(address),
        supplier_id: toSafeString(address?.supplier_id),
        address_detail: buildAddressPreview(address),
        searchText: [
          address?.id,
          address?.name,
          address?.address,
          address?.address_1,
          address?.line1,
          address?.city,
          address?.state,
          address?.country,
          address?.postal_code,
          buildAddressPreview(address),
        ]
          .map((value) => toSafeString(value))
          .filter(Boolean)
          .join(' '),
      })),
    [selectedSupplierAddresses],
  );

  const categoryNameById = useMemo(() => {
    const map = new Map();

    toArray(masterCategories).forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;

      const label = toSafeString(item?.name || item?.category_name || id);
      map.set(id, label);
    });

    return map;
  }, [masterCategories]);

  const productSuggestionOptions = useMemo(
    () =>
      toArray(products).map((item) => {
        const id = toSafeString(item?.id);
        const name = getProductDisplayName(item);
        const categoryName = getProductCategoryLabel(item, categoryNameById);
        const alibabaIdValue = getProductAlibabaIdValue(item);
        const nestedNames = toArray(item?.product_names)
          .map((row) => toSafeString(row?.name))
          .filter(Boolean);

        return {
          id,
          name,
          icon_url: toSafeString(
            item?.icon_url || toArray(item?.product_images)?.[0]?.image_url,
          ),
          category_name: categoryName,
          alibaba_id_value: alibabaIdValue,
          searchText: [
            id,
            name,
            item?.name,
            item?.product_name,
            ...nestedNames,
            categoryName,
            alibabaIdValue,
          ]
            .map((value) => toSafeString(value))
            .filter(Boolean)
            .join(' '),
        };
      }),
    [categoryNameById, products],
  );

  const serviceSuggestionOptions = useMemo(
    () =>
      toArray(services).map((item) => ({
        id: toSafeString(item?.id),
        name: toSafeString(item?.name || item?.service_name || item?.id),
        searchText: [item?.id, item?.name, item?.service_name]
          .map((value) => toSafeString(value))
          .filter(Boolean)
          .join(' '),
      })),
    [services],
  );

  const normalizedCurrencies = useMemo(
    () => buildNormalizedCurrencies(currencies),
    [currencies],
  );

  const currencyCodeById = useMemo(
    () => buildCurrencyCodeById(normalizedCurrencies),
    [normalizedCurrencies],
  );

  const currencyDropdownOptions = useMemo(
    () =>
      normalizedCurrencies.map((currency) => ({
        id: currency.id,
        name: currency.name
          ? `${currency.code} - ${currency.name}`
          : currency.code,
      })),
    [normalizedCurrencies],
  );

  const customerNameById = useMemo(() => {
    const map = new Map();

    toArray(customers).forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;

      const name = getCustomerDisplayLabel(item);

      map.set(id, name || 'Unknown customer');
    });

    return map;
  }, [customers]);

  const latestExchangeRateRow = useMemo(
    () => getLatestExchangeRateRow(exchangeRateRows),
    [exchangeRateRows],
  );

  const exchangeRateMap = useMemo(
    () => buildExchangeRateMap(latestExchangeRateRow || {}),
    [latestExchangeRateRow],
  );

  const salesQuotationTotalUsdById = useMemo(() => {
    const map = new Map();

    toArray(salesQuotations).forEach((quotation) => {
      const quotationId = toSafeString(quotation?.id);
      if (!quotationId) return;

      const totals = computeQuotationTotals(
        normalizeQuotationForTotals(quotation),
        {
          baseCurrencyCode: 'USD',
          currencyCodeById,
          exchangeRateMap,
        },
      );

      map.set(quotationId, Number(totals?.grandTotal || 0));
    });

    return map;
  }, [currencyCodeById, exchangeRateMap, salesQuotations]);

  const salesQuotationSuggestionOptions = useMemo(
    () =>
      toArray(salesQuotations).map((quotation) => {
        const id = toSafeString(quotation?.id);
        const customerName =
          customerNameById.get(toSafeString(quotation?.customer_id)) ||
          'Unknown customer';
        const totalUsd = salesQuotationTotalUsdById.get(id) || 0;

        return {
          id,
          name: `${id} | ${customerName} | USD ${formatMoney(totalUsd)}`,
          customer_name: customerName,
          total_usd: totalUsd,
          searchText: [
            quotation?.id,
            customerName,
            quotation?.customer_id,
            quotation?.remark,
            formatMoney(totalUsd),
          ]
            .map((value) => toSafeString(value))
            .filter(Boolean)
            .join(' '),
        };
      }),
    [customerNameById, salesQuotationTotalUsdById, salesQuotations],
  );

  const selectedSupplierOption = useMemo(
    () =>
      supplierSuggestionOptions.find(
        (item) => item.id === toSafeString(draft?.supplier_id),
      ) || null,
    [draft?.supplier_id, supplierSuggestionOptions],
  );

  const selectedSupplierAddressOption = useMemo(
    () =>
      supplierAddressSuggestionOptions.find(
        (item) => item.id === toSafeString(draft?.supplier_address_id),
      ) || null,
    [draft?.supplier_address_id, supplierAddressSuggestionOptions],
  );

  const selectedSalesQuotationOption = useMemo(
    () =>
      salesQuotationSuggestionOptions.find(
        (item) => item.id === toSafeString(draft?.sales_quotation_id),
      ) || null,
    [draft?.sales_quotation_id, salesQuotationSuggestionOptions],
  );

  const selectedSalesQuotation = useMemo(
    () =>
      toArray(salesQuotations).find(
        (item) => item.id === toSafeString(draft?.sales_quotation_id),
      ) || null,
    [draft?.sales_quotation_id, salesQuotations],
  );

  const productNameById = useMemo(() => {
    const map = new Map();
    productSuggestionOptions.forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;
      map.set(id, toSafeString(item?.name) || id);
    });
    return map;
  }, [productSuggestionOptions]);

  const serviceNameById = useMemo(() => {
    const map = new Map();
    serviceSuggestionOptions.forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;
      map.set(id, toSafeString(item?.name) || id);
    });
    return map;
  }, [serviceSuggestionOptions]);

  const supplierAddressNameById = useMemo(() => {
    const map = new Map();
    supplierAddressSuggestionOptions.forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;
      map.set(id, toSafeString(item?.name) || id);
    });
    return map;
  }, [supplierAddressSuggestionOptions]);

  const shippingQuotationSuggestionOptions = useMemo(
    () =>
      toArray(selectedSalesQuotation?.sales_shipping_details).map(
        (detail, index) => {
          const detailId = toSafeString(detail?.id) || `shipping-${index + 1}`;
          const supplierAddressId = toSafeString(
            detail?.supplier_address_id || detail?.customer_address_id,
          );
          const supplierAddressName =
            supplierAddressNameById.get(supplierAddressId) || supplierAddressId;
          const quantity = detail?.quantity ?? detail?.qty ?? '';

          return {
            id: detailId,
            name: `${index + 1}. ${supplierAddressName || 'Shipping'}${
              quantity !== '' ? ` | Qty ${quantity}` : ''
            }`,
            details: toSafeString(detail?.details),
            sourceRow: detail,
            searchText: [
              detailId,
              supplierAddressName,
              supplierAddressId,
              detail?.details,
              detail?.remark,
              detail?.length,
              detail?.width,
              detail?.height,
              quantity,
              detail?.weight,
            ]
              .map((value) => toSafeString(value))
              .filter(Boolean)
              .join(' '),
          };
        },
      ),
    [selectedSalesQuotation?.sales_shipping_details, supplierAddressNameById],
  );

  const productQuotationSuggestionOptions = useMemo(
    () =>
      toArray(selectedSalesQuotation?.sales_product_details).map(
        (detail, index) => {
          const detailId = toSafeString(detail?.id) || `product-${index + 1}`;
          const productId = toSafeString(detail?.product_id);
          const productName = productNameById.get(productId) || productId;
          const quantity = detail?.qty ?? detail?.quantity ?? '';

          return {
            id: detailId,
            name: `${index + 1}. ${productName || 'Product'}${
              quantity !== '' ? ` | Qty ${quantity}` : ''
            }`,
            details: toSafeString(detail?.details),
            sourceRow: detail,
            searchText: [
              detailId,
              productName,
              productId,
              detail?.details,
              detail?.remark,
              detail?.currency_id,
              detail?.price,
              quantity,
            ]
              .map((value) => toSafeString(value))
              .filter(Boolean)
              .join(' '),
          };
        },
      ),
    [productNameById, selectedSalesQuotation?.sales_product_details],
  );

  const serviceQuotationSuggestionOptions = useMemo(
    () =>
      toArray(selectedSalesQuotation?.sales_service_details).map(
        (detail, index) => {
          const detailId = toSafeString(detail?.id) || `service-${index + 1}`;
          const serviceId = toSafeString(detail?.service_id);
          const serviceName = serviceNameById.get(serviceId) || serviceId;
          const quantity = detail?.qty ?? detail?.quantity ?? '';

          return {
            id: detailId,
            name: `${index + 1}. ${serviceName || 'Service'}${
              quantity !== '' ? ` | Qty ${quantity}` : ''
            }`,
            details: toSafeString(detail?.details),
            sourceRow: detail,
            searchText: [
              detailId,
              serviceName,
              serviceId,
              detail?.supplier_id,
              detail?.details,
              detail?.remark,
              detail?.currency_id,
              detail?.price,
              quantity,
            ]
              .map((value) => toSafeString(value))
              .filter(Boolean)
              .join(' '),
          };
        },
      ),
    [selectedSalesQuotation?.sales_service_details, serviceNameById],
  );

  const handleSelectRow = useCallback(
    (itemOrId) => {
      const normalizedId = toSafeString(itemOrId?.id || itemOrId);
      setSelectedId(normalizedId);

      const selectedRow = toArray(rows).find(
        (row) => toSafeString(row?.id) === normalizedId,
      );

      setDraft(selectedRow ? JSON.parse(JSON.stringify(selectedRow)) : null);
    },
    [rows],
  );

  const refreshAll = useCallback(
    async (preferredSelectedId = '') => {
      if (!token) {
        setRows([]);
        setDraft(null);
        setSelectedId('');
        setMasterCategories([]);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const [
          purchaseRes,
          suppliersRes,
          productsRes,
          servicesRes,
          categoriesRes,
          currenciesRes,
          salesRes,
          customersRes,
          exchangeRatesRes,
        ] = await Promise.all([
          apiGet(PURCHASE_API_BASE, { token }),
          apiPost(SUPPLIERS_API_BASE, {}, { token }),
          apiPost(PRODUCTS_API_BASE, {}, { token }),
          apiGet(`${MASTER_API_BASE}/master_services`, { token }),
          apiGet(`${MASTER_API_BASE}/master_categories`, { token }),
          apiGet(`${MASTER_API_BASE}/master_currencies`, { token }),
          apiGet(SALES_API_BASE, { token }),
          apiGet(CUSTOMERS_API_BASE, { token }),
          apiGet(`${MASTER_API_BASE}/master_exchange_rate_hkd`, { token }),
        ]);

        const purchaseRows = extractRowsFromResponse(
          purchaseRes,
          'purchase_requests',
        );
        const supplierRows = extractRowsFromResponse(suppliersRes, 'suppliers');
        const productRows = extractRowsFromResponse(productsRes, 'products');
        const serviceRows = extractRowsFromResponse(
          servicesRes,
          'master_services',
        );
        const categoryRows = extractRowsFromResponse(
          categoriesRes,
          'master_categories',
        );
        const currencyRows = extractRowsFromResponse(
          currenciesRes,
          'master_currencies',
        );
        const salesRows = extractRowsFromResponse(salesRes, 'sales_quotations');
        const customerRows = extractRowsFromResponse(customersRes, 'customers');
        const exchangeRows = extractRowsFromResponse(
          exchangeRatesRes,
          'master_exchange_rate_hkd',
        );

        setRows(purchaseRows);
        setSuppliers(supplierRows);
        setProducts(productRows);
        setServices(serviceRows);
        setMasterCategories(categoryRows);
        setCurrencies(currencyRows);
        setSalesQuotations(salesRows);
        setCustomers(customerRows);
        setExchangeRateRows(exchangeRows);

        const nextTargetId =
          toSafeString(preferredSelectedId) ||
          toSafeString(selectedIdRef.current);

        const stillExists = purchaseRows.some(
          (row) => toSafeString(row?.id) === nextTargetId,
        );

        if (stillExists) {
          const selectedRow = purchaseRows.find(
            (row) => toSafeString(row?.id) === nextTargetId,
          );
          setSelectedId(nextTargetId);
          setDraft(
            selectedRow ? JSON.parse(JSON.stringify(selectedRow)) : null,
          );
          return;
        }

        if (purchaseRows.length > 0) {
          const firstId = toSafeString(purchaseRows[0]?.id);
          setSelectedId(firstId);
          setDraft(JSON.parse(JSON.stringify(purchaseRows[0])));
          return;
        }

        setSelectedId('');
        setDraft(null);
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Failed to load purchase requests');
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    setShippingQuotationSuggestionValue('');
    setProductQuotationSuggestionValue('');
    setServiceQuotationSuggestionValue('');
  }, [draft?.sales_quotation_id]);

  const setHeaderField = useCallback((key, value) => {
    setDraft((prev) => ({
      ...(prev || createNewPurchaseRequest()),
      [key]: value,
    }));
  }, []);

  const setDetailFieldById = useCallback((detailKey, rowId, field, value) => {
    const normalizedRowId = toSafeString(rowId);
    if (!normalizedRowId) return;

    setDraft((prev) => {
      const base = prev || createNewPurchaseRequest();
      const nextRows = toArray(base?.[detailKey]).map((row) => {
        if (toSafeString(row?.id) !== normalizedRowId) {
          return row;
        }

        return {
          ...row,
          [field]: value,
        };
      });

      return {
        ...base,
        [detailKey]: nextRows,
      };
    });
  }, []);

  const appendDetailRow = useCallback((detailKey, rowFactory) => {
    setDraft((prev) => {
      const base = prev || createNewPurchaseRequest();
      const list = toArray(base[detailKey]).map((row) => ({ ...row }));
      list.push(rowFactory(base));
      return {
        ...base,
        [detailKey]: list,
      };
    });
  }, []);

  const removeDetailRow = useCallback((detailKey, rowId) => {
    const normalizedRowId = toSafeString(rowId);
    if (!normalizedRowId) return;

    setDraft((prev) => {
      const base = prev || createNewPurchaseRequest();
      const list = toArray(base[detailKey]).filter(
        (row) => toSafeString(row?.id) !== normalizedRowId,
      );

      return {
        ...base,
        [detailKey]: list,
      };
    });
  }, []);

  const handleCreate = useCallback(() => {
    const fresh = createNewPurchaseRequest();
    setDraft(fresh);
    setSelectedId('');
    setError('');
    setNotice('New purchase request draft created');
  }, []);

  const buildDefaultUploadFiles = useCallback((files, nameField, urlField) => {
    return toArray(files)
      .slice()
      .sort(
        (a, b) => Number(a?.display_order || 0) - Number(b?.display_order || 0),
      )
      .map((file) => ({
        id: file?.id,
        name: file?.[nameField],
        url: file?.[urlField],
        display_order: file?.display_order,
      }));
  }, []);

  const handleNestedFilesChange = useCallback(
    (
      detailKey,
      rowId,
      fileKey,
      oldFiles,
      newFiles,
      { nameField, urlField },
    ) => {
      const normalizedRowId = toSafeString(rowId);
      if (!normalizedRowId) return;

      const oldList = toArray(oldFiles);
      const newList = toArray(newFiles);

      const removedFiles = oldList.filter(
        (oldItem) =>
          !newList.some(
            (newItem) =>
              toSafeString(newItem?.id) === toSafeString(oldItem?.id),
          ),
      );

      const addedFiles = newList.filter(
        (newItem) =>
          !oldList.some(
            (oldItem) =>
              toSafeString(oldItem?.id) === toSafeString(newItem?.id),
          ),
      );

      const sameLength = oldList.length === newList.length;
      const sameOrder =
        sameLength &&
        oldList.every(
          (item, index) =>
            toSafeString(item?.id) === toSafeString(newList[index]?.id),
        );

      if (removedFiles.length === 0 && addedFiles.length === 0 && sameOrder) {
        return;
      }

      const addedIds = new Set(
        addedFiles.map((item) => toSafeString(item?.id)),
      );

      const nextFiles = [
        ...removedFiles
          .map((item) => ({ id: item?.id, _delete: true }))
          .filter((item) => toSafeString(item?.id)),
        ...newList.map((item, fileIndex) => ({
          id: item?.id || newId(),
          display_order: fileIndex + 1,
          ...(addedIds.has(toSafeString(item?.id))
            ? {
                [nameField]: item?.name,
                [urlField]: item?.url,
              }
            : {}),
        })),
      ];

      setDetailFieldById(detailKey, normalizedRowId, fileKey, nextFiles);
    },
    [setDetailFieldById],
  );

  const buildPayloadFromWorking = useCallback((workingInput) => {
    const working = workingInput || createNewPurchaseRequest();

    return stripAuditTimestamps({
      ...working,
      sales_quotation_id: toNullableId(working?.sales_quotation_id),
      supplier_address_id: toNullableId(working?.supplier_address_id),
      purchase_shipping_details: toArray(working.purchase_shipping_details).map(
        (row) => ({
          ...row,
          purchase_request_id:
            toSafeString(row?.purchase_request_id) || toSafeString(working.id),
          supplier_address_id: toNullableId(row?.supplier_address_id),
          purchase_shipping_images: toArray(row?.purchase_shipping_images),
        }),
      ),
      purchase_product_details: toArray(working.purchase_product_details).map(
        (row) => ({
          ...row,
          purchase_request_id:
            toSafeString(row?.purchase_request_id) || toSafeString(working.id),
          currency_id: toNullableId(row?.currency_id),
          purchase_product_images: toArray(row?.purchase_product_images),
        }),
      ),
      purchase_service_details: toArray(working.purchase_service_details).map(
        (row) => ({
          ...row,
          purchase_request_id:
            toSafeString(row?.purchase_request_id) || toSafeString(working.id),
          supplier_id: toNullableId(row?.supplier_id),
          currency_id: toNullableId(row?.currency_id),
          purchase_service_images: toArray(row?.purchase_service_images),
        }),
      ),
    });
  }, []);

  const buildPayloadWithBase64 = useCallback(
    async (workingInput) => {
      const normalizedPayload = buildPayloadFromWorking(
        workingInput || createNewPurchaseRequest(),
      );

      return processChangesWithBase64(
        normalizedPayload,
        DEFAULT_PURCHASE_FILE_MAPPINGS,
      );
    },
    [buildPayloadFromWorking],
  );

  const getPurchaseRequestDryRunData = useCallback(async () => {
    if (!draft) {
      return {
        endpoint: PURCHASE_API_BASE,
        method: 'POST / PATCH',
        create: {},
        update: {},
        delete: {},
        message: 'No purchase request selected',
      };
    }

    const normalizedPayload = buildPayloadFromWorking(draft);
    const normalizedPayloadId = toSafeString(normalizedPayload?.id);
    const existingRow = toArray(rows).find(
      (row) => toSafeString(row?.id) === normalizedPayloadId,
    );
    const exists = Boolean(existingRow);

    if (exists) {
      const normalizedExisting = buildPayloadFromWorking(existingRow);
      const noChanges =
        JSON.stringify(normalizedExisting) ===
        JSON.stringify(normalizedPayload);

      if (noChanges) {
        return {
          endpoint: `${PURCHASE_API_BASE}/ids`,
          method: 'PATCH',
          create: {},
          update: {},
          delete: {},
          message: 'No changes detected',
        };
      }
    }

    const payload = await processChangesWithBase64(
      normalizedPayload,
      DEFAULT_PURCHASE_FILE_MAPPINGS,
    );

    return {
      endpoint: exists ? `${PURCHASE_API_BASE}/ids` : PURCHASE_API_BASE,
      method: exists ? 'PATCH' : 'POST',
      create: exists ? {} : { purchase_requests: [payload] },
      update: exists ? { purchase_requests: [payload] } : {},
      delete: {},
      payload: {
        data: {
          purchase_requests: [payload],
        },
      },
    };
  }, [buildPayloadFromWorking, draft, rows]);

  const handleSave = useCallback(async () => {
    if (!token || !draft) return;

    setError('');

    try {
      const payload = await buildPayloadWithBase64(draft);
      const exists = rows.some(
        (row) => toSafeString(row?.id) === toSafeString(payload?.id),
      );

      if (exists) {
        await apiPatch(
          `${PURCHASE_API_BASE}/ids`,
          { data: { purchase_requests: [payload] } },
          { token },
        );
      } else {
        await apiPost(
          PURCHASE_API_BASE,
          { data: { purchase_requests: [payload] } },
          { token },
        );
      }

      await refreshAll(payload?.id);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to save purchase request');
      throw err;
    }
  }, [buildPayloadWithBase64, draft, refreshAll, rows, token]);

  const handleDelete = useCallback(async () => {
    if (!token || !draft?.id || isDeleting) return;

    const confirmed = window.confirm(
      'Delete this purchase request? This action cannot be undone.',
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setError('');

    try {
      await apiDelete(`${PURCHASE_API_BASE}/ids`, {
        token,
        body: { data: { purchase_requests: [{ id: draft.id }] } },
      });
      setNotice('Purchase request deleted');
      await refreshAll('');
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to delete purchase request');
    } finally {
      setIsDeleting(false);
    }
  }, [draft?.id, isDeleting, refreshAll, token]);

  const filteredRows = useMemo(() => {
    const query = toSafeString(sidebarSearch).toLowerCase();
    if (!query) return rows;

    return toArray(rows).filter((row) => {
      const supplierName =
        supplierNameById.get(toSafeString(row?.supplier_id)) ||
        toSafeString(row?.supplier_id);

      const summary = [
        row?.id,
        row?.remark,
        supplierName,
        row?.supplier_id,
        row?.sales_quotation_id,
      ]
        .map((value) => toSafeString(value).toLowerCase())
        .filter(Boolean)
        .join(' ');

      return summary.includes(query);
    });
  }, [rows, sidebarSearch, supplierNameById]);

  const getSidebarItemTitle = useCallback(
    (row) => {
      const supplierName =
        supplierNameById.get(toSafeString(row?.supplier_id)) ||
        'Unknown supplier';
      return supplierName;
    },
    [supplierNameById],
  );

  const getSidebarItemRows = useCallback(
    (row) => [
      {
        label: 'Purchase ID:',
        value: toSafeString(row?.id),
      },
      {
        label: 'Sales Quotation:',
        value: toSafeString(row?.sales_quotation_id) || '-',
      },
      {
        label: 'Status:',
        value: row?.to_order ? 'To Order' : 'Purchase Request',
      },
      {
        label: 'Details:',
        value: `S:${toArray(row?.purchase_shipping_details).length} / P:${
          toArray(row?.purchase_product_details).length
        } / V:${toArray(row?.purchase_service_details).length}`,
      },
    ],
    [],
  );

  const handleSupplierInputChange = useCallback((nextValue) => {
    if (!toSafeString(nextValue)) {
      setDraft((prev) => ({
        ...(prev || createNewPurchaseRequest()),
        supplier_id: '',
        supplier_address_id: '',
      }));
    }
  }, []);

  const handleSupplierSelect = useCallback((suggestion) => {
    const nextSupplierId = toSafeString(suggestion?.id);

    setDraft((prev) => {
      const base = prev || createNewPurchaseRequest();
      const hasAddress = toArray(suggestion?.supplier_addresses).some(
        (address) =>
          toSafeString(address?.id) === toSafeString(base?.supplier_address_id),
      );

      return {
        ...base,
        supplier_id: nextSupplierId,
        supplier_address_id: hasAddress
          ? toSafeString(base?.supplier_address_id)
          : '',
      };
    });
  }, []);

  const handleSupplierAddressInputChange = useCallback(
    (nextValue) => {
      if (!toSafeString(nextValue)) {
        setHeaderField('supplier_address_id', '');
      }
    },
    [setHeaderField],
  );

  const handleSalesQuotationInputChange = useCallback(
    (nextValue) => {
      if (!toSafeString(nextValue)) {
        setHeaderField('sales_quotation_id', '');
      }
    },
    [setHeaderField],
  );

  const handleAddShippingDetail = useCallback(() => {
    appendDetailRow('purchase_shipping_details', (header) => ({
      id: newId(),
      purchase_request_id: header.id,
      supplier_address_id: toSafeString(header?.supplier_address_id),
      length: '',
      width: '',
      height: '',
      quantity: '',
      weight: '',
      details: '',
      purchase_shipping_images: [],
    }));
  }, [appendDetailRow]);

  const handleAddProductDetail = useCallback(() => {
    appendDetailRow('purchase_product_details', (header) => ({
      id: newId(),
      purchase_request_id: header.id,
      product_id: '',
      qty: '',
      currency_id: '',
      price: '',
      details: '',
      purchase_product_images: [],
    }));
  }, [appendDetailRow]);

  const handleAddServiceDetail = useCallback(() => {
    appendDetailRow('purchase_service_details', (header) => ({
      id: newId(),
      purchase_request_id: header.id,
      supplier_id: toSafeString(header?.supplier_id),
      service_id: '',
      qty: '',
      currency_id: '',
      price: '',
      details: '',
      purchase_service_images: [],
    }));
  }, [appendDetailRow]);

  const handleSelectShippingFromQuotation = useCallback(
    (suggestion) => {
      const sourceRow = suggestion?.sourceRow;
      if (!sourceRow) return;

      appendDetailRow('purchase_shipping_details', (header) => ({
        id: newId(),
        purchase_request_id: header.id,
        supplier_address_id: toSafeString(
          sourceRow?.supplier_address_id || header?.supplier_address_id,
        ),
        length: sourceRow?.length ?? '',
        width: sourceRow?.width ?? '',
        height: sourceRow?.height ?? '',
        quantity: sourceRow?.quantity ?? sourceRow?.qty ?? '',
        weight: sourceRow?.weight ?? '',
        details: toSafeString(sourceRow?.details || sourceRow?.remark),
        purchase_shipping_images: [],
      }));

      setShippingQuotationSuggestionValue('');
    },
    [appendDetailRow],
  );

  const handleSelectProductFromQuotation = useCallback(
    (suggestion) => {
      const sourceRow = suggestion?.sourceRow;
      if (!sourceRow) return;

      appendDetailRow('purchase_product_details', (header) => ({
        id: newId(),
        purchase_request_id: header.id,
        product_id: toSafeString(sourceRow?.product_id),
        qty: sourceRow?.qty ?? sourceRow?.quantity ?? '',
        currency_id: toSafeString(sourceRow?.currency_id),
        price: sourceRow?.price ?? '',
        details: toSafeString(sourceRow?.details || sourceRow?.remark),
        purchase_product_images: [],
      }));

      setProductQuotationSuggestionValue('');
    },
    [appendDetailRow],
  );

  const handleSelectServiceFromQuotation = useCallback(
    (suggestion) => {
      const sourceRow = suggestion?.sourceRow;
      if (!sourceRow) return;

      appendDetailRow('purchase_service_details', (header) => ({
        id: newId(),
        purchase_request_id: header.id,
        supplier_id: toSafeString(
          sourceRow?.supplier_id || header?.supplier_id,
        ),
        service_id: toSafeString(sourceRow?.service_id),
        qty: sourceRow?.qty ?? sourceRow?.quantity ?? '',
        currency_id: toSafeString(sourceRow?.currency_id),
        price: sourceRow?.price ?? '',
        details: toSafeString(sourceRow?.details || sourceRow?.remark),
        purchase_service_images: [],
      }));

      setServiceQuotationSuggestionValue('');
    },
    [appendDetailRow],
  );

  return (
    <PurchaseRequestSavePageContainer
      onSave={handleSave}
      dryRunAction={getPurchaseRequestDryRunData}
      saveButtonText="Save Purchase Request"
      successMessage="Purchase request saved successfully!"
      leftBottomAction={
        <DeleteBtn
          text={isDeleting ? 'Deleting...' : 'Delete Purchase Request'}
          onClick={handleDelete}
          disabled={!draft?.id || isDeleting}
          title="Delete selected purchase request"
          ariaLabel="Delete selected purchase request"
          className={bottomBarDeleteStyles.bottomBarDeleteAction}
        />
      }
    >
      <div className={styles.page}>
        <PurchaseRequestSidebar
          rows={filteredRows}
          selectedId={selectedId}
          searchValue={sidebarSearch}
          onSearchChange={setSidebarSearch}
          onSelectRow={handleSelectRow}
          onCreate={handleCreate}
          onRefresh={() => refreshAll(selectedId)}
          isLoading={isLoading}
          getItemTitle={getSidebarItemTitle}
          getItemRows={getSidebarItemRows}
        />

        <section className={styles.editor}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>Purchase Request Editor</h2>
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}
          {notice ? <div className={styles.notice}>{notice}</div> : null}

          {!draft ? (
            <div className={styles.emptyEditor}>
              Select a purchase request or create a new one.
            </div>
          ) : (
            <>
              <PurchaseRequestBasicInfo
                draft={draft}
                supplierSuggestionOptions={supplierSuggestionOptions}
                selectedSupplierOption={selectedSupplierOption}
                supplierAddressSuggestionOptions={
                  supplierAddressSuggestionOptions
                }
                selectedSupplierAddressOption={selectedSupplierAddressOption}
                salesQuotationSuggestionOptions={
                  salesQuotationSuggestionOptions
                }
                selectedSalesQuotationOption={selectedSalesQuotationOption}
                onIdChange={(value) => setHeaderField('id', value)}
                onSupplierInputChange={handleSupplierInputChange}
                onSupplierSelect={handleSupplierSelect}
                onSupplierAddressInputChange={handleSupplierAddressInputChange}
                onSupplierAddressSelect={(suggestion) =>
                  setHeaderField(
                    'supplier_address_id',
                    toSafeString(suggestion?.id),
                  )
                }
                onSalesQuotationInputChange={handleSalesQuotationInputChange}
                onSalesQuotationSelect={(suggestion) =>
                  setHeaderField(
                    'sales_quotation_id',
                    toSafeString(suggestion?.id),
                  )
                }
                onOrderStatusChange={(value) =>
                  setHeaderField('to_order', value)
                }
                onRemarkChange={(value) => setHeaderField('remark', value)}
              />

              <PurchaseRequestShippingDetails
                rows={toArray(draft?.purchase_shipping_details)}
                supplierAddressSuggestionOptions={
                  supplierAddressSuggestionOptions
                }
                fileUrlBase={FILE_SERVER_BASE_URL}
                quotationSuggestionOptions={shippingQuotationSuggestionOptions}
                quotationSuggestionValue={shippingQuotationSuggestionValue}
                onQuotationSuggestionInputChange={
                  setShippingQuotationSuggestionValue
                }
                onQuotationSuggestionSelect={handleSelectShippingFromQuotation}
                onAdd={handleAddShippingDetail}
                onSetField={(rowId, field, value) =>
                  setDetailFieldById(
                    'purchase_shipping_details',
                    rowId,
                    field,
                    value,
                  )
                }
                onRemove={(rowId) =>
                  removeDetailRow('purchase_shipping_details', rowId)
                }
                buildDefaultUploadFiles={buildDefaultUploadFiles}
                onFilesChange={(rowId, oldFiles, newFiles) =>
                  handleNestedFilesChange(
                    'purchase_shipping_details',
                    rowId,
                    'purchase_shipping_images',
                    oldFiles,
                    newFiles,
                    { nameField: 'image_name', urlField: 'image_url' },
                  )
                }
              />

              <PurchaseRequestProductDetails
                rows={toArray(draft?.purchase_product_details)}
                productSuggestionOptions={productSuggestionOptions}
                currencyDropdownOptions={currencyDropdownOptions}
                fileUrlBase={FILE_SERVER_BASE_URL}
                quotationSuggestionOptions={productQuotationSuggestionOptions}
                quotationSuggestionValue={productQuotationSuggestionValue}
                onQuotationSuggestionInputChange={
                  setProductQuotationSuggestionValue
                }
                onQuotationSuggestionSelect={handleSelectProductFromQuotation}
                onAdd={handleAddProductDetail}
                onSetField={(rowId, field, value) =>
                  setDetailFieldById(
                    'purchase_product_details',
                    rowId,
                    field,
                    value,
                  )
                }
                onRemove={(rowId) =>
                  removeDetailRow('purchase_product_details', rowId)
                }
                buildDefaultUploadFiles={buildDefaultUploadFiles}
                onFilesChange={(rowId, oldFiles, newFiles) =>
                  handleNestedFilesChange(
                    'purchase_product_details',
                    rowId,
                    'purchase_product_images',
                    oldFiles,
                    newFiles,
                    { nameField: 'image_name', urlField: 'image_url' },
                  )
                }
                resolveFileUrl={resolveFileUrl}
              />

              <PurchaseRequestServiceDetails
                rows={toArray(draft?.purchase_service_details)}
                serviceSuggestionOptions={serviceSuggestionOptions}
                currencyDropdownOptions={currencyDropdownOptions}
                fileUrlBase={FILE_SERVER_BASE_URL}
                quotationSuggestionOptions={serviceQuotationSuggestionOptions}
                quotationSuggestionValue={serviceQuotationSuggestionValue}
                onQuotationSuggestionInputChange={
                  setServiceQuotationSuggestionValue
                }
                onQuotationSuggestionSelect={handleSelectServiceFromQuotation}
                onAdd={handleAddServiceDetail}
                onSetField={(rowId, field, value) =>
                  setDetailFieldById(
                    'purchase_service_details',
                    rowId,
                    field,
                    value,
                  )
                }
                onRemove={(rowId) =>
                  removeDetailRow('purchase_service_details', rowId)
                }
                buildDefaultUploadFiles={buildDefaultUploadFiles}
                onFilesChange={(rowId, oldFiles, newFiles) =>
                  handleNestedFilesChange(
                    'purchase_service_details',
                    rowId,
                    'purchase_service_images',
                    oldFiles,
                    newFiles,
                    { nameField: 'image_name', urlField: 'image_url' },
                  )
                }
              />
            </>
          )}
        </section>
      </div>
    </PurchaseRequestSavePageContainer>
  );
};

export default Main_PurchaseRequest;
