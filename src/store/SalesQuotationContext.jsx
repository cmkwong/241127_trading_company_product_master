import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../utils/crud';
import {
  buildNestedChangedData,
  canProceedWithRecordSwitch,
  cleanupNestedInternalFlags,
  ensureContextAvailable,
  getEffectiveComparisonKeys,
  validateNestedDataObject,
} from '../utils/contextDataUtils';
import { upsertNestedData } from '../utils/crudObj';
import { useAuthContext } from './AuthContext';
import { useMasterContext } from './MasterContext';

export const SalesQuotationContext = createContext();

const SALES_API_BASE = 'http://localhost:3001/api/v1/trade_business/sales';
const CUSTOMERS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/customers';
const SUPPLIERS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/suppliers';
const PRODUCTS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/products';

const SALES_TABLE_NAME = 'sales_quotations';

const DEFAULT_INCOTERM_OPTIONS = [
  { id: 'EXW', name: 'EXW' },
  { id: 'FOB', name: 'FOB' },
  { id: 'CIF', name: 'CIF' },
  { id: 'DAP', name: 'DAP' },
];

const toSafeString = (value) => String(value || '').trim();

const toIsoNow = () => new Date().toISOString();

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const toArray = (value) => (Array.isArray(value) ? value : []);

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

const pickFirstLabel = (record, keys = []) => {
  for (const key of keys) {
    const value = toSafeString(record?.[key]);
    if (value) {
      return value;
    }
  }
  return '';
};

const pickNestedName = (record, nestedKeys = []) => {
  for (const key of nestedKeys) {
    const rows = toArray(record?.[key]);
    const first = rows[0];
    const label =
      pickFirstLabel(first, ['name', 'value', 'remark']) ||
      pickFirstLabel(first, ['label']);
    if (label) {
      return label;
    }
  }
  return '';
};

const toOption = (id, label) => {
  const normalizedId = toSafeString(id);
  if (!normalizedId) {
    return null;
  }

  return {
    id: normalizedId,
    name: toSafeString(label) || normalizedId,
  };
};

const normalizeSalesQuotation = (row = {}) => {
  const now = toIsoNow();
  return {
    id: toSafeString(row?.id),
    to_order: Boolean(row?.to_order),
    remark: toSafeString(row?.remark),
    customer_id: toSafeString(row?.customer_id),
    customer_address_id: toSafeString(row?.customer_address_id),
    created_at: toSafeString(row?.created_at) || now,
    updated_at:
      toSafeString(row?.updated_at) || toSafeString(row?.created_at) || now,
    sales_shipping_details: toArray(row?.sales_shipping_details),
    sales_shipping_prices: toArray(row?.sales_shipping_prices),
    sales_shipping_images: toArray(row?.sales_shipping_images),
    sales_product_details: toArray(row?.sales_product_details),
    sales_product_detail_images: toArray(row?.sales_product_detail_images),
    sales_service_details: toArray(row?.sales_service_details),
    sales_service_detail_images: toArray(row?.sales_service_detail_images),
  };
};

const buildOriginalMap = (rows = []) => {
  return rows.reduce((acc, row) => {
    const id = toSafeString(row?.id);
    if (!id) {
      return acc;
    }

    acc[id] = deepClone(row);
    return acc;
  }, {});
};

const sortByUpdatedDesc = (rows = []) => {
  return [...rows].sort((a, b) => {
    const aTime = new Date(a?.updated_at || a?.created_at || 0).getTime();
    const bTime = new Date(b?.updated_at || b?.created_at || 0).getTime();
    return bTime - aTime;
  });
};

