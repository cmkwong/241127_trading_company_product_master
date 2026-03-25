import {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { apiGet, apiPatch } from '../utils/crud';
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
  'master_customer_image_types',
  'master_customer_name_types',
  'master_currencies',
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
  master_customer_image_types: [],
  master_customer_name_types: [],
  master_currencies: [],
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
];

export const MasterContext_Provider = ({ children }) => {
  const { token } = useAuthContext();
  const [masterDataMap, setMasterDataMap] = useState(TABLE_INITIAL_DATA);

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
  const packType = masterDataMap.master_packing_types || [];
  const currencies = masterDataMap.master_currencies || [];
  const productImageType = masterDataMap.master_product_image_types || [];

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
      const endpoint = `${DEFAULT_MASTER_API_BASE}/${tableName}`;
      const response = await apiGet(endpoint, {
        ...(token ? { token } : {}),
      });

      const payload = response?.results ?? response?.data?.results ?? [];

      const normalizedData = Array.isArray(payload) ? payload : [];

      updateLocalMasterTableData(tableName, normalizedData);

      return normalizedData;
    },
    [token, updateLocalMasterTableData],
  );

  const updateMasterTableData = useCallback(
    async (tableName, data) => {
      if (!tableName || typeof tableName !== 'string') {
        throw new Error('updateMasterTableData requires a valid tableName');
      }

      const endpoint = `${DEFAULT_MASTER_API_BASE}/${tableName}`;
      const response = await apiPatch(
        endpoint,
        { data },
        {
          ...(token ? { token } : {}),
        },
      );

      await fetchMasterData(tableName);
      return response;
    },
    [fetchMasterData, token],
  );

  useEffect(() => {
    const fetchAllMasterData = async () => {
      await Promise.all(
        DEFAULT_TABLE_NAMES.map((tableName) => fetchMasterData(tableName)),
      );
    };

    fetchAllMasterData();
  }, [fetchMasterData]);

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
    packingReliabilityType,
    certType,
    colorType,
    addressType,
    capacityType,
    contactType,
    customerImageType,
    customerNameType,
    productImageType,
    productStatus,
    productKeywords,
    serviceImages,
    services,
    sizeType,
    currencies,
    masterDataMap,
    fetchMasterData,
    getMasterTableData,
    updateMasterTableData,
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
