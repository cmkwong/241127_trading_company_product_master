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
import { processChangesWithBase64 } from '../utils/objectUrlUtils';
import { toSafeString } from '../components/panels/SalesQuotation/utils/quotationTotals';
import { useAuthContext } from './AuthContext';
import { useGeneralContext } from './GeneralContext';

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

const DEFAULT_PURCHASE_FILE_MAPPINGS = {
  purchase_shipping_images: { url: 'image_url', base64: 'base64_image' },
  purchase_product_images: { url: 'image_url', base64: 'base64_image' },
  purchase_service_images: { url: 'image_url', base64: 'base64_image' },
  purchase_shipping_files: { url: 'file_url', base64: 'base64_file' },
  purchase_product_files: { url: 'file_url', base64: 'base64_file' },
  purchase_service_files: { url: 'file_url', base64: 'base64_file' },
};

const toArray = (value) => (Array.isArray(value) ? value : []);

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
  status: 'draft',
  remark: '',
  sales_quotation_id: '',
  supplier_id: '',
  supplier_address_id: '',
  purchase_shipping_details: [],
  purchase_product_details: [],
  purchase_service_details: [],
});

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

export const PurchaseRequestContext = createContext();

export const PurchaseRequestContext_Provider = ({ children }) => {
  const { token } = useAuthContext();
  const { resolveAuthoritativeEntityAfterSave } = useGeneralContext();

  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterSupplierTypes, setMasterSupplierTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [salesQuotations, setSalesQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [exchangeRateRows, setExchangeRateRows] = useState([]);

  const selectedIdRef = useRef('');

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

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
        setSuppliers([]);
        setProducts([]);
        setServices([]);
        setMasterCategories([]);
        setMasterSupplierTypes([]);
        setCurrencies([]);
        setSalesQuotations([]);
        setCustomers([]);
        setExchangeRateRows([]);
        return [];
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
          supplierTypesRes,
          currenciesRes,
          salesRes,
          customersRes,
          exchangeRatesRes,
        ] = await Promise.all([
          apiGet(PURCHASE_API_BASE, { token }),
          apiPost(SUPPLIERS_API_BASE, {}, { token }),
          apiPost(PRODUCTS_API_BASE, {}, { token }),
          apiGet(`${MASTER_API_BASE}/rows`, {
            token,
            params: { tableName: 'master_services' },
          }),
          apiGet(`${MASTER_API_BASE}/rows`, {
            token,
            params: { tableName: 'master_categories' },
          }),
          apiGet(`${MASTER_API_BASE}/rows`, {
            token,
            params: { tableName: 'master_supplier_types' },
          }),
          apiGet(`${MASTER_API_BASE}/rows`, {
            token,
            params: { tableName: 'master_currencies' },
          }),
          apiGet(SALES_API_BASE, { token }),
          apiGet(CUSTOMERS_API_BASE, { token }),
          apiGet(`${MASTER_API_BASE}/rows`, {
            token,
            params: { tableName: 'master_exchange_rate_hkd' },
          }),
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
        const supplierTypeRows = extractRowsFromResponse(
          supplierTypesRes,
          'master_supplier_types',
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
        setMasterSupplierTypes(supplierTypeRows);
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
          return purchaseRows;
        }

        if (purchaseRows.length > 0) {
          const firstId = toSafeString(purchaseRows[0]?.id);
          setSelectedId(firstId);
          setDraft(JSON.parse(JSON.stringify(purchaseRows[0])));
          return purchaseRows;
        }

        setSelectedId('');
        setDraft(null);
        return purchaseRows;
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Failed to load purchase requests');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  const refreshSuppliers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost(SUPPLIERS_API_BASE, {}, { token });
      const supplierRows = extractRowsFromResponse(res, 'suppliers');
      setSuppliers(supplierRows);
    } catch (err) {
      console.error('Failed to refresh suppliers:', err);
    }
  }, [token]);

  const refreshSalesQuotations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiGet(SALES_API_BASE, { token });
      const salesRows = extractRowsFromResponse(res, 'sales_quotations');
      setSalesQuotations(salesRows);
    } catch (err) {
      console.error('Failed to refresh sales quotations:', err);
    }
  }, [token]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const buildPayloadFromWorking = useCallback((workingInput) => {
    const working = workingInput || createNewPurchaseRequest();

    return stripAuditTimestamps({
      ...working,
      sales_quotation_id: toNullableId(working?.sales_quotation_id),
      supplier_address_id: toNullableId(working?.supplier_address_id),
      purchase_shipping_details: toArray(working.purchase_shipping_details)
        .filter((row) => !row?._delete)
        .map((row) => ({
          ...row,
          purchase_request_id:
            toSafeString(row?.purchase_request_id) || toSafeString(working.id),
          currency_id: toNullableId(row?.currency_id),
          purchase_shipping_images: toArray(
            row?.purchase_shipping_images,
          ).filter((image) => !image?._delete),
          purchase_shipping_files: toArray(row?.purchase_shipping_files).filter(
            (file) => !file?._delete,
          ),
        })),
      purchase_product_details: toArray(working.purchase_product_details)
        .filter((row) => !row?._delete)
        .map((row) => ({
          ...row,
          purchase_request_id:
            toSafeString(row?.purchase_request_id) || toSafeString(working.id),
          currency_id: toNullableId(row?.currency_id),
          purchase_product_images: toArray(row?.purchase_product_images).filter(
            (image) => !image?._delete,
          ),
          purchase_product_files: toArray(row?.purchase_product_files).filter(
            (file) => !file?._delete,
          ),
        })),
      purchase_service_details: toArray(working.purchase_service_details)
        .filter((row) => !row?._delete)
        .map((row) => ({
          ...row,
          purchase_request_id:
            toSafeString(row?.purchase_request_id) || toSafeString(working.id),
          supplier_id: toNullableId(row?.supplier_id),
          currency_id: toNullableId(row?.currency_id),
          purchase_service_images: toArray(row?.purchase_service_images).filter(
            (image) => !image?._delete,
          ),
          purchase_service_files: toArray(row?.purchase_service_files).filter(
            (file) => !file?._delete,
          ),
        })),
    });
  }, []);

  const buildDeletePayloadFromDiff = useCallback(
    (workingInput, existingInput) => {
      if (!existingInput) {
        return null;
      }

      const workingPayload = buildPayloadFromWorking(
        workingInput || createNewPurchaseRequest(),
      );
      const existingPayload = buildPayloadFromWorking(existingInput);

      const buildDetailDeletes = (currentRows, previousRows, fileKey) => {
        const currentById = new Map(
          toArray(currentRows)
            .map((row) => [toSafeString(row?.id), row])
            .filter(([id]) => id),
        );

        return toArray(previousRows)
          .map((previousRow) => {
            const previousId = toSafeString(previousRow?.id);
            if (!previousId) {
              return null;
            }

            const currentRow = currentById.get(previousId);
            if (!currentRow) {
              return { id: previousId };
            }

            const activeCurrentFileIds = new Set(
              toArray(currentRow?.[fileKey])
                .filter((item) => !item?._delete)
                .map((item) => toSafeString(item?.id))
                .filter(Boolean),
            );

            const removedFileRows = toArray(previousRow?.[fileKey])
              .map((item) => toSafeString(item?.id))
              .filter(Boolean)
              .filter((id) => !activeCurrentFileIds.has(id))
              .map((id) => ({ id }));

            if (removedFileRows.length === 0) {
              return null;
            }

            return {
              id: previousId,
              [fileKey]: removedFileRows,
            };
          })
          .filter(Boolean);
      };

      const mergeDetailDeleteRows = (...detailLists) => {
        const mergedById = new Map();

        detailLists.flat().forEach((row) => {
          const id = toSafeString(row?.id);
          if (!id) return;

          const previous = mergedById.get(id) || { id };
          mergedById.set(id, {
            ...previous,
            ...row,
            id,
          });
        });

        return Array.from(mergedById.values());
      };

      const purchase_shipping_details = buildDetailDeletes(
        workingPayload?.purchase_shipping_details,
        existingPayload?.purchase_shipping_details,
        'purchase_shipping_files',
      );
      const purchase_shipping_image_details = buildDetailDeletes(
        workingPayload?.purchase_shipping_details,
        existingPayload?.purchase_shipping_details,
        'purchase_shipping_images',
      );

      const purchase_product_details = buildDetailDeletes(
        workingPayload?.purchase_product_details,
        existingPayload?.purchase_product_details,
        'purchase_product_files',
      );
      const purchase_product_image_details = buildDetailDeletes(
        workingPayload?.purchase_product_details,
        existingPayload?.purchase_product_details,
        'purchase_product_images',
      );

      const purchase_service_details = buildDetailDeletes(
        workingPayload?.purchase_service_details,
        existingPayload?.purchase_service_details,
        'purchase_service_files',
      );
      const purchase_service_image_details = buildDetailDeletes(
        workingPayload?.purchase_service_details,
        existingPayload?.purchase_service_details,
        'purchase_service_images',
      );

      const mergedShippingDetails = mergeDetailDeleteRows(
        purchase_shipping_details,
        purchase_shipping_image_details,
      );
      const mergedProductDetails = mergeDetailDeleteRows(
        purchase_product_details,
        purchase_product_image_details,
      );
      const mergedServiceDetails = mergeDetailDeleteRows(
        purchase_service_details,
        purchase_service_image_details,
      );

      const rootDeleteRow = {
        id: toSafeString(existingPayload?.id || workingPayload?.id),
      };

      if (mergedShippingDetails.length > 0) {
        rootDeleteRow.purchase_shipping_details = mergedShippingDetails;
      }

      if (mergedProductDetails.length > 0) {
        rootDeleteRow.purchase_product_details = mergedProductDetails;
      }

      if (mergedServiceDetails.length > 0) {
        rootDeleteRow.purchase_service_details = mergedServiceDetails;
      }

      const hasNestedDeletePayload =
        Boolean(rootDeleteRow.purchase_shipping_details?.length) ||
        Boolean(rootDeleteRow.purchase_product_details?.length) ||
        Boolean(rootDeleteRow.purchase_service_details?.length);

      if (!rootDeleteRow.id || !hasNestedDeletePayload) {
        return null;
      }

      return {
        purchase_requests: [rootDeleteRow],
      };
    },
    [buildPayloadFromWorking],
  );

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

    const normalizedDraftPayload = buildPayloadFromWorking(draft);
    const normalizedPayloadId = toSafeString(normalizedDraftPayload?.id);
    const existingRow = toArray(rows).find(
      (row) => toSafeString(row?.id) === normalizedPayloadId,
    );
    const exists = Boolean(existingRow);

    const normalizedPayload = buildPayloadFromWorking(draft);
    const deletePayload = exists
      ? buildDeletePayloadFromDiff(draft, existingRow)
      : null;

    if (exists) {
      const normalizedExisting = buildPayloadFromWorking(existingRow);
      const noChanges =
        JSON.stringify(normalizedExisting) ===
        JSON.stringify(normalizedPayload);

      if (noChanges) {
        if (deletePayload) {
          return {
            endpoint: `${PURCHASE_API_BASE}/ids`,
            method: 'PATCH + DELETE',
            create: {},
            update: { purchase_requests: [normalizedPayload] },
            delete: deletePayload,
            payload: {
              data: {
                purchase_requests: [normalizedPayload],
              },
            },
          };
        }

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
      method:
        exists && deletePayload ? 'PATCH + DELETE' : exists ? 'PATCH' : 'POST',
      create: exists ? {} : { purchase_requests: [payload] },
      update: exists ? { purchase_requests: [payload] } : {},
      delete: deletePayload || {},
      payload: {
        data: {
          purchase_requests: [payload],
        },
      },
    };
  }, [buildDeletePayloadFromDiff, buildPayloadFromWorking, draft, rows]);

  const handleSave = useCallback(async () => {
    if (!token || !draft) return;

    setError('');

    try {
      const existingRow = rows.find(
        (row) => toSafeString(row?.id) === toSafeString(draft?.id),
      );
      const payload = await buildPayloadWithBase64(draft);
      const exists = Boolean(existingRow);
      const deletePayload = exists
        ? buildDeletePayloadFromDiff(draft, existingRow)
        : null;

      if (exists) {
        if (deletePayload) {
          await apiDelete(`${PURCHASE_API_BASE}/ids`, {
            token,
            body: { data: deletePayload },
          });
        }

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

      await resolveAuthoritativeEntityAfterSave({
        refreshList: () => refreshAll(payload?.id),
        targetId: payload?.id || draft?.id,
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to save purchase request');
      throw err;
    }
  }, [
    buildDeletePayloadFromDiff,
    buildPayloadWithBase64,
    draft,
    refreshAll,
    resolveAuthoritativeEntityAfterSave,
    rows,
    token,
  ]);

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

  const handleCreate = useCallback(() => {
    const fresh = createNewPurchaseRequest();
    setDraft(fresh);
    setSelectedId('');
    setError('');
    setNotice('New purchase request draft created');
  }, []);

  const contextValue = useMemo(
    () => ({
      rows,
      setRows,
      selectedId,
      setSelectedId,
      draft,
      setDraft,
      error,
      setError,
      notice,
      setNotice,
      isLoading,
      isDeleting,
      suppliers,
      products,
      services,
      masterCategories,
      masterSupplierTypes,
      currencies,
      salesQuotations,
      customers,
      exchangeRateRows,
      createNewPurchaseRequest,
      handleSelectRow,
      refreshAll,
      refreshSuppliers,
      refreshSalesQuotations,
      handleCreate,
      getPurchaseRequestDryRunData,
      handleSave,
      handleDelete,
    }),
    [
      rows,
      selectedId,
      draft,
      error,
      notice,
      isLoading,
      isDeleting,
      suppliers,
      products,
      services,
      masterCategories,
      masterSupplierTypes,
      currencies,
      salesQuotations,
      customers,
      exchangeRateRows,
      handleSelectRow,
      refreshAll,
      refreshSuppliers,
      refreshSalesQuotations,
      handleCreate,
      getPurchaseRequestDryRunData,
      handleSave,
      handleDelete,
    ],
  );

  return (
    <PurchaseRequestContext.Provider value={contextValue}>
      {children}
    </PurchaseRequestContext.Provider>
  );
};

export const usePurchaseRequestContext = () => {
  const context = useContext(PurchaseRequestContext);

  if (!context) {
    throw new Error(
      'usePurchaseRequestContext must be used within a PurchaseRequestContext_Provider',
    );
  }

  return context;
};
