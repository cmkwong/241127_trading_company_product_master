import { useState, createContext, useContext, useCallback } from 'react';
import {
  mockProductNameType,
  mockCategory,
  mockSupplierType,
  mockPackType,
  mockCertType,
} from '../datas/Options/ProductOptions';

export const MasterContext = createContext();

export const MasterContext_Provider = ({ children, initialData = {} }) => {
  const [productNameType, setProductNameType] = useState(mockProductNameType);
  const [category, setCategory] = useState(mockCategory);
  const [supplierType, setSupplierType] = useState(mockSupplierType);
  const [packType, setPackType] = useState(mockPackType);
  const [certType, setCertType] = useState(mockCertType);

  // Function to get product name types
  const getProductNameTypes = useCallback(() => {
    return productNameType;
  }, [productNameType]);

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
  const getCategories = useCallback(() => {
    return category;
  }, [category]);

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
  const getSupplierTypes = useCallback(() => {
    return supplierType;
  }, [supplierType]);

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
  const getPackTypes = useCallback(() => {
    return packType;
  }, [packType]);

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
  const getCertTypes = useCallback(() => {
    return certType;
  }, [certType]);

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

  const contextValue = {
    // State
    productNameType,
    category,
    supplierType,
    packType,
    certType,
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
