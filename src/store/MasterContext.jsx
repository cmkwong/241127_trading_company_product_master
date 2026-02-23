import {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import {
  mockProductNameType,
  mockCategory,
  mockSupplierType,
  mockPackType,
  mockCertType,
  mockProductImageType,
} from '../datas/Options/ProductOptions';
import { apiGet } from '../utils/crud';
import { useAuthContext } from './AuthContext';

export const MasterContext = createContext();

const DEFAULT_MASTER_API_BASE = 'http://localhost:3001/api/v1/products/master';
const DEFAULT_TABLE_NAMES = [
  'master_categories',
  'master_certificate_types',
  'master_keywords',
  'master_packing_types',
  'master_product_image_types',
  'master_product_name_types',
  'master_supplier_types',
];

export const MasterContext_Provider = ({ children }) => {
  const { token } = useAuthContext();
  const [category, setCategory] = useState(mockCategory);
  const [productKeywords, setProductKeywords] = useState([]);
  const [certType, setCertType] = useState(mockCertType);
  const [productNameType, setProductNameType] = useState(mockProductNameType);
  const [supplierType, setSupplierType] = useState(mockSupplierType);
  const [packType, setPackType] = useState(mockPackType);
  const [productImageType, setProductImageType] =
    useState(mockProductImageType);

  const fetchMasterData = useCallback(
    async (tableName) => {
      const endpoint = `${DEFAULT_MASTER_API_BASE}/${tableName}`;
      const response = await apiGet(endpoint, {
        ...(token ? { token } : {}),
      });

      const payload = response?.results ?? response?.data?.results ?? [];

      const normalizedData = Array.isArray(payload) ? payload : [];

      switch (tableName) {
        case 'master_categories':
          setCategory(normalizedData);
          break;
        case 'master_certificate_types':
          setCertType(normalizedData);
          break;
        case 'master_keywords':
          setProductKeywords(normalizedData);
          break;
        case 'master_packing_types':
          setPackType(normalizedData);
          break;
        case 'master_product_image_types':
          setProductImageType(normalizedData);
          break;
        case 'master_product_name_types':
          setProductNameType(normalizedData);
          break;
        case 'master_supplier_types':
          setSupplierType(normalizedData);
          break;
        default:
          break;
      }

      return normalizedData;
    },
    [token],
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

  // Function to get product name types
  const getProductNameTypes = useCallback(
    (id, label) => {
      return getRequiredData(id, label, productNameType);
    },
    [productNameType, getRequiredData],
  );

  // Function to update product name types
  const updateProductNameTypes = useCallback((newTypes) => {
    setProductNameType(newTypes);
  }, []);

  // Function to add a new product name type
  const addProductNameType = useCallback((newType) => {
    setProductNameType((prev) => [...prev, newType]);
  }, []);

  const removeProductNameType = useCallback((matcher) => {
    setProductNameType((prev) =>
      prev.filter((item) =>
        typeof matcher === 'function' ? !matcher(item) : item !== matcher,
      ),
    );
  }, []);

  // Function to get categories
  const getCategories = useCallback(
    (id, label) => {
      return getRequiredData(id, label, category);
    },
    [category, getRequiredData],
  );

  // Function to update categories
  const updateCategories = useCallback((newCategories) => {
    setCategory(newCategories);
  }, []);

  // Function to add a new category
  const addCategory = useCallback((newCategory) => {
    setCategory((prev) => [...prev, newCategory]);
  }, []);

  const removeCategory = useCallback((matcher) => {
    setCategory((prev) =>
      prev.filter((item) =>
        typeof matcher === 'function' ? !matcher(item) : item !== matcher,
      ),
    );
  }, []);

  // Function to get supplier types
  const getSupplierTypes = useCallback(
    (id, label) => {
      return getRequiredData(id, label, supplierType);
    },
    [supplierType, getRequiredData],
  );

  // Function to update supplier types
  const updateSupplierTypes = useCallback((newTypes) => {
    setSupplierType(newTypes);
  }, []);

  // Function to add a new supplier type
  const addSupplierType = useCallback((newType) => {
    setSupplierType((prev) => [...prev, newType]);
  }, []);

  const removeSupplierType = useCallback((matcher) => {
    setSupplierType((prev) =>
      prev.filter((item) =>
        typeof matcher === 'function' ? !matcher(item) : item !== matcher,
      ),
    );
  }, []);

  // Function to get pack types
  const getPackTypes = useCallback(
    (id, label) => {
      return getRequiredData(id, label, packType);
    },
    [packType, getRequiredData],
  );

  // Function to update pack types
  const updatePackTypes = useCallback((newTypes) => {
    setPackType(newTypes);
  }, []);

  // Function to add a new pack type
  const addPackType = useCallback((newType) => {
    setPackType((prev) => [...prev, newType]);
  }, []);

  const removePackType = useCallback((matcher) => {
    setPackType((prev) =>
      prev.filter((item) =>
        typeof matcher === 'function' ? !matcher(item) : item !== matcher,
      ),
    );
  }, []);

  // Function to get certificate types
  const getCertTypes = useCallback(
    (id, label) => {
      return getRequiredData(id, label, certType);
    },
    [certType, getRequiredData],
  );

  // Function to update certificate types
  const updateCertTypes = useCallback((newTypes) => {
    setCertType(newTypes);
  }, []);

  // Function to add a new certificate type
  const addCertType = useCallback((newType) => {
    setCertType((prev) => [...prev, newType]);
  }, []);

  const removeCertType = useCallback((matcher) => {
    setCertType((prev) =>
      prev.filter((item) =>
        typeof matcher === 'function' ? !matcher(item) : item !== matcher,
      ),
    );
  }, []);

  const getProductImageTypes = useCallback(
    (id, label) => {
      return getRequiredData(id, label, productImageType);
    },
    [productImageType, getRequiredData],
  );

  const updateProductImageTypes = useCallback((newTypes) => {
    setProductImageType(newTypes);
  }, []);

  const addProductImageType = useCallback((newType) => {
    setProductImageType((prev) => [...prev, newType]);
  }, []);

  const removeProductImageType = useCallback((matcher) => {
    setProductImageType((prev) =>
      prev.filter((item) =>
        typeof matcher === 'function' ? !matcher(item) : item !== matcher,
      ),
    );
  }, []);

  const contextValue = {
    // State
    productNameType,
    category,
    supplierType,
    packType,
    certType,
    productImageType,
    productKeywords,
    fetchMasterData,
    // Product Name Type functions
    getProductNameTypes,
    updateProductNameTypes,
    addProductNameType,
    removeProductNameType,
    // Category functions
    getCategories,
    updateCategories,
    addCategory,
    removeCategory,
    // Supplier Type functions
    getSupplierTypes,
    updateSupplierTypes,
    addSupplierType,
    removeSupplierType,
    // Pack Type functions
    getPackTypes,
    updatePackTypes,
    addPackType,
    removePackType,
    // Cert Type functions
    getCertTypes,
    updateCertTypes,
    addCertType,
    removeCertType,
    // Product Image Type functions
    getProductImageTypes,
    updateProductImageTypes,
    addProductImageType,
    removeProductImageType,
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
  if (!context) {
    throw new Error(
      'useMasterContext must be used within a MasterContext_Provider',
    );
  }
  return context;
};
