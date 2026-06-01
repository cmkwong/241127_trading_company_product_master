import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { apiDelete, apiGet, apiPatch, apiPost } from '../utils/crud';
import {
  processChangesWithBase64,
  recursiveProcess_base64_to_objectUrl,
  releaseObjectUrls,
} from '../utils/objectUrlUtils';
import {
  buildNestedChangedData,
  canProceedAndDiscardUnsavedChanges,
  cleanupNestedInternalFlags,
  ensureContextAvailable,
  generateNextSegmentedCode,
  getEffectiveComparisonKeys,
  mergeEntityIntoStateList,
  normalizeStructuredTableResponse,
  validateNestedDataObject,
} from '../utils/contextDataUtils';
import { upsertNestedData } from '../utils/crudObj';
import { useAuthContext } from './AuthContext';
import { useGeneralContext } from './GeneralContext';

export const CustomerContext = createContext();

const CUSTOMERS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/customers';

export const CustomerContext_Provider = ({ children, initialData = {} }) => {
  const { token } = useAuthContext();
  const { fileMappings, isFileMappingsLoading } = useGeneralContext();

  const [pageData, setPageData] = useState(initialData);
  const [originalPageData, setOriginalPageData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [customers, setCustomers] = useState({ customers: [] });
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [comparisonKeys, setComparisonKeys] = useState([]);

  const objectUrlRegistryRef = useRef([]);
  const pageDataUrlRegistryRef = useRef([]);
  const hasInitialFetchRef = useRef(false);
  const hasFetchedWithMappingsRef = useRef(false);
  const customersFetchSequenceRef = useRef(0);

  const customerBase64Config = useMemo(
    () => fileMappings || {},
    [fileMappings],
  );

  const doFetchCustomers = useCallback(async () => {
    const fetchSequence = ++customersFetchSequenceRef.current;
    const hasMappings = Object.keys(customerBase64Config || {}).length > 0;

    if (!token) {
      setCustomers({ customers: [] });
      return;
    }

    setIsCustomersLoading(true);

    try {
      const response = await apiGet(`${CUSTOMERS_API_BASE}/data`, {
        token,
        params: {
          includeBase64: 1,
          compress: 1,
        },
      });

      const rawData = normalizeStructuredTableResponse(response, 'customers');

      releaseObjectUrls(objectUrlRegistryRef.current);
      const urlRegistry = [];

      const processedCustomers = recursiveProcess_base64_to_objectUrl(
        rawData,
        'root',
        customerBase64Config,
        urlRegistry,
      );

      if (fetchSequence !== customersFetchSequenceRef.current) {
        releaseObjectUrls(urlRegistry);
        return;
      }

      setCustomers(processedCustomers || { customers: [] });
      objectUrlRegistryRef.current = urlRegistry;
      hasFetchedWithMappingsRef.current = hasMappings;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers({ customers: [] });
    } finally {
      setIsCustomersLoading(false);
    }
  }, [token, customerBase64Config]);

  const doFetchComparisonKeys = useCallback(async () => {
    if (!token) {
      setComparisonKeys([]);
      return;
    }

    try {
      const response = await apiGet(
        `${CUSTOMERS_API_BASE}/data/comparison-keys`,
        {
          token,
        },
      );

      const keys = response?.data?.firstLevelKeys;
      setComparisonKeys(Array.isArray(keys) ? keys : []);
    } catch {
      setComparisonKeys([]);
    }
  }, [token]);

  const refreshCustomerList = useCallback(async () => {
    await doFetchCustomers();
    await doFetchComparisonKeys();
  }, [doFetchCustomers, doFetchComparisonKeys]);

  useEffect(() => {
    if (isFileMappingsLoading) {
      return;
    }

    if (!token) {
      setCustomers({ customers: [] });
      setPageData({});
      setSelectedCustomerId(null);
      hasInitialFetchRef.current = false;
      hasFetchedWithMappingsRef.current = false;
      return;
    }

    const hasMappings = Object.keys(customerBase64Config || {}).length > 0;
    const shouldRefetchWithMappings =
      hasMappings && !hasFetchedWithMappingsRef.current;

    if (!hasInitialFetchRef.current || shouldRefetchWithMappings) {
      doFetchCustomers();
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
    customerBase64Config,
    doFetchCustomers,
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
      rootTableName: 'customers',
      base64Config: customerBase64Config,
    });
  }, [
    pageData,
    originalPageData,
    effectiveComparisonKeys,
    customerBase64Config,
  ]);

  const isDataUnchanged = useCallback(() => {
    return getChangedData() === null;
  }, [getChangedData]);

  const discardCurrentCustomerUnsavedChanges = useCallback(() => {
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

  const getCustomerSaveDryRunData = useCallback(() => {
    const changesResult = getChangedData();
    const preview = {
      endpoint: `${CUSTOMERS_API_BASE}/data/ids`,
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

    if (changesResult?.changes?.customers) {
      if (isRootCreate) {
        preview.create.customers = changesResult.changes.customers;
      } else {
        preview.update.customers = changesResult.changes.customers;
      }
    }

    if (changesResult?.deletions) {
      preview.delete = changesResult.deletions;
    }

    return preview;
  }, [getChangedData, originalPageData, pageData.id]);

  const getCustomerData = useCallback(
    (id) => {
      const canSwitch = canProceedAndDiscardUnsavedChanges({
        hasRecordId: !!pageData.id,
        isDataUnchanged: isDataUnchanged(),
        onDiscard: discardCurrentCustomerUnsavedChanges,
      });

      if (!canSwitch) {
        return false;
      }

      (async () => {
        setIsCustomersLoading(true);
        try {
          const response = await apiPost(
            `${CUSTOMERS_API_BASE}/data/ids`,
            {
              includeBase64: true,
              compress: true,
              data: {
                customers: [{ id }],
              },
            },
            { token },
          );

          const rawData = normalizeStructuredTableResponse(
            response,
            'customers',
          );

          releaseObjectUrls(pageDataUrlRegistryRef.current);
          const urlRegistry = [];

          const processed = recursiveProcess_base64_to_objectUrl(
            rawData,
            'root',
            customerBase64Config,
            urlRegistry,
          );

          const customer =
            processed?.customers?.[0] || rawData?.customers?.[0] || null;

          if (customer) {
            setSelectedCustomerId(id);
            setPageData(customer);
            setOriginalPageData(JSON.parse(JSON.stringify(customer)));
            pageDataUrlRegistryRef.current = urlRegistry;
          }
        } catch (error) {
          console.error('Failed to fetch customer by id:', error);
        } finally {
          setIsCustomersLoading(false);
        }
      })();

      return true;
    },
    [
      pageData,
      isDataUnchanged,
      token,
      customerBase64Config,
      discardCurrentCustomerUnsavedChanges,
    ],
  );

  const upsertCustomerPageData = useCallback((nestedData) => {
    setPageData((prevData) => {
      if (
        !validateNestedDataObject(
          nestedData,
          'upsertCustomerPageData requires an object argument',
        )
      ) {
        return prevData;
      }

      return upsertNestedData(prevData, nestedData);
    });
  }, []);

  const getAllCustomers = useCallback(() => {
    return customers?.customers || [];
  }, [customers]);

  const updateCustomers = useCallback((newCustomersList) => {
    setCustomers((prevState) => ({
      ...prevState,
      customers: newCustomersList,
    }));
  }, []);

  const cleanupFlags = useCallback((obj) => {
    return cleanupNestedInternalFlags(obj);
  }, []);

  const handleCustomerSave = useCallback(
    async (externalSaveCallback = null) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const changesResult = getChangedData();

        if (changesResult) {
          const { changes, deletions } = changesResult;

          if (deletions) {
            await apiDelete(`${CUSTOMERS_API_BASE}/data/ids`, {
              token,
              body: { data: deletions },
            });
          }

          if (changes) {
            const processedChanges = await processChangesWithBase64(
              changes,
              customerBase64Config,
            );

            await apiPatch(
              `${CUSTOMERS_API_BASE}/data/ids`,
              { data: processedChanges },
              { token },
            );
          }
        }

        if (typeof externalSaveCallback === 'function') {
          await externalSaveCallback(pageData);
        }

        if (pageData.id) {
          const cleanedPageData = cleanupFlags(pageData);
          const savedCustomerData = JSON.parse(JSON.stringify(cleanedPageData));

          setPageData(cleanedPageData);
          setOriginalPageData(savedCustomerData);

          setCustomers((prevCustomersState) => {
            return mergeEntityIntoStateList({
              prevState: prevCustomersState,
              listKey: 'customers',
              entity: savedCustomerData,
            });
          });
        }

        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);

        return true;
      } catch (error) {
        console.error('Error saving customer data:', error);
        setSaveError(error?.message || 'Failed to save customer data');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [pageData, getChangedData, token, cleanupFlags, customerBase64Config],
  );

  const generateNextCustomerCode = useCallback(() => {
    const customerList = Array.isArray(customers?.customers)
      ? customers.customers
      : [];

    return generateNextSegmentedCode({
      items: customerList,
      getCode: (customer) => customer?.customer_code || customer?.code || '',
      prefix: 'C',
      segmentLength: 4,
    });
  }, [customers]);

  const createNewCustomer = useCallback(() => {
    const canCreate = canProceedAndDiscardUnsavedChanges({
      hasRecordId: !!pageData.id,
      isDataUnchanged: isDataUnchanged(),
      onDiscard: discardCurrentCustomerUnsavedChanges,
    });

    if (!canCreate) {
      return false;
    }

    const newCustomerCode = generateNextCustomerCode();
    const newCustomerId = uuidv4();

    setPageData({
      id: newCustomerId,
      customer_code: newCustomerCode,
      remark: '',
      customer_names: [],
      customer_types: [],
      customer_addresses: [],
      customer_contacts: [],
      customer_images: [],
    });
    setSelectedCustomerId(newCustomerId);

    return true;
  }, [
    pageData,
    isDataUnchanged,
    generateNextCustomerCode,
    discardCurrentCustomerUnsavedChanges,
  ]);

  const getAllData = useCallback(() => {
    return pageData;
  }, [pageData]);

  return (
    <CustomerContext.Provider
      value={{
        pageData,
        customers,
        getCustomerData,
        upsertCustomerPageData,
        getAllCustomers,
        updateCustomers,
        refreshCustomerList,
        handleCustomerSave,
        createNewCustomer,
        getAllData,
        isSaving,
        saveSuccess,
        saveError,
        isCustomersLoading,
        isDataUnchanged,
        getChangedData,
        getCustomerSaveDryRunData,
        selectedCustomerId,
        setSelectedCustomerId,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomerContext = () => {
  const context = useContext(CustomerContext);
  return ensureContextAvailable(
    context,
    'useCustomerContext',
    'CustomerContext_Provider',
  );
};
