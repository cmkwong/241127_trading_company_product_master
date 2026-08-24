import {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { apiDelete, apiGet, apiPost } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import { ensureContextAvailable } from '../utils/contextDataUtils';

export const MasterContext = createContext();

const DEFAULT_MASTER_API_BASE =
  'http://localhost:3001/api/v1/trade_business/master';
const DEFAULT_TABLE_NAMES = [
  'master_address_types',
  'master_capacity_types',
  'master_categories',
  'master_certificate_types',
  'master_color_types',
  'master_contact_types',
  'master_keywords',
  'master_packing_types',
  'master_packing_reliability_types',
  'master_product_image_types',
  'master_product_name_types',
  'master_product_status',
  'master_service_images',
  'master_services',
  'master_size_types',
  'master_supplier_link_types',
  'master_supplier_types',
  'master_customer_types',
  'master_customer_image_types',
  'master_customer_name_types',
  'master_currencies',
  'master_company_info',
  'master_incoterms',
  'master_invoice_types',
  'master_shipping_method',
  'master_exchange_rate_hkd',
  'master_product_attributes',
  'master_product_attribute_dropdown',
  'master_product_category_attribute_assign',
  'master_selling_unit_types',
  'master_product_logistics_attributes',
  'master_product_customization_options',
];

const TABLE_INITIAL_DATA = {
  master_address_types: [],
  master_capacity_types: [],
  master_categories: [],
  master_certificate_types: [],
  master_color_types: [],
  master_contact_types: [],
  master_keywords: [],
  master_packing_types: [],
  master_packing_reliability_types: [],
  master_product_image_types: [],
  master_product_name_types: [],
  master_product_status: [],
  master_service_images: [],
  master_services: [],
  master_size_types: [],
  master_supplier_link_types: [],
  master_supplier_types: [],
  master_customer_types: [],
  master_customer_image_types: [],
  master_customer_name_types: [],
  master_currencies: [],
  master_company_info: [],
  master_incoterms: [],
  master_invoice_types: [],
  master_shipping_method: [],
  master_exchange_rate_hkd: [],
  master_product_attributes: [],
  master_product_attribute_dropdown: [],
  master_product_category_attribute_assign: [],
  master_selling_unit_types: [],
  master_product_logistics_attributes: [],
  master_product_customization_options: [],
};

const LEGACY_TABLE_BINDINGS = [
  {
    tableName: 'master_address_types',
    getName: 'getAddressTypes',
    updateName: 'updateAddressTypes',
    addName: 'addAddressType',
    removeName: 'removeAddressType',
  },
  {
    tableName: 'master_capacity_types',
    getName: 'getCapacityTypes',
    updateName: 'updateCapacityTypes',
    addName: 'addCapacityType',
    removeName: 'removeCapacityType',
  },
  {
    tableName: 'master_product_name_types',
    getName: 'getProductNameTypes',
    updateName: 'updateProductNameTypes',
    addName: 'addProductNameType',
    removeName: 'removeProductNameType',
  },
  {
    tableName: 'master_product_status',
    getName: 'getProductStatus',
    updateName: 'updateProductStatus',
    addName: 'addProductStatus',
    removeName: 'removeProductStatus',
  },
  {
    tableName: 'master_categories',
    getName: 'getCategories',
    updateName: 'updateCategories',
    addName: 'addCategory',
    removeName: 'removeCategory',
  },
  {
    tableName: 'master_supplier_types',
    getName: 'getSupplierTypes',
    updateName: 'updateSupplierTypes',
    addName: 'addSupplierType',
    removeName: 'removeSupplierType',
  },
  {
    tableName: 'master_customer_types',
    getName: 'getCustomerTypes',
    updateName: 'updateCustomerTypes',
    addName: 'addCustomerType',
    removeName: 'removeCustomerType',
  },
  {
    tableName: 'master_packing_types',
    getName: 'getPackTypes',
    updateName: 'updatePackTypes',
    addName: 'addPackType',
    removeName: 'removePackType',
  },
  {
    tableName: 'master_certificate_types',
    getName: 'getCertTypes',
    updateName: 'updateCertTypes',
    addName: 'addCertType',
    removeName: 'removeCertType',
  },
  {
    tableName: 'master_color_types',
    getName: 'getColorTypes',
    updateName: 'updateColorTypes',
    addName: 'addColorType',
    removeName: 'removeColorType',
  },
  {
    tableName: 'master_contact_types',
    getName: 'getContactTypes',
    updateName: 'updateContactTypes',
    addName: 'addContactType',
    removeName: 'removeContactType',
  },
  {
    tableName: 'master_customer_image_types',
    getName: 'getCustomerImageTypes',
    updateName: 'updateCustomerImageTypes',
    addName: 'addCustomerImageType',
    removeName: 'removeCustomerImageType',
  },
  {
    tableName: 'master_customer_name_types',
    getName: 'getCustomerNameTypes',
    updateName: 'updateCustomerNameTypes',
    addName: 'addCustomerNameType',
    removeName: 'removeCustomerNameType',
  },
  {
    tableName: 'master_product_image_types',
    getName: 'getProductImageTypes',
    updateName: 'updateProductImageTypes',
    addName: 'addProductImageType',
    removeName: 'removeProductImageType',
  },
  {
    tableName: 'master_packing_reliability_types',
    getName: 'getPackingReliabilityTypes',
    updateName: 'updatePackingReliabilityTypes',
    addName: 'addPackingReliabilityType',
    removeName: 'removePackingReliabilityType',
  },
  {
    tableName: 'master_service_images',
    getName: 'getServiceImages',
    updateName: 'updateServiceImages',
    addName: 'addServiceImage',
    removeName: 'removeServiceImage',
  },
  {
    tableName: 'master_services',
    getName: 'getServices',
    updateName: 'updateServices',
    addName: 'addService',
    removeName: 'removeService',
  },
  {
    tableName: 'master_size_types',
    getName: 'getSizeTypes',
    updateName: 'updateSizeTypes',
    addName: 'addSizeType',
    removeName: 'removeSizeType',
  },
  {
    tableName: 'master_supplier_link_types',
    getName: 'getSupplierLinkTypes',
    updateName: 'updateSupplierLinkTypes',
    addName: 'addSupplierLinkType',
    removeName: 'removeSupplierLinkType',
  },
  {
    tableName: 'master_keywords',
    getName: 'getProductKeywords',
    updateName: 'updateProductKeywords',
    addName: 'addProductKeyword',
    removeName: 'removeProductKeyword',
  },
  {
    tableName: 'master_currencies',
    getName: 'getCurrencies',
    updateName: 'updateCurrencies',
    addName: 'addCurrency',
    removeName: 'removeCurrency',
  },
  {
    tableName: 'master_incoterms',
    getName: 'getIncoterms',
    updateName: 'updateIncoterms',
    addName: 'addIncoterm',
    removeName: 'removeIncoterm',
  },
  {
    tableName: 'master_invoice_types',
    getName: 'getInvoiceTypes',
    updateName: 'updateInvoiceTypes',
    addName: 'addInvoiceType',
    removeName: 'removeInvoiceType',
  },
  {
    tableName: 'master_shipping_method',
    getName: 'getShippingMethods',
    updateName: 'updateShippingMethods',
    addName: 'addShippingMethod',
    removeName: 'removeShippingMethod',
  },
  {
    tableName: 'master_exchange_rate_hkd',
    getName: 'getExchangeRateHkd',
    updateName: 'updateExchangeRateHkd',
    addName: 'addExchangeRateHkd',
    removeName: 'removeExchangeRateHkd',
  },
  {
    tableName: 'master_product_attributes',
    getName: 'getProductAttributes',
    updateName: 'updateProductAttributes',
    addName: 'addProductAttribute',
    removeName: 'removeProductAttribute',
  },
  {
    tableName: 'master_product_attribute_dropdown',
    getName: 'getProductAttributeDropdowns',
    updateName: 'updateProductAttributeDropdowns',
    addName: 'addProductAttributeDropdown',
    removeName: 'removeProductAttributeDropdown',
  },
  {
    tableName: 'master_product_category_attribute_assign',
    getName: 'getProductCategoryAttributeAssigns',
    updateName: 'updateProductCategoryAttributeAssigns',
    addName: 'addProductCategoryAttributeAssign',
    removeName: 'removeProductCategoryAttributeAssign',
  },
  {
    tableName: 'master_selling_unit_types',
    getName: 'getSellingUnitTypes',
    updateName: 'updateSellingUnitTypes',
    addName: 'addSellingUnitType',
    removeName: 'removeSellingUnitType',
  },
  {
    tableName: 'master_product_logistics_attributes',
    getName: 'getProductLogisticsAttributes',
    updateName: 'updateProductLogisticsAttributes',
    addName: 'addProductLogisticsAttribute',
    removeName: 'removeProductLogisticsAttribute',
  },
  {
    tableName: 'master_product_customization_options',
    getName: 'getProductCustomizationOptions',
    updateName: 'updateProductCustomizationOptions',
    addName: 'addProductCustomizationOption',
    removeName: 'removeProductCustomizationOption',
  },
];

const MASTER_TABLE_STORAGE_PREFIX = 'trade_business_master_table:';
const MASTER_TABLE_FETCHED_AT_PREFIX =
  'trade_business_master_table_fetched_at:';
const MASTER_TABLE_STALE_MS = 10 * 60 * 1000; // 10 minutes
const MASTER_FETCH_CONCURRENCY = 5;

const readStoredMasterData = (tableNames = []) => {
  const result = {};
  for (const tableName of tableNames) {
    try {
      const raw = window.localStorage.getItem(
        `${MASTER_TABLE_STORAGE_PREFIX}${tableName}`,
      );
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        result[tableName] = parsed;
      }
    } catch {
      // Ignore per-table read failures.
    }
  }
  return result;
};

