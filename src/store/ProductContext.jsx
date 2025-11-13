import { createContext, useState, useContext, useCallback } from 'react';
import {
  mockProduct_template,
  mockProducts,
} from '../datas/Products/mockProducts';

// Create context for data collection
export const ProductContext = createContext();

// Provider component for save page data
export const ProductContext_Provider = ({ children, initialData = {} }) => {
  const [pageData, setPageData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [products, setProducts] = useState(mockProducts);

  // Function to update specific field in the data
  const updateData = useCallback((field, value) => {
    setPageData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  // Function to update multiple fields at once
  const updateMultipleData = useCallback((dataObject) => {
    setPageData((prevData) => ({
      ...prevData,
      ...dataObject,
    }));
  }, []);

  // Function to get all products
  const getAllProducts = useCallback(() => {
    return products;
  }, [products]);

  // Function to update products list
  const updateProducts = useCallback((newProducts) => {
    setProducts(newProducts);
  }, []);

  // load product into page data by ID
  const loadProductById = useCallback(
    (productId) => {
      // Find the product in the internal products state
      const product = products.find(
        (p) => p.id === productId || p.productId === productId
      );

      if (!product) {
        console.error(`Product with ID ${productId} not found`);
        return false;
      }

      // Update all product data at once
      setPageData({
        ...pageData,
        id: product.id,
        productId: product.productId,
        productNames: product.productNames || [],
        category: product.category || [],
        customizations: product.customizations || [],
        productLinks: product.productLinks || [],
        alibabaIds: product.alibabaIds || [],
        packings: product.packings || [],
        certificates: product.certificates || [],
        remark: product.remark || '',
        iconUrl: product.iconUrl || '',
      });

      return true;
    },
    [pageData, products]
  );

  // Function to handle save action with built-in product list update
  const handleSave = useCallback(
    async (externalSaveCallback = null) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        // If external save callback is provided (e.g., for API calls), call it with the current data
        if (typeof externalSaveCallback === 'function') {
          await externalSaveCallback(pageData);
        }

        // Always update the products list if the saved product has an ID
        if (pageData.id) {
          setProducts((prevProducts) => {
            const updatedProducts = [...prevProducts];
            const existingIndex = updatedProducts.findIndex(
              (p) => p.id === pageData.id
            );

            if (existingIndex !== -1) {
              // Update existing product
              updatedProducts[existingIndex] = {
                ...updatedProducts[existingIndex],
                ...pageData,
              };
            } else {
              // Add new product
              updatedProducts.push({
                ...pageData,
              });
            }

            return updatedProducts;
          });
        }

        setSaveSuccess(true);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);

        return true; // Indicate successful save
      } catch (error) {
        console.error('Error saving data:', error);
        setSaveError(error.message || 'Failed to save data');
        return false; // Indicate failed save
      } finally {
        setIsSaving(false);
      }
    },
    [pageData]
  );

  // Create a new product (clear page data)
  const createNewProduct = useCallback(() => {
    setPageData(mockProduct_template);
  }, []);

  // Get all collected data
  const getAllData = useCallback(() => {
    return pageData;
  }, [pageData]);

  return (
    <ProductContext.Provider
      value={{
        pageData,
        products,
        updateData,
        updateMultipleData,
        loadProductById,
        getAllProducts,
        updateProducts,
        handleSave,
        createNewProduct,
        getAllData,
        isSaving,
        saveSuccess,
        saveError,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use the save page context
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error(
      'useProductContext must be used within a ProductContext_Provider'
    );
  }
  return context;
};
