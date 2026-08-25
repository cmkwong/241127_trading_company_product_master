import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  releaseObjectUrls,
  recursiveProcess_base64_to_objectUrl,
  processChangesWithBase64,
} from '../utils/objectUrlUtils';
import {
  normalizeStructuredTableResponse,
  buildNestedChangedData,
  cleanupNestedInternalFlags,
  canProceedAndDiscardUnsavedChanges,
  getEffectiveComparisonKeys,
  mergeEntityIntoStateList,
  generateNextSegmentedCode,
  ensureContextAvailable,
} from '../utils/contextDataUtils';
import { apiGet, apiPatch, apiDelete, apiPost } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import { useGeneralContext } from './GeneralContext';
import { getEntityRecord, setEntityRecord } from './GeneralContext';
import {
  readJson,
  stripBlobUrls,
  writeJson,
} from '../utils/TanStackUtils/listCache';
import { v4 as uuidv4 } from 'uuid';

// Thin supplier-scoped shims so internal call sites keep working while the
// record now lives in the generic entity store (key 'supplier').
const getPageData = () => getEntityRecord('supplier');
const setPageData = (valueOrUpdater) =>
  setEntityRecord('supplier', valueOrUpdater);

export const SupplierContext = createContext();

const SUPPLIERS_LIST_STORAGE_KEY = 'trade_business_suppliers_list';

const readStoredSuppliers = () =>
  readJson(SUPPLIERS_LIST_STORAGE_KEY, { suppliers: [] });

const persistSuppliers = (suppliersState) => {
  writeJson(
    SUPPLIERS_LIST_STORAGE_KEY,
    stripBlobUrls({ suppliers: suppliersState?.suppliers ?? [] }),
  );
};