const persistMasterTable = (tableName, rows) => {
  try {
    if (!Array.isArray(rows)) {
      window.localStorage.removeItem(
        `${MASTER_TABLE_STORAGE_PREFIX}${tableName}`,
      );
      return;
    }
    window.localStorage.setItem(
      `${MASTER_TABLE_STORAGE_PREFIX}${tableName}`,
      JSON.stringify(rows),
    );
  } catch {
    // Ignore storage failures (quota / private browsing).
  }
};

const readMasterTableFetchedAt = (tableName) => {
  try {
    const raw = window.localStorage.getItem(
      `${MASTER_TABLE_FETCHED_AT_PREFIX}${tableName}`,
    );
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
};

const persistMasterTableFetchedAt = (tableName, timestamp) => {
  try {
    window.localStorage.setItem(
      `${MASTER_TABLE_FETCHED_AT_PREFIX}${tableName}`,
      String(timestamp),
    );
  } catch {
    // Ignore storage failures.
  }
};

const runWithConcurrency = async (items, limit, worker) => {
  const results = new Array(items.length);
  let index = 0;

  const runner = async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      try {
        results[current] = await worker(items[current]);
      } catch (error) {
        results[current] = { status: 'rejected', reason: error };
      }
    }
  };

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, runner));
  return results;
};