export const SalesQuotationContext_Provider = ({ children }) => {
  const { token } = useAuthContext();
  const { services, currencies } = useMasterContext();

  const [quotations, setQuotations] = useState([]);
  const [originalQuotationMap, setOriginalQuotationMap] = useState({});
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [isSalesQuotationsLoading, setIsSalesQuotationsLoading] =
    useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerAddressOptions, setCustomerAddressOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [saveError, setSaveError] = useState('');

  const salesFetchSeqRef = useRef(0);
  const optionsFetchSeqRef = useRef(0);

  const selectedQuotation = useMemo(() => {
    return quotations.find((item) => item.id === selectedQuotationId) || null;
  }, [quotations, selectedQuotationId]);

  const pageData = useMemo(() => selectedQuotation || {}, [selectedQuotation]);
  const originalPageData = useMemo(() => {
    const id = toSafeString(selectedQuotation?.id);
    if (!id) {
      return {};
    }

    return originalQuotationMap[id] || {};
  }, [selectedQuotation, originalQuotationMap]);

  const effectiveComparisonKeys = useCallback(() => {
    return getEffectiveComparisonKeys({
      comparisonKeys: [],
      pageData,
    });
  }, [pageData]);

  const getChangedData = useCallback(() => {
    return buildNestedChangedData({
      pageData,
      originalPageData,
      comparisonKeys: effectiveComparisonKeys(),
      rootTableName: SALES_TABLE_NAME,
      base64Config: {},
    });
  }, [pageData, originalPageData, effectiveComparisonKeys]);

  const cleanupQuotationFlags = useCallback((value) => {
    return cleanupNestedInternalFlags(value);
  }, []);

  const isDataUnchanged = useCallback(() => {
    return getChangedData() === null;
  }, [getChangedData]);

  const refreshSalesQuotationList = useCallback(async () => {
    if (!token) {
      setQuotations([]);
      setOriginalQuotationMap({});
      setSelectedQuotationId(null);
      return [];
    }

    const fetchSequence = ++salesFetchSeqRef.current;
    setIsSalesQuotationsLoading(true);

    try {
      const response = await apiGet(`${SALES_API_BASE}/data`, { token });
      const rows = extractRowsFromResponse(response, SALES_TABLE_NAME)
        .map(normalizeSalesQuotation)
        .filter((row) => toSafeString(row?.id));
      const sortedRows = sortByUpdatedDesc(rows);

      if (fetchSequence !== salesFetchSeqRef.current) {
        return [];
      }

      setQuotations(sortedRows);
      setOriginalQuotationMap(buildOriginalMap(sortedRows));
      setSelectedQuotationId((previousId) => {
        const previousExists = sortedRows.some((row) => row.id === previousId);
        if (previousExists) {
          return previousId;
        }
        return sortedRows[0]?.id || null;
      });

      return sortedRows;
    } catch (error) {
      console.error('Failed to fetch sales quotations:', error);

      if (fetchSequence === salesFetchSeqRef.current) {
        setQuotations([]);
        setOriginalQuotationMap({});
        setSelectedQuotationId(null);
      }

      return [];
    } finally {
      if (fetchSequence === salesFetchSeqRef.current) {
        setIsSalesQuotationsLoading(false);
      }
    }
  }, [token]);

  const fetchSuppliersList = useCallback(async () => {
    try {
      return await apiPost(
        `${SUPPLIERS_API_BASE}/data/list`,
        {
          fields: {
            suppliers: ['id', 'name', 'supplier_code'],
            supplier_names: ['id', 'supplier_id', 'name'],
          },
        },
        { token },
      );
    } catch {
      return apiPost(`${SUPPLIERS_API_BASE}/data/list`, {}, { token });
    }
  }, [token]);

  const fetchProductsList = useCallback(async () => {
    try {
      return await apiPost(
        `${PRODUCTS_API_BASE}/data/list`,
        {
          fields: {
            products: ['id', 'remark', 'hs_code', 'product_index'],
            product_names: ['id', 'product_id', 'name'],
          },
        },
        { token },
      );
    } catch {
      return apiPost(`${PRODUCTS_API_BASE}/data/list`, {}, { token });
    }
  }, [token]);

  const refreshReferenceOptions = useCallback(async () => {
    if (!token) {
      setCustomerOptions([]);
      setCustomerAddressOptions([]);
      setSupplierOptions([]);
      setProductOptions([]);
      return;
    }

    const fetchSequence = ++optionsFetchSeqRef.current;

    const [customerResult, supplierResult, productResult] =
      await Promise.allSettled([
        apiGet(`${CUSTOMERS_API_BASE}/data`, { token }),
        fetchSuppliersList(),
        fetchProductsList(),
      ]);

    if (fetchSequence !== optionsFetchSeqRef.current) {
      return;
    }

    const customerResponse =
      customerResult.status === 'fulfilled' ? customerResult.value : null;
    const supplierResponse =
      supplierResult.status === 'fulfilled' ? supplierResult.value : null;
    const productResponse =
      productResult.status === 'fulfilled' ? productResult.value : null;

    const customerRows = extractRowsFromResponse(customerResponse, 'customers');
    const customerAddressRows = extractRowsFromResponse(
      customerResponse,
      'customer_addresses',
    );

    const normalizedCustomerOptions = customerRows
      .map((customer) => {
        const id = toSafeString(customer?.id);
        const label =
          pickFirstLabel(customer, [
            'name',
            'customer_code',
            'code',
          ]) || pickNestedName(customer, ['customer_names']);
        return toOption(id, label);
      })
      .filter(Boolean);

    const addressSource =
      customerAddressRows.length > 0
        ? customerAddressRows
        : customerRows.flatMap((customer) => {
            return toArray(customer?.customer_addresses).map((address) => ({
              ...address,
              customer_id:
                toSafeString(address?.customer_id) ||
                toSafeString(customer?.id),
            }));
          });

    const normalizedAddressOptions = addressSource
      .map((address) => {
        const id = toSafeString(address?.id);
        if (!id) {
          return null;
        }

        const customerId = toSafeString(address?.customer_id);
        const label = pickFirstLabel(address, [
          'name',
          'value',
          'address',
          'details',
          'remark',
        ]);

        return {
          id,
          customer_id: customerId,
          name: label || id,
        };
      })
      .filter(Boolean);

    const supplierRows = extractRowsFromResponse(supplierResponse, 'suppliers');
    const normalizedSupplierOptions = supplierRows
      .map((supplier) => {
        const id = toSafeString(supplier?.id);
        const label =
          pickFirstLabel(supplier, [
            'name',
            'supplier_code',
            'code',
          ]) || pickNestedName(supplier, ['supplier_names']);
        return toOption(id, label);
      })
      .filter(Boolean);

    const productRows = extractRowsFromResponse(productResponse, 'products');
    const normalizedProductOptions = productRows
      .map((product) => {
        const id = toSafeString(product?.id);
        const label =
          pickFirstLabel(product, [
            'remark',
            'name',
            'hs_code',
            'product_index',
          ]) || pickNestedName(product, ['product_names']);
        return toOption(id, label);
      })
      .filter(Boolean);

    setCustomerOptions(normalizedCustomerOptions);
    setCustomerAddressOptions(normalizedAddressOptions);
    setSupplierOptions(normalizedSupplierOptions);
    setProductOptions(normalizedProductOptions);
  }, [fetchProductsList, fetchSuppliersList, token]);

  useEffect(() => {
    if (!token) {
      setQuotations([]);
      setOriginalQuotationMap({});
      setSelectedQuotationId(null);
      setCustomerOptions([]);
      setCustomerAddressOptions([]);
      setSupplierOptions([]);
      setProductOptions([]);
      setSaveError('');
      return;
    }

    refreshSalesQuotationList();
    refreshReferenceOptions();
  }, [token, refreshSalesQuotationList, refreshReferenceOptions]);

  const upsertSalesQuotationPageData = useCallback(
    (nestedData = {}) => {
      const targetId = toSafeString(selectedQuotationId);
      if (!targetId) {
        return;
      }

      if (
        !validateNestedDataObject(
          nestedData,
          'upsertSalesQuotationPageData requires an object argument',
        )
      ) {
        return;
      }

      setQuotations((previousRows) =>
        previousRows.map((row) => {
          if (toSafeString(row?.id) !== targetId) {
            return row;
          }

          const upsertedRow = upsertNestedData(row, nestedData);

          return {
            ...upsertedRow,
            updated_at: toIsoNow(),
          };
        }),
      );
      setSaveError('');
    },
    [selectedQuotationId],
  );

  const patchSelectedQuotation = useCallback(
    (patch = {}) => {
      upsertSalesQuotationPageData(patch);
    },
    [upsertSalesQuotationPageData],
  );

  const saveSelectedQuotation = useCallback(async () => {
    const targetId = toSafeString(selectedQuotation?.id);
    if (!token) {
      throw new Error('Missing auth token. Please log in again.');
    }

    if (!targetId) {
      throw new Error('No sales quotation selected to save.');
    }

    setSaveError('');

    try {
      const changesResult = getChangedData();

      if (!changesResult) {
        return selectedQuotation;
      }

      const { changes, deletions } = changesResult;

      if (deletions) {
        try {
          await apiDelete(`${SALES_API_BASE}/data/ids`, {
            token,
            body: { data: deletions },
          });
        } catch {
          await apiDelete(`${SALES_API_BASE}/data`, {
            token,
            body: { data: deletions },
          });
        }
      }

      if (changes) {
        try {
          await apiPatch(
            `${SALES_API_BASE}/data/ids`,
            { data: changes },
            { token },
          );
        } catch {
          await apiPost(
            `${SALES_API_BASE}/data`,
            { data: changes },
            { token },
          );
        }
      }

      const cleanedPageData = cleanupQuotationFlags(selectedQuotation);
      const normalizedSavedRow = normalizeSalesQuotation(cleanedPageData);

      setQuotations((previousRows) =>
        previousRows.map((row) =>
          toSafeString(row?.id) === targetId ? normalizedSavedRow : row,
        ),
      );
      setOriginalQuotationMap((previousMap) => ({
        ...previousMap,
        [targetId]: deepClone(normalizedSavedRow),
      }));

      return normalizedSavedRow;
    } catch (error) {
      setSaveError(error?.message || 'Failed to save sales quotation');
      throw error;
    }
  }, [selectedQuotation, token, getChangedData, cleanupQuotationFlags]);

  const createSalesQuotation = useCallback(async () => {
    if (!token) {
      return null;
    }

    const defaultCustomerId = toSafeString(customerOptions?.[0]?.id);
    const firstAddress = customerAddressOptions.find(
      (address) => toSafeString(address?.customer_id) === defaultCustomerId,
    );

    const newPayload = {
      to_order: false,
      remark: '',
    };

    if (defaultCustomerId) {
      newPayload.customer_id = defaultCustomerId;
    }

    if (firstAddress?.id) {
      newPayload.customer_address_id = toSafeString(firstAddress.id);
    }

    const response = await apiPost(
      `${SALES_API_BASE}/data`,
      {
        data: {
          sales_quotations: [newPayload],
        },
      },
      { token },
    );

    const createdRows = extractRowsFromResponse(response, SALES_TABLE_NAME)
      .map(normalizeSalesQuotation)
      .filter((row) => toSafeString(row?.id));

    if (createdRows.length > 0) {
      const createdRow = createdRows[0];

      setQuotations((previousRows) => {
        const withoutDuplicate = previousRows.filter(
          (row) => row.id !== createdRow.id,
        );
        return [createdRow, ...withoutDuplicate];
      });
      setOriginalQuotationMap((previousMap) => ({
        ...previousMap,
        [createdRow.id]: deepClone(createdRow),
      }));
      setSelectedQuotationId(createdRow.id);

      return createdRow;
    }

    const refreshedRows = await refreshSalesQuotationList();
    return refreshedRows[0] || null;
  }, [
    customerAddressOptions,
    customerOptions,
    refreshSalesQuotationList,
    token,
  ]);

  const deleteSalesQuotation = useCallback(
    async (quotationId) => {
      const targetId = toSafeString(quotationId || selectedQuotationId);
      if (!targetId || !token) {
        return false;
      }

      const requestBody = {
        data: {
          sales_quotations: [{ id: targetId }],
        },
      };

      try {
        await apiDelete(`${SALES_API_BASE}/data/ids`, {
          token,
          body: requestBody,
        });
      } catch {
        await apiDelete(`${SALES_API_BASE}/data`, {
          token,
          body: requestBody,
        });
      }

      setQuotations((previousRows) => {
        const nextRows = previousRows.filter((row) => row.id !== targetId);

        setSelectedQuotationId((previousId) => {
          if (previousId !== targetId) {
            return previousId;
          }
          return nextRows[0]?.id || null;
        });

        return nextRows;
      });

      setOriginalQuotationMap((previousMap) => {
        const nextMap = { ...previousMap };
        delete nextMap[targetId];
        return nextMap;
      });

      return true;
    },
    [selectedQuotationId, token],
  );

  const selectSalesQuotation = useCallback(
    (id) => {
      const nextId = toSafeString(id);
      if (!nextId) {
        return false;
      }

      const canSwitch = canProceedWithRecordSwitch({
        hasRecordId: !!selectedQuotation?.id,
        isDataUnchanged: isDataUnchanged(),
      });

      if (!canSwitch) {
        return false;
      }

      setSelectedQuotationId(nextId);
      return true;
    },
    [isDataUnchanged, selectedQuotation],
  );

  const getSalesQuotationDryRunData = useCallback(() => {
    const changesResult = getChangedData();

    return {
      read: {
        method: 'GET',
        endpoint: `${SALES_API_BASE}/data`,
      },
      create: {
        method: 'POST',
        endpoint: `${SALES_API_BASE}/data`,
      },
      update: {
        method: 'POST',
        endpoint: `${SALES_API_BASE}/data`,
        note: 'Upsert selected quotation payload',
      },
      delete: {
        method: 'DELETE',
        endpoint: `${SALES_API_BASE}/data/ids`,
        fallbackEndpoint: `${SALES_API_BASE}/data`,
      },
      payload: changesResult
        ? {
            changes: changesResult?.changes || null,
            deletions: changesResult?.deletions || null,
          }
        : {
            message: 'No changes detected',
          },
      selectedQuotation: selectedQuotation || {
        message: 'No sales quotation selected',
      },
    };
  }, [selectedQuotation, getChangedData]);

  const serviceOptions = useMemo(() => {
    return toArray(services)
      .map((item) =>
        toOption(
          item?.id,
          pickFirstLabel(item, ['service_name', 'name', 'label', 'id']),
        ),
      )
      .filter(Boolean);
  }, [services]);

  const currencyOptions = useMemo(() => {
    return toArray(currencies)
      .map((item) =>
        toOption(item?.id, pickFirstLabel(item, ['label', 'name', 'id'])),
      )
      .filter(Boolean);
  }, [currencies]);

  const contextValue = {
    quotations,
    selectedQuotationId,
    setSelectedQuotationId,
    selectedQuotation,
    pageData,
    isSalesQuotationsLoading,
    customerOptions,
    customerAddressOptions,
    supplierOptions,
    productOptions,
    serviceOptions,
    currencyOptions,
    incotermOptions: DEFAULT_INCOTERM_OPTIONS,
    saveError,
    isDataUnchanged,
    getChangedData,
    refreshSalesQuotationList,
    refreshReferenceOptions,
    patchSelectedQuotation,
    upsertSalesQuotationPageData,
    saveSelectedQuotation,
    createSalesQuotation,
    deleteSalesQuotation,
    selectSalesQuotation,
    getSalesQuotationDryRunData,
  };

  return (
    <SalesQuotationContext.Provider value={contextValue}>
      {children}
    </SalesQuotationContext.Provider>
  );
};

export const useSalesQuotationContext = () => {
  const context = useContext(SalesQuotationContext);
  return ensureContextAvailable(
    context,
    'useSalesQuotationContext',
    'SalesQuotationContext_Provider',
  );
};
