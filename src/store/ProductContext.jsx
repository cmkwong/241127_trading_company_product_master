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
  const updateProductPageData = useCallback((field, value) => {
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

  // Function to check if pageData is the same as the corresponding product in products
  const isDataUnchanged = useCallback(() => {
    // If no ID, this is a new product that hasn't been saved yet
    if (!pageData.id) {
      return false;
    }

    // Find the corresponding product in the products array
    const existingProduct = products.find((p) => p.id === pageData.id);

    // If product doesn't exist in the list, data is changed
    if (!existingProduct) {
      return false;
    }

    // Define keys to compare (important fields that determine if data has changed)
    const keysToCompare = [
      'productId',
      'productNames',
      'category',
      'customizations',
      'productLinks',
      'alibabaIds',
      'packings',
      'certificates',
      'remark',
      'iconUrl',
    ];

    // Check each key for equality
    for (const key of keysToCompare) {
      // Handle arrays specially - need to check deep equality
      if (Array.isArray(pageData[key]) && Array.isArray(existingProduct[key])) {
        // If array lengths differ, data has changed
        if (pageData[key].length !== existingProduct[key].length) {
          return false;
        }

        // For simple arrays of primitives, we can use JSON.stringify for comparison
        // For complex arrays with objects, we need to sort and then compare
        const sortAndStringify = (arr) => {
          try {
            // Try to sort by 'id' if objects have it, otherwise sort by stringified version
            const sortedArr = [...arr].sort((a, b) => {
              if (
                typeof a === 'object' &&
                a !== null &&
                typeof b === 'object' &&
                b !== null
              ) {
                if (a.id && b.id) return a.id.localeCompare(b.id);
                if (a.name && b.name) return a.name.localeCompare(b.name);
              }
              return JSON.stringify(a).localeCompare(JSON.stringify(b));
            });
            return JSON.stringify(sortedArr);
          } catch (e) {
            // Fallback to simple stringify if sorting fails
            return JSON.stringify(arr);
          }
        };

        if (
          sortAndStringify(pageData[key]) !==
          sortAndStringify(existingProduct[key])
        ) {
          return false;
        }
      }
      // Handle objects (non-arrays)
      else if (
        typeof pageData[key] === 'object' &&
        pageData[key] !== null &&
        typeof existingProduct[key] === 'object' &&
        existingProduct[key] !== null
      ) {
        if (
          JSON.stringify(pageData[key]) !== JSON.stringify(existingProduct[key])
        ) {
          return false;
        }
      }
      // Handle primitives
      else if (pageData[key] !== existingProduct[key]) {
        return false;
      }
    }

    // If we've checked all keys and found no differences, data is unchanged
    return true;
  }, [pageData, products]);

  // load product into page data by ID
  const loadProductById = useCallback(
    (id) => {
      // Check if there are unsaved changes in the current product
      if (pageData.id && !isDataUnchanged()) {
        // Show confirmation dialog
        const confirmSwitch = window.confirm(
          'You have unsaved changes. Do you want to continue without saving?'
        );

        // If user cancels, stay on current product
        if (!confirmSwitch) {
          return false;
        }
        // Otherwise continue with loading the new product
      }

      // Find the product in the internal products state
      const product = products.find((p) => p.id === id);

      if (!product) {
        console.error(`Product with ID ${id} not found`);
        return false;
      }

      // Update all product data at once
      setPageData({
        ...pageData,
        id: product.id,
        productId: product.productId,
        productNames: product.productNames || [],
        productImages: product.productImages || [],
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
    [pageData, products, isDataUnchanged]
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
    // Check if there are unsaved changes in the current product
    if (pageData.id && !isDataUnchanged()) {
      // Show confirmation dialog
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Do you want to continue without saving?'
      );

      // If user cancels, stay on current product
      if (!confirmSwitch) {
        return false;
      }
      // Otherwise continue with creating a new product
    }

    setPageData(mockProduct_template());
    return true;
  }, [pageData, isDataUnchanged]);

  // Get all collected data
  const getAllData = useCallback(() => {
    return pageData;
  }, [pageData]);

  return (
    <ProductContext.Provider
      value={{
        pageData,
        products,
        updateProductPageData,
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
        isDataUnchanged,
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