export const SupplierContext_Provider = ({ children, initialData = {} }) => {
  const { token } = useAuthContext();
  const { fileMappings, isFileMappingsLoading } = useGeneralContext();
  const [originalPageData, setOriginalPageData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [suppliers, setSuppliers] = useState(readStoredSuppliers);
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [comparisonKeys, setComparisonKeys] = useState([]);
  const objectUrlRegistryRef = useRef([]);
  const pageDataUrlRegistryRef = useRef([]);
  const hasInitialFetchRef = useRef(false);
  const hasFetchedWithMappingsRef = useRef(false);
  const suppliersFetchSequenceRef = useRef(0);

  // Seed the external store with the initial data (once).
  useEffect(() => {
    if (!getPageData()?.id && initialData?.id) {
      setPageData(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supplierBase64Config = useMemo(
    () => fileMappings || {},
    [fileMappings],
  );

  // Extracted function to fetch suppliers
  const doFetchSuppliers = useCallback(async () => {
    const fetchSequence = ++suppliersFetchSequenceRef.current;
    const hasMappings = Object.keys(supplierBase64Config || {}).length > 0;

    if (!token) {
      setSuppliers({ suppliers: [] });
      return;
    }

    setIsSuppliersLoading(true);
    try {
      const response = await apiPost(
        'http://localhost:3001/api/v1/trade_business/suppliers/data/list',
        {
          includeBase64: true,
          compress: true,
        },
        {
          token,
        },
      );

      const rawData = normalizeStructuredTableResponse(response, 'suppliers');

      releaseObjectUrls(objectUrlRegistryRef.current);
      const urlRegistry = [];

      const processedSuppliers = recursiveProcess_base64_to_objectUrl(
        rawData,
        'root',
        supplierBase64Config,
        urlRegistry,
      );

      // Ignore stale responses (e.g., non-mapping fetch finishing after mapping fetch)
      if (fetchSequence !== suppliersFetchSequenceRef.current) {
        releaseObjectUrls(urlRegistry);
        return;
      }

      setSuppliers(processedSuppliers || { suppliers: [] });
      persistSuppliers(processedSuppliers || { suppliers: [] });
      objectUrlRegistryRef.current = urlRegistry;
      hasFetchedWithMappingsRef.current = hasMappings;
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      setSuppliers({ suppliers: [] });
    } finally {
      setIsSuppliersLoading(false);
    }
  }, [token, supplierBase64Config]);

  // Extracted function to fetch comparison keys
  const doFetchComparisonKeys = useCallback(async () => {
    if (!token) {
      setComparisonKeys([]);
      return;
    }

    try {
      const response = await apiGet(
        'http://localhost:3001/api/v1/trade_business/suppliers/data/comparison-keys',
        { token },
      );

      const keys = response?.data?.firstLevelKeys;
      setComparisonKeys(Array.isArray(keys) ? keys : []);
    } catch (error) {
      console.error('Failed to fetch supplier comparison keys:', error);
      setComparisonKeys([]);
    }
  }, [token]);

  // Public method to manually refresh all supplier data
  const refreshSupplierList = useCallback(async () => {
    await doFetchSuppliers();
    await doFetchComparisonKeys();
  }, [doFetchSuppliers, doFetchComparisonKeys]);

  useEffect(() => {
    if (isFileMappingsLoading) {
      return;
    }

    if (!token) {
      setSuppliers({ suppliers: [] });
      setPageData({});
      setSelectedSupplierId(null);
      hasInitialFetchRef.current = false;
      hasFetchedWithMappingsRef.current = false;
      return;
    }

    const hasMappings = Object.keys(supplierBase64Config || {}).length > 0;
    const shouldRefetchWithMappings =
      hasMappings && !hasFetchedWithMappingsRef.current;

    // Only fetch once per token to prevent re-fetching on tab switches
    if (!hasInitialFetchRef.current || shouldRefetchWithMappings) {
      doFetchSuppliers();
      doFetchComparisonKeys();
      hasInitialFetchRef.current = true;
    }

    return () => {
      releaseObjectUrls(objectUrlRegistryRef.current);
      objectUrlRegistryRef.current = [];
      releaseObjectUrls(pageDataUrlRegistryRef.current);
      pageDataUrlRegistryRef.current = [];
    };
  }, [
    token,
    isFileMappingsLoading,
    supplierBase64Config,
    doFetchSuppliers,
    doFetchComparisonKeys,
  ]);

  const effectiveComparisonKeys = useCallback(() => {
    return getEffectiveComparisonKeys({
      comparisonKeys,
      pageData: getPageData(),
    });
  }, [comparisonKeys]);

  const getChangedData = useCallback(() => {
    return buildNestedChangedData({
      pageData: getPageData(),
      originalPageData,
      comparisonKeys: effectiveComparisonKeys(),
      rootTableName: 'suppliers',
      base64Config: supplierBase64Config,
    });
  }, [originalPageData, effectiveComparisonKeys, supplierBase64Config]);

  const isDataUnchanged = useCallback(() => {
    return getChangedData() === null;
  }, [getChangedData]);

  const discardCurrentSupplierUnsavedChanges = useCallback(() => {
    const current = getPageData();
    if (
      originalPageData &&
      String(originalPageData?.id || '').trim() ===
        String(current?.id || '').trim()
    ) {
      setPageData(JSON.parse(JSON.stringify(originalPageData)));
      return;
    }

    setPageData({});
  }, [originalPageData]);

  const getSupplierSaveDryRunData = useCallback(() => {
    const changesResult = getChangedData();
    const current = getPageData();
    const preview = {
      endpoint:
        'http://localhost:3001/api/v1/trade_business/suppliers/data/ids',
      method: 'PATCH + DELETE',
      create: {},
      update: {},
      delete: {},
    };

    if (!changesResult) {
      return {
        ...preview,
        message: 'No changes detected',
      };
    }

    const isRootCreate =
      !originalPageData || originalPageData.id !== current.id;

    if (changesResult?.changes?.suppliers) {
      if (isRootCreate) {
        preview.create.suppliers = changesResult.changes.suppliers;
      } else {
        preview.update.suppliers = changesResult.changes.suppliers;
      }
    }

    if (changesResult?.deletions) {
      preview.delete = changesResult.deletions;
    }

    return preview;
  }, [getChangedData, originalPageData]);

  const getSupplierData = useCallback(
    (id) => {
      const current = getPageData();
      const canSwitch = canProceedAndDiscardUnsavedChanges({
        hasRecordId: !!current.id,
        isDataUnchanged: isDataUnchanged(),
        onDiscard: discardCurrentSupplierUnsavedChanges,
      });

      if (!canSwitch) {
        return false;
      }

      (async () => {
        setIsSuppliersLoading(true);
        try {
          const requestBody = {
            includeBase64: true,
            compress: true,
            data: {
              suppliers: [
                {
                  id,
                },
              ],
            },
          };

          const response = await apiPost(
            'http://localhost:3001/api/v1/trade_business/suppliers/data/get/ids',
            requestBody,
            {
              token,
            },
          );

          const rawData = normalizeStructuredTableResponse(
            response,
            'suppliers',
          );

          releaseObjectUrls(pageDataUrlRegistryRef.current);
          const urlRegistry = [];

          const processed = recursiveProcess_base64_to_objectUrl(
            rawData,
            'root',
            supplierBase64Config,
            urlRegistry,
          );

          const supplier =
            processed?.suppliers?.[0] || rawData?.suppliers?.[0] || null;
          if (supplier) {
            setSelectedSupplierId(id);
            setPageData(supplier);
            setOriginalPageData(JSON.parse(JSON.stringify(supplier)));
            pageDataUrlRegistryRef.current = urlRegistry;
          }
        } catch (error) {
          console.error('Failed to fetch supplier by id:', error);
        } finally {
          setIsSuppliersLoading(false);
        }
      })();

      return true;
    },
    [
      isDataUnchanged,
      token,
      supplierBase64Config,
      discardCurrentSupplierUnsavedChanges,
    ],
  );

  const getAllSuppliers = useCallback(() => {
    return suppliers.suppliers || [];
  }, [suppliers]);

  const updateSuppliers = useCallback((newSuppliersList) => {
    setSuppliers((prevState) => ({
      ...prevState,
      suppliers: newSuppliersList,
    }));
  }, []);

  const _cleanupFlags = useCallback((obj) => {
    return cleanupNestedInternalFlags(obj);
  }, []);

  const handleSupplierSave = useCallback(
    async (externalSaveCallback = null) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const current = getPageData();
        const changesResult = getChangedData();

        if (changesResult) {
          const { changes, deletions } = changesResult;

          if (deletions) {
            await apiDelete(
              'http://localhost:3001/api/v1/trade_business/suppliers/data/ids',
              {
                token,
                body: { data: deletions },
              },
            );
          }

          if (changes) {
            const processedChanges = await processChangesWithBase64(
              changes,
              supplierBase64Config,
            );

            await apiPatch(
              'http://localhost:3001/api/v1/trade_business/suppliers/data/ids',
              { data: processedChanges },
              { token },
            );
          }
        }

        if (typeof externalSaveCallback === 'function') {
          await externalSaveCallback(current);
        }

        if (current.id) {
          const cleanedPageData = _cleanupFlags(current);
          const savedSupplierData = JSON.parse(JSON.stringify(cleanedPageData));

          setPageData(cleanedPageData);
          setOriginalPageData(savedSupplierData);

          setSuppliers((prevSuppliersState) => {
            const nextState = mergeEntityIntoStateList({
              prevState: prevSuppliersState,
              listKey: 'suppliers',
              entity: savedSupplierData,
            });
            persistSuppliers(nextState);
            return nextState;
          });
        }

        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);

        return true;
      } catch (error) {
        console.error('Error saving supplier data:', error);
        setSaveError(error.message || 'Failed to save supplier data');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [getChangedData, token, _cleanupFlags, supplierBase64Config],
  );

  const deleteSupplierById = useCallback(
    async (id) => {
      const supplierId = String(id || '').trim();
      if (!supplierId) {
        throw new Error('Supplier ID is required for deletion');
      }

      await apiDelete(
        'http://localhost:3001/api/v1/trade_business/suppliers/data/ids',
        {
          token,
          body: {
            data: {
              suppliers: [{ id: supplierId }],
            },
          },
        },
      );

      setSuppliers((prevState) => {
        const nextState = {
          ...prevState,
          suppliers: (prevState?.suppliers || []).filter(
            (item) => String(item?.id || '').trim() !== supplierId,
          ),
        };
        persistSuppliers(nextState);
        return nextState;
      });

      setSelectedSupplierId((prevSelectedId) => {
        return String(prevSelectedId || '').trim() === supplierId
          ? null
          : prevSelectedId;
      });

      if (String(getPageData()?.id || '').trim() === supplierId) {
        releaseObjectUrls(pageDataUrlRegistryRef.current);
        pageDataUrlRegistryRef.current = [];
        setPageData({});
        setOriginalPageData({});
      }

      return true;
    },
    [token],
  );

  const generateNextSupplierCode = useCallback(() => {
    const supplierList = Array.isArray(suppliers?.suppliers)
      ? suppliers.suppliers
      : [];

    return generateNextSegmentedCode({
      items: supplierList,
      getCode: (supplier) => supplier?.supplier_code || supplier?.code || '',
      prefix: 'S',
      segmentLength: 4,
    });
  }, [suppliers]);

  const createNewSupplier = useCallback(() => {
    const current = getPageData();
    const canCreate = canProceedAndDiscardUnsavedChanges({
      hasRecordId: !!current.id,
      isDataUnchanged: isDataUnchanged(),
      onDiscard: discardCurrentSupplierUnsavedChanges,
    });

    if (!canCreate) {
      return false;
    }

    const newSupplierCode = generateNextSupplierCode();
    const newSupplierId = uuidv4();

    setPageData({
      id: newSupplierId,
      code: newSupplierCode,
      supplier_code: newSupplierCode,
      score: 1,
      supplier_types: [],
      supplier_addresses: [],
      supplier_contacts: [],
      supplier_links: [],
      supplier_services: [],
    });
    setSelectedSupplierId(newSupplierId);

    return true;
  }, [
    isDataUnchanged,
    generateNextSupplierCode,
    discardCurrentSupplierUnsavedChanges,
  ]);

  const getAllData = useCallback(() => {
    return getPageData();
  }, []);

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        getSupplierData,
        getAllSuppliers,
        updateSuppliers,
        refreshSupplierList,
        handleSupplierSave,
        createNewSupplier,
        deleteSupplierById,
        getAllData,
        isSaving,
        saveSuccess,
        saveError,
        isSuppliersLoading,
        isDataUnchanged,
        getChangedData,
        getSupplierSaveDryRunData,
        selectedSupplierId,
        setSelectedSupplierId,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSupplierContext = () => {
  const context = useContext(SupplierContext);
  return ensureContextAvailable(
    context,
    'useSupplierContext',
    'SupplierContext_Provider',
  );
};