export const MasterContext_Provider = ({ children }) => {
  const { token } = useAuthContext();
  const [masterDataMap, setMasterDataMap] = useState(() => ({
    ...TABLE_INITIAL_DATA,
    ...readStoredMasterData(DEFAULT_TABLE_NAMES),
  }));

  const isMissingTableError = useCallback((error) => {
    const message = String(error?.message || '');
    return (
      /ER_NO_SUCH_TABLE/i.test(message) || /doesn't\s+exist/i.test(message)
    );
  }, []);

  const refreshInFlightRef = useRef(false);

  const category = masterDataMap.master_categories || [];
  const productKeywords = masterDataMap.master_keywords || [];
  const certType = masterDataMap.master_certificate_types || [];
  const colorType = masterDataMap.master_color_types || [];
  const addressType = masterDataMap.master_address_types || [];
  const capacityType = masterDataMap.master_capacity_types || [];
  const contactType = masterDataMap.master_contact_types || [];
  const customerImageType = masterDataMap.master_customer_image_types || [];
  const customerNameType = masterDataMap.master_customer_name_types || [];
  const packingReliabilityType =
    masterDataMap.master_packing_reliability_types || [];
  const productNameType = masterDataMap.master_product_name_types || [];
  const productStatus = masterDataMap.master_product_status || [];
  const serviceImages = masterDataMap.master_service_images || [];
  const services = masterDataMap.master_services || [];
  const sizeType = masterDataMap.master_size_types || [];
  const supplierLinkType = masterDataMap.master_supplier_link_types || [];
  const supplierType = masterDataMap.master_supplier_types || [];
  const customerType = masterDataMap.master_customer_types || [];
  const packType = masterDataMap.master_packing_types || [];
  const currencies = masterDataMap.master_currencies || [];
  const companyInfo = masterDataMap.master_company_info || [];
  const incoterms = masterDataMap.master_incoterms || [];
  const shippingMethods = masterDataMap.master_shipping_method || [];
  const exchangeRateHkd = masterDataMap.master_exchange_rate_hkd || [];
  const productImageType = masterDataMap.master_product_image_types || [];
  const sellingUnitType = masterDataMap.master_selling_unit_types || [];
  const productLogisticsAttributes =
    masterDataMap.master_product_logistics_attributes || [];
  const productCustomizationOptions =
    masterDataMap.master_product_customization_options || [];

  const getMasterTableData = useCallback(
    (tableName) => {
      if (!tableName || typeof tableName !== 'string') {
        return [];
      }
      return masterDataMap[tableName] || [];
    },
    [masterDataMap],
  );

  const updateLocalMasterTableData = useCallback((tableName, items) => {
    setMasterDataMap((prev) => ({
      ...prev,
      [tableName]: Array.isArray(items) ? items : [],
    }));
  }, []);

  const addLocalMasterTableData = useCallback((tableName, item) => {
    setMasterDataMap((prev) => ({
      ...prev,
      [tableName]: [...(prev[tableName] || []), item],
    }));
  }, []);

  const removeLocalMasterTableData = useCallback((tableName, matcher) => {
    setMasterDataMap((prev) => ({
      ...prev,
      [tableName]: (prev[tableName] || []).filter((item) =>
        typeof matcher === 'function' ? !matcher(item) : item !== matcher,
      ),
    }));
  }, []);

  const fetchMasterData = useCallback(
    async (tableName) => {
      let response = null;

      response = await apiGet(`${DEFAULT_MASTER_API_BASE}/rows`, {
        ...(token ? { token } : {}),
        ...(tableName ? { params: { tableName } } : {}),
      });

      const payload = response?.results ?? response?.data?.results ?? [];

      const normalizedData = Array.isArray(payload) ? payload : [];

      updateLocalMasterTableData(tableName, normalizedData);
      persistMasterTable(tableName, normalizedData);
      persistMasterTableFetchedAt(tableName, Date.now());

      return normalizedData;
    },
    [token, updateLocalMasterTableData],
  );

  const updateMasterTableData = useCallback(
    async (tableName, data) => {
      if (!tableName || typeof tableName !== 'string') {
        throw new Error('updateMasterTableData requires a valid tableName');
      }

      const endpoint = `${DEFAULT_MASTER_API_BASE}/rows`;
      const rows = Array.isArray(data) ? data : [data];
      const response = await apiPost(
        endpoint,
        {
          data: {
            [tableName]: rows,
          },
        },
        {
          ...(token ? { token } : {}),
        },
      );

      await fetchMasterData(tableName);
      return response;
    },
    [fetchMasterData, token],
  );

  const deleteMasterTableData = useCallback(
    async (tableName, rowsOrIds) => {
      if (!tableName || typeof tableName !== 'string') {
        throw new Error('deleteMasterTableData requires a valid tableName');
      }

      const normalizedRows = (
        Array.isArray(rowsOrIds) ? rowsOrIds : [rowsOrIds]
      )
        .map((item) => {
          if (typeof item === 'string') {
            return { id: item };
          }
          if (item && typeof item === 'object' && item.id) {
            return { id: item.id };
          }
          return null;
        })
        .filter(Boolean);

      if (normalizedRows.length === 0) {
        return null;
      }

      const endpoint = `${DEFAULT_MASTER_API_BASE}/rows`;
      const response = await apiDelete(endpoint, {
        ...(token ? { token } : {}),
        body: {
          data: {
            [tableName]: normalizedRows,
          },
        },
      });

      await fetchMasterData(tableName);
      return response;
    },
    [fetchMasterData, token],
  );

  const fetchMasterTableSchema = useCallback(
    async (tableName) => {
      if (!tableName || typeof tableName !== 'string') {
        throw new Error('fetchMasterTableSchema requires a valid tableName');
      }

      const endpointCandidates = [
        `${DEFAULT_MASTER_API_BASE}/schema/${tableName}`,
        `${DEFAULT_MASTER_API_BASE}/${tableName}/schema`,
      ];

      let lastError = null;

      for (const endpoint of endpointCandidates) {
        try {
          const response = await apiGet(endpoint, {
            ...(token ? { token } : {}),
          });
          return response?.schema || response?.data?.schema || null;
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError || new Error('Failed to fetch master table schema');
    },
    [token],
  );

  const refreshTables = useCallback(
    async (tableNames) => {
      if (refreshInFlightRef.current) return;
      refreshInFlightRef.current = true;

      try {
        const results = await runWithConcurrency(
          tableNames,
          MASTER_FETCH_CONCURRENCY,
          async (tableName) => {
            await fetchMasterData(tableName);
            return tableName;
          },
        );

        results.forEach((entry, index) => {
          if (
            entry &&
            entry.status === 'rejected' &&
            !isMissingTableError(entry.reason)
          ) {
            console.error(
              `Failed to refresh master table ${tableNames[index]}:`,
              entry.reason,
            );
          }
        });
      } finally {
        refreshInFlightRef.current = false;
      }
    },
    [fetchMasterData, isMissingTableError],
  );

  // Stale-while-revalidate: only background-refresh tables whose cache is stale.
  const refreshAllMasterData = useCallback(async () => {
    const now = Date.now();
    const staleTableNames = DEFAULT_TABLE_NAMES.filter(
      (tableName) =>
        now - readMasterTableFetchedAt(tableName) >= MASTER_TABLE_STALE_MS,
    );

    if (staleTableNames.length === 0) return;

    await refreshTables(staleTableNames);
  }, [refreshTables]);

  // Manual refresh: always re-fetch every master table.
  const forceRefreshAllMasterData = useCallback(async () => {
    await refreshTables(DEFAULT_TABLE_NAMES);
  }, [refreshTables]);

  useEffect(() => {
    refreshAllMasterData();
  }, [refreshAllMasterData]);

  // getting the id or label
  const getRequiredData = useCallback((id, label, masterData) => {
    // get label by id
    if (id && !label) {
      const foundItem = masterData.find((item) => item.id === id);
      return foundItem ? (foundItem.label ?? foundItem.name) : null;
    }
    // get id by label
    if (!id && label) {
      const foundItem = masterData.find(
        (item) => (item.label ?? item.name) === label,
      );
      return foundItem ? foundItem.id : null;
    }
    // get all data
    return masterData;
  }, []);

  const legacyMethods = useMemo(
    () =>
      LEGACY_TABLE_BINDINGS.reduce((acc, binding) => {
        const { tableName, getName, updateName, addName, removeName } = binding;

        acc[getName] = (id, label) => {
          return getRequiredData(id, label, getMasterTableData(tableName));
        };

        acc[updateName] = (items) => {
          updateLocalMasterTableData(tableName, items);
        };

        acc[addName] = (item) => {
          addLocalMasterTableData(tableName, item);
        };

        acc[removeName] = (matcher) => {
          removeLocalMasterTableData(tableName, matcher);
        };

        return acc;
      }, {}),
    [
      getRequiredData,
      getMasterTableData,
      updateLocalMasterTableData,
      addLocalMasterTableData,
      removeLocalMasterTableData,
    ],
  );

  const contextValue = {
    // State
    productNameType,
    category,
    supplierType,
    supplierLinkType,
    packType,
    customerType,
    packingReliabilityType,
    certType,
    colorType,
    addressType,
    capacityType,
    contactType,
    customerImageType,
    customerNameType,
    productImageType,
    sellingUnitType,
    productLogisticsAttributes,
    productCustomizationOptions,
    productStatus,
    productKeywords,
    serviceImages,
    services,
    sizeType,
    currencies,
    companyInfo,
    incoterms,
    shippingMethods,
    exchangeRateHkd,
    masterDataMap,
    masterTableNames: DEFAULT_TABLE_NAMES,
    fetchMasterData,
    refreshAllMasterData,
    forceRefreshAllMasterData,
    fetchMasterTableSchema,
    getMasterTableData,
    updateMasterTableData,
    deleteMasterTableData,
    ...legacyMethods,
  };

  return (
    <MasterContext.Provider value={contextValue}>
      {children}
    </MasterContext.Provider>
  );
};

// Custom hook to use the MasterContext
export const useMasterContext = () => {
  const context = useContext(MasterContext);
  return ensureContextAvailable(
    context,
    'useMasterContext',
    'MasterContext_Provider',
  );
};
