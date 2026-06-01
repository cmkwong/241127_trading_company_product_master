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
  validateNestedDataObject,
  mergeEntityIntoStateList,
  generateNextSegmentedCode,
  ensureContextAvailable,
} from '../utils/contextDataUtils';
import { upsertNestedData } from '../utils/crudObj';
import { apiGet, apiPatch, apiDelete, apiPost } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import { useGeneralContext } from './GeneralContext';
import { v4 as uuidv4 } from 'uuid';

export const SupplierContext = createContext();

export const SupplierContext_Provider = ({ children, initialData = {} }) => {
  const { token } = useAuthContext();
  const { fileMappings, isFileMappingsLoading } = useGeneralContext();
  const [pageData, setPageData] = useState(initialData);
  const [originalPageData, setOriginalPageData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [suppliers, setSuppliers] = useState({ suppliers: [] });
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [comparisonKeys, setComparisonKeys] = useState([]);
  const objectUrlRegistryRef = useRef([]);
  const pageDataUrlRegistryRef = useRef([]);
  const hasInitialFetchRef = useRef(false);
  const hasFetchedWithMappingsRef = useRef(false);
  const suppliersFetchSequenceRef = useRef(0);

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
    return getEffectiveComparisonKeys({ comparisonKeys, pageData });
  }, [comparisonKeys, pageData]);

  const getChangedData = useCallback(() => {
    return buildNestedChangedData({
      pageData,
      originalPageData,
      comparisonKeys: effectiveComparisonKeys(),
      rootTableName: 'suppliers',
      base64Config: supplierBase64Config,
    });
  }, [
    pageData,
    originalPageData,
    effectiveComparisonKeys,
    supplierBase64Config,
  ]);

  const isDataUnchanged = useCallback(() => {
    return getChangedData() === null;
  }, [getChangedData]);

  const discardCurrentSupplierUnsavedChanges = useCallback(() => {
    if (
      originalPageData &&
      String(originalPageData?.id || '').trim() ===
        String(pageData?.id || '').trim()
    ) {
      setPageData(JSON.parse(JSON.stringify(originalPageData)));
      return;
    }

    setPageData({});
  }, [originalPageData, pageData]);

  const getSupplierSaveDryRunData = useCallback(() => {
    const changesResult = getChangedData();
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
      !originalPageData || originalPageData.id !== pageData.id;

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
  }, [getChangedData, originalPageData, pageData.id]);

  const getSupplierData = useCallback(
    (id) => {
      const canSwitch = canProceedAndDiscardUnsavedChanges({
        hasRecordId: !!pageData.id,
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
      pageData,
      isDataUnchanged,
      token,
      supplierBase64Config,
      discardCurrentSupplierUnsavedChanges,
    ],
  );

  const upsertSupplierPageData = useCallback((nestedData) => {
    setPageData((prevData) => {
      if (
        !validateNestedDataObject(
          nestedData,
          'upsertSupplierPageData requires an object argument',
        )
      ) {
        return prevData;
      }
      return upsertNestedData(prevData, nestedData);
    });
  }, []);

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
          await externalSaveCallback(pageData);
        }

        if (pageData.id) {
          const cleanedPageData = _cleanupFlags(pageData);
          const savedSupplierData = JSON.parse(JSON.stringify(cleanedPageData));

          setPageData(cleanedPageData);
          setOriginalPageData(savedSupplierData);

          setSuppliers((prevSuppliersState) => {
            return mergeEntityIntoStateList({
              prevState: prevSuppliersState,
              listKey: 'suppliers',
              entity: savedSupplierData,
            });
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
    [pageData, getChangedData, token, _cleanupFlags, supplierBase64Config],
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
    const canCreate = canProceedAndDiscardUnsavedChanges({
      hasRecordId: !!pageData.id,
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
    pageData,
    isDataUnchanged,
    generateNextSupplierCode,
    discardCurrentSupplierUnsavedChanges,
  ]);

  const getAllData = useCallback(() => {
    return pageData;
  }, [pageData]);

  return (
    <SupplierContext.Provider
      value={{
        pageData,
        suppliers,
        getSupplierData,
        upsertSupplierPageData,
        getAllSuppliers,
        updateSuppliers,
        refreshSupplierList,
        handleSupplierSave,
        createNewSupplier,
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
