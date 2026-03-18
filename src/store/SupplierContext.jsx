import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
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
  canProceedWithRecordSwitch,
} from '../utils/contextDataUtils';
import { upsertNestedData } from '../utils/crudObj';
import { apiGet, apiPatch, apiDelete, apiPost } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const SupplierContext = createContext();

const mockSupplier_base64_config = {
  suppliers: { url: 'icon_url', base64: 'base64_image' },
  supplier_service_images: { url: 'image_url', base64: 'base64_image' },
};

const SUPPLIER_COMPARISON_KEYS = [
  'id',
  'code',
  'name',
  'company_name',
  'supplier_type_id',
  'remark',
  'supplier_addresses',
  'supplier_contacts',
  'supplier_links',
  'supplier_services',
];

export const SupplierContext_Provider = ({ children, initialData = {} }) => {
  const { token } = useAuthContext();
  const [pageData, setPageData] = useState(initialData);
  const [originalPageData, setOriginalPageData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [suppliers, setSuppliers] = useState({ suppliers: [] });
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(false);
  const objectUrlRegistryRef = useRef([]);
  const pageDataUrlRegistryRef = useRef([]);

  useEffect(() => {
    if (!token) {
      setSuppliers({ suppliers: [] });
      setPageData({});
      return;
    }

    const fetchSuppliers = async () => {
      setIsSuppliersLoading(true);
      try {
        const response = await apiGet(
          'http://localhost:3001/api/v1/trade_business/suppliers/data',
          {
            token,
            params: {
              includeBase64: '1',
              compress: '1',
            },
          },
        );

        const rawData = normalizeStructuredTableResponse(response, 'suppliers');

        releaseObjectUrls(objectUrlRegistryRef.current);
        const urlRegistry = [];

        const processedSuppliers = recursiveProcess_base64_to_objectUrl(
          rawData,
          'root',
          mockSupplier_base64_config,
          urlRegistry,
        );

        setSuppliers(processedSuppliers || { suppliers: [] });
        objectUrlRegistryRef.current = urlRegistry;
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
        setSuppliers({ suppliers: [] });
      } finally {
        setIsSuppliersLoading(false);
      }
    };

    fetchSuppliers();

    return () => {
      releaseObjectUrls(objectUrlRegistryRef.current);
      objectUrlRegistryRef.current = [];
      releaseObjectUrls(pageDataUrlRegistryRef.current);
      pageDataUrlRegistryRef.current = [];
    };
  }, [token]);

  const getChangedData = useCallback(() => {
    return buildNestedChangedData({
      pageData,
      originalPageData,
      comparisonKeys: SUPPLIER_COMPARISON_KEYS,
      rootTableName: 'suppliers',
      base64Config: mockSupplier_base64_config,
    });
  }, [pageData, originalPageData]);

  const isDataUnchanged = useCallback(() => {
    return getChangedData() === null;
  }, [getChangedData]);

  const getSupplierData = useCallback(
    (id) => {
      if (
        !canProceedWithRecordSwitch({
          hasRecordId: !!pageData.id,
          isDataUnchanged: isDataUnchanged(),
        })
      ) {
        return false;
      }

      (async () => {
        setIsSuppliersLoading(true);
        try {
          const requestBody = {
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
              params: {
                includeBase64: '1',
                compress: '1',
              },
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
            mockSupplier_base64_config,
            urlRegistry,
          );

          const supplier =
            processed?.suppliers?.[0] || rawData?.suppliers?.[0] || null;
          if (supplier) {
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
    [pageData, isDataUnchanged, token],
  );

  const upsertSupplierPageData = useCallback((nestedData) => {
    setPageData((prevData) => {
      if (typeof nestedData !== 'object' || nestedData === null) {
        console.error('upsertSupplierPageData requires an object argument');
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
              mockSupplier_base64_config,
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
            const currentSuppliersList = prevSuppliersState.suppliers || [];
            const updatedSuppliersList = [...currentSuppliersList];

            const existingIndex = updatedSuppliersList.findIndex(
              (supplier) => supplier.id === cleanedPageData.id,
            );

            if (existingIndex !== -1) {
              updatedSuppliersList[existingIndex] = savedSupplierData;
            } else {
              updatedSuppliersList.push(savedSupplierData);
            }

            return {
              ...prevSuppliersState,
              suppliers: updatedSuppliersList,
            };
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
    [pageData, getChangedData, token, _cleanupFlags],
  );

  const createNewSupplier = useCallback(() => {
    if (
      !canProceedWithRecordSwitch({
        hasRecordId: !!pageData.id,
        isDataUnchanged: isDataUnchanged(),
      })
    ) {
      return false;
    }

    setPageData({
      id: uuidv4(),
      supplier_addresses: [],
      supplier_contacts: [],
      supplier_links: [],
      supplier_services: [],
    });

    return true;
  }, [pageData, isDataUnchanged]);

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
        handleSupplierSave,
        createNewSupplier,
        getAllData,
        isSaving,
        saveSuccess,
        saveError,
        isSuppliersLoading,
        isDataUnchanged,
        getChangedData,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSupplierContext = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error(
      'useSupplierContext must be used within a SupplierContext_Provider',
    );
  }
  return context;
};
