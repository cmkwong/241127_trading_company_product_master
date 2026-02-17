import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  mockProducts,
  mockProduct_base64_config,
} from '../datas/Products/mockProducts';
import {
  releaseObjectUrls,
  recursiveProcess_base64_to_objectUrl,
} from '../utils/objectUrlUtils';
import {
  addToTable,
  updateTable,
  removeFromTable,
  readFromTable,
  upsertNestedData,
} from '../utils/crudObj';
import { apiGet } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

// Create context for data collection
export const ProductContext = createContext();

// Define keys to compare for detecting changes (single source of truth)
const PRODUCT_COMPARISON_KEYS = [
  'id',
  'hs_code',
  'remark',
  'icon_name',
  'product_images',
  'product_names',
  'product_categories',
  'product_customizations',
  'product_links',
  'product_alibaba_ids',
  'product_packings',
  'product_certificates',
];

// Provider component for save page data
export const ProductContext_Provider = ({ children, initialData = {} }) => {
  const { token } = useAuthContext();
  const [pageData, setPageData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [products, setProducts] = useState({ products: [] });
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const objectUrlRegistryRef = useRef([]);

  // Fetch products data on mount and when token changes
  useEffect(() => {
    // If no token, we can't fetch. Reset products or keep existing?
    if (!token) {
      setProducts({ products: [] });
      setPageData({});
      return;
    }

    const fetchProducts = async () => {
      setIsProductsLoading(true);
      try {
        const response = await apiGet(
          'http://localhost:3001/api/v1/products/data',
          {
            token,
            params: {
              includeBase64: '1',
              // compress: '1',
            },
          },
        );

        console.log('Fetched products data:', response);

        // Extract data based on expected API response structure
        let rawData;
        if (response?.structuredData?.data?.products) {
          rawData = response.structuredData.data;
        } else {
          // Fallback for direct object or array response
          rawData = Array.isArray(response) ? { products: response } : response;
        }

        // Clear any previously created object URLs before regenerating new ones.
        releaseObjectUrls(objectUrlRegistryRef.current);
        const urlRegistry = [];

        console.log('Raw products data before processing:', rawData);
        // Process images (base64 to objectUrl)
        let processedProducts = recursiveProcess_base64_to_objectUrl(
          rawData,
          'root',
          mockProduct_base64_config,
          urlRegistry,
        );
        console.log('Processed products with object URLs:', processedProducts);
        setProducts(processedProducts || { products: [] });
        objectUrlRegistryRef.current = urlRegistry;
      } catch (err) {
        console.error('Failed to fetch products:', err);
        // On error, keep empty or handle gracefully
        setProducts({ products: [] });
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      releaseObjectUrls(objectUrlRegistryRef.current);
      objectUrlRegistryRef.current = [];
    };
  }, [token]); // Re-run when token changes (login/logout)

  // Function to check if pageData is the same as the corresponding product in products
  const isDataUnchanged = useCallback(() => {
    // If no ID, this is a new product that hasn't been saved yet
    if (!pageData.id) {
      return false;
    }

    // Find the corresponding product in the products array
    if (!products.products) return false;
    const existingProduct = products.products.find((p) => p.id === pageData.id);

    // If product doesn't exist in the list, data is changed
    if (!existingProduct) {
      return false;
    }

    // Check each key for equality
    for (const key of PRODUCT_COMPARISON_KEYS) {
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

  /**
   * Add new data to a specific table (array)
   * Supports nested paths using dot notation (e.g., 'product_customizations.product_customization_images')
   * Automatically generates an ID if not provided
   * @param {string} tableName - Name of the table/array to add to. Use dot notation for nested arrays.
   * @param {object} dataObject - Object containing fields to add
   */
  const addProductPageData = useCallback((tableName, dataObject) => {
    setPageData((prevData) => addToTable(prevData, tableName, dataObject));
  }, []);

  /**
   * Get product data from a specific table with optional conditions
   * Supports nested paths using dot notation
   * @param {string} tableName - Name of the table/array to read from, or 'root' for root data. Use dot notation for nested arrays.
   * @param {object} [condition] - Optional AND conditions to filter items
   * @param {boolean} [setAsPageData] - If true, searches products array and loads into pageData with unsaved changes check
   * @returns {boolean|Array|object|null} Returns true/false if setting pageData, otherwise returns matching data
   */
  const getProductData = useCallback(
    (tableName, condition = null, setAsPageData = false) => {
      // If setAsPageData is true, load into pageData with unsaved changes check
      if (setAsPageData) {
        // Check if there are unsaved changes in the current product
        if (pageData.id && !isDataUnchanged()) {
          // Show confirmation dialog
          const confirmSwitch = window.confirm(
            'You have unsaved changes. Do you want to continue without saving?',
          );

          // If user cancels, stay on current product
          if (!confirmSwitch) {
            return false;
          }
        }

        // When loading into pageData, always search the products array
        // Filter products that match ALL conditions (AND logic)
        if (!products.products) return false;
        const matchingProducts = products.products.filter((product) => {
          return Object.keys(condition).every(
            (key) => product[key] === condition[key],
          );
        });

        if (matchingProducts.length === 0) {
          console.error(`Product not found for conditions:`, condition);
          return false;
        }

        const requiredProduct = matchingProducts[0];
        setPageData(requiredProduct);
        return true;
      }

      // Otherwise, just return the data without setting pageData
      return readFromTable(pageData, tableName, condition);
    },
    [pageData, products, isDataUnchanged],
  );

  /**
   * Update data in a specific table (array) with optional AND conditions
   * Supports nested paths using dot notation (e.g., 'product_customizations.product_customization_images')
   * @param {string} tableName - Name of the table/array to update, or 'root' for root fields. Use dot notation for nested arrays.
   * @param {object} dataObject - Object containing fields to update
   * @param {object} [condition] - Optional AND conditions to filter items (e.g., { id: 'xxx', type: 'abc' })
   */
  const updateProductPageData = useCallback(
    (tableName, dataObject, condition = null) => {
      setPageData((prevData) =>
        updateTable(prevData, tableName, dataObject, condition),
      );
    },
    [],
  );

  /**
   * Upsert (Update or Insert) data in a specific table
   * Supports nested data structures. If the data contains array fields,
   * it will recursively upsert nested items.
   *
   * Example:
   * upsertProductPageData({
   *   product_customizations: [
   *     {
   *       id: "1234",
   *       name: "testing changed",
   *       product_customization_images: [
   *         {
   *           id: "8798s7987s8df",
   *           _delete: true
   *         }
   *       ]
   *     }
   *   ]
   * })
   *
   * @param {object} nestedData - Nested data object
   */
  const upsertProductPageData = useCallback((nestedData) => {
    setPageData((prevData) => {
      // Validate input is an object
      if (typeof nestedData !== 'object' || nestedData === null) {
        console.error('upsertProductPageData requires an object argument');
        return prevData;
      }

      // Use nested data structure approach
      return upsertNestedData(prevData, nestedData);
    });
  }, []);

  /**
   * Remove items from a specific table (array) based on AND conditions
   * Supports nested paths using dot notation (e.g., 'product_customizations.product_customization_images')
   * @param {string} tableName - Name of the table/array to remove from. Use dot notation for nested arrays.
   * @param {object} condition - AND conditions to filter items to remove (e.g., { id: 'xxx', type: 'abc' })
   */
  const removeProductPageData = useCallback((tableName, condition) => {
    setPageData((prevData) => removeFromTable(prevData, tableName, condition));
  }, []);

  // Function to update multiple fields at once
  const updateMultipleData = useCallback((dataObject) => {
    setPageData((prevData) => ({
      ...prevData,
      ...dataObject,
    }));
  }, []);

  // Function to get all products - now returns the products array from state
  const getAllProducts = useCallback(() => {
    return products.products || [];
  }, [products]);

  // Function to update products list - expects an array of products
  const updateProducts = useCallback((newProductsList) => {
    setProducts((prevState) => ({
      ...prevState,
      products: newProductsList,
    }));
  }, []);

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
          setProducts((prevProductsState) => {
            // Check if products array exists in state, fallback to empty array if not
            const currentProductsList = prevProductsState.products || [];
            const updatedProductsList = [...currentProductsList];

            const existingIndex = updatedProductsList.findIndex(
              (p) => p.id === pageData.id,
            );

            if (existingIndex !== -1) {
              // Update existing product
              updatedProductsList[existingIndex] = {
                ...updatedProductsList[existingIndex],
                ...pageData,
              };
            } else {
              // Add new product
              updatedProductsList.push({
                ...pageData,
              });
            }

            return {
              ...prevProductsState,
              products: updatedProductsList,
            };
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
    [pageData],
  );

  // Create a new product (clear page data)
  const createNewProduct = useCallback(() => {
    // Check if there are unsaved changes in the current product
    if (pageData.id && !isDataUnchanged()) {
      // Show confirmation dialog
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Do you want to continue without saving?',
      );

      // If user cancels, stay on current product
      if (!confirmSwitch) {
        return false;
      }
      // Otherwise continue with creating a new product
    }

    setPageData({ id: uuidv4() }); // Start with a new product with a generated ID
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
        addProductPageData,
        getProductData,
        updateProductPageData,
        upsertProductPageData,
        removeProductPageData,
        updateMultipleData,

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
      'useProductContext must be used within a ProductContext_Provider',
    );
  }
  return context;
};
