import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { mockProduct_base64_config } from '../datas/Products/mockProducts';
import {
  releaseObjectUrls,
  recursiveProcess_base64_to_objectUrl,
  processChangesWithBase64,
} from '../utils/objectUrlUtils';
import { upsertNestedData } from '../utils/crudObj';
import { apiGet, apiPatch, apiDelete, apiPost } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { debugLog } from '../utils/debug';

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
  const pageDataUrlRegistryRef = useRef([]);

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
              iconOnly: '1',
              compress: '1',
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
      releaseObjectUrls(pageDataUrlRegistryRef.current);
      pageDataUrlRegistryRef.current = [];
    };
  }, [token]); // Re-run when token changes (login/logout)

  // Helper function to deep compare and return differences
  const getChangedData = useCallback(() => {
    // If no ID, this is a new product that hasn't been saved yet
    if (!pageData.id) {
      return { changes: { products: [pageData] } }; // All data is new
    }

    // Find the corresponding product in the products array
    if (!products.products) return { changes: { products: [pageData] } };
    const existingProduct = products.products.find((p) => p.id === pageData.id);

    // If product doesn't exist in the list, data is changed (all new)
    if (!existingProduct) {
      return { changes: { products: [pageData] } };
    }

    // Clean up internal flags from pageData to avoid false change detection
    const cleanPageData = { ...pageData };
    debugLog('getChangedData', 'Starting comparison', {
      pageDataIds: Object.keys(pageData),
      productsCount: products.products?.length,
      currentId: cleanPageData.id,
      base64Changed: cleanPageData._base64_changed,
    });

    // Check if _base64_changed exists BEFORE cleaning it
    // Store original flag to pass to getDiff if needed, but getDiff checks `current`

    // Don't delete _base64_changed here, getDiff handles skipping it during property iteration
    // but needs it for the specific check at the start.
    // delete cleanPageData._base64_changed;
    delete cleanPageData._objUrl;

    // Helper to get diff between two objects
    const getDiff = (
      current,
      original,
      keysToCompare,
      tableName = 'products',
    ) => {
      // Debug logging to trace execution
      debugLog('getDiff', `Comparing table: ${tableName}`, {
        currentId: current.id,
        originalId: original.id,
        currentBase64Changed: current._base64_changed,
        tableName,
      });

      const diff = current.id ? { id: current.id } : {};
      const deletions = current.id ? { id: current.id } : {};

      let hasChanges = false;
      let hasDeletions = false;

      // Check for base64 changes instructions (Changes only)
      // FIX: Should check CURRENT object's flag, not global pageData
      if (current._base64_changed) {
        debugLog('getDiff', `Base64 change detected in ${tableName}`, {
          current,
        });
        const config = mockProduct_base64_config[tableName];
        if (config && config.url) {
          diff[config.url] = current[config.url];
          hasChanges = true;
        }
      }

      for (const key of keysToCompare) {
        // Skip _base64_changed flag and internal keys (not real data properties)
        if (key === '_base64_changed' || key === '_objUrl') continue;

        // Skip keys not in the object (unless tracking deletions)
        if (current[key] === undefined && original[key] === undefined) continue;

        // 1. Array handling (Nested tables)
        if (Array.isArray(current[key])) {
          const currentArr = current[key];
          const originalArr = Array.isArray(original[key]) ? original[key] : [];

          const arrayChanges = [];
          const arrayDeletions = [];

          // Check for directly deleted items (in original but not current)
          originalArr.forEach((origItem) => {
            if (
              origItem.id &&
              !currentArr.some((currItem) => currItem.id === origItem.id)
            ) {
              arrayDeletions.push({ id: origItem.id });
              hasDeletions = true;
            }
          });

          // Check for modifications / deep deletions in current items
          currentArr.forEach((item) => {
            // New item
            if (!item.id) {
              // New items considered "changes"
              arrayChanges.push(item);
              hasChanges = true;
              return;
            }

            const originalItem = originalArr.find((i) => i.id === item.id);
            if (!originalItem) {
              // New item (by ID check fallback)
              arrayChanges.push(item);
              hasChanges = true;
            } else {
              // Existing item - recurse
              const itemKeys = Object.keys(item);
              const { diff: itemDiff, deletions: itemDel } = getDiff(
                item,
                originalItem,
                itemKeys,
                key,
              ); // Pass key as tableName

              // If has changes, add to arrayChanges
              // itemDiff always has ID, check keys > 1
              if (Object.keys(itemDiff).length > 1) {
                arrayChanges.push(itemDiff);
                hasChanges = true;
              }

              // If has deletions, add to arrayDeletions
              if (Object.keys(itemDel).length > 1) {
                arrayDeletions.push(itemDel);
                hasDeletions = true;
              }
            }
          });

          if (arrayChanges.length > 0) {
            diff[key] = arrayChanges;
          }
          if (arrayDeletions.length > 0) {
            deletions[key] = arrayDeletions;
          }
        }
        // 2. Object handling
        else if (
          typeof current[key] === 'object' &&
          current[key] !== null &&
          key !== '_objUrl' &&
          key !== '_base64_changed'
        ) {
          // If original is not object or null
          if (typeof original[key] !== 'object' || original[key] === null) {
            diff[key] = current[key];
            hasChanges = true;
          } else {
            // Deep compare simple objects
            if (
              JSON.stringify(current[key]) !== JSON.stringify(original[key])
            ) {
              diff[key] = current[key];
              hasChanges = true;
            }
          }
        }
        // 3. Primitive handling
        else {
          if (current[key] !== original[key]) {
            diff[key] = current[key];
            hasChanges = true;
          }
        }
      }

      return {
        diff: hasChanges ? diff : diff.id ? { id: diff.id } : {}, // Keep ID only if no changes
        deletions: hasDeletions
          ? deletions
          : deletions.id
            ? { id: deletions.id }
            : {}, // Keep ID only if no deletions
      };
    };

    const { diff: rootDiff, deletions: rootDel } = getDiff(
      cleanPageData,
      existingProduct,
      PRODUCT_COMPARISON_KEYS,
      'products',
    );

    const result = {};
    let hasResult = false;

    if (Object.keys(rootDiff).length > 1) {
      result.changes = { products: [rootDiff] };
      hasResult = true;
    }

    if (Object.keys(rootDel).length > 1) {
      result.deletions = { products: [rootDel] };
      hasResult = true;
    }

    if (hasResult) {
      debugLog('getChangedData', 'Changes detected:', result);
    } else {
      debugLog('getChangedData', 'No changes detected.');
    }

    return hasResult ? result : null;
  }, [pageData, products]);

  // Function to check if pageData is the same as the corresponding product in products
  const isDataUnchanged = useCallback(() => {
    return getChangedData() === null;
  }, [getChangedData]);

  /**
   * Load a product into pageData by ID
   * @param {string} id - The ID of the product to load
   * @returns {boolean} Returns true if loaded successfully, false if cancelled or not found
   */
  const getProductData = useCallback(
    (id) => {
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

      // Start async fetch to retrieve full product data (including base64 images)
      (async () => {
        setIsProductsLoading(true);
        try {
          const requestBody = {
            data: {
              products: [
                {
                  id,
                },
              ],
            },
          };

          const response = await apiPost(
            'http://localhost:3001/api/v1/products/data/ids',
            requestBody,
            {
              token,
              params: {
                includeBase64: '1',
                compress: '1',
              },
            },
          );

          // Extract data similar to fetchProducts
          let rawData;
          if (response?.structuredData?.data?.products) {
            rawData = response.structuredData.data;
          } else {
            rawData = Array.isArray(response)
              ? { products: response }
              : response;
          }

          // Clear previous pageData object URLs
          releaseObjectUrls(pageDataUrlRegistryRef.current);
          const urlRegistry = [];

          // Process images (base64 -> objectUrl)
          const processed = recursiveProcess_base64_to_objectUrl(
            rawData,
            'root',
            mockProduct_base64_config,
            urlRegistry,
          );

          console.log('processed product data for id', id, processed);

          const product =
            processed?.products?.[0] || rawData?.products?.[0] || null;
          if (product) {
            setPageData(product);
            pageDataUrlRegistryRef.current = urlRegistry;
          } else {
            console.error('getProductData: no product returned for id', id);
          }
        } catch (err) {
          console.error('Failed to fetch product by id:', err);
        } finally {
          setIsProductsLoading(false);
        }
      })();

      // Return synchronously so callers can use immediate boolean result (e.g., cancelled by user)
      return true;
    },
    [pageData, isDataUnchanged, token],
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

  // Recursive cleanup internal FLAG function
  const _cleanupFlags = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => _cleanupFlags(item));
    }

    const newObj = { ...obj };
    delete newObj._base64_changed;

    // Recurse for nested objects
    Object.keys(newObj).forEach((key) => {
      if (typeof newObj[key] === 'object' && newObj[key] !== null) {
        newObj[key] = _cleanupFlags(newObj[key]);
      }
    });

    return newObj;
  };

  // Function to handle save action with built-in product list update
  const handleSave = useCallback(
    async (externalSaveCallback = null) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        // --- Process Changes and Commit to Server ---
        const changesResult = getChangedData();
        console.log('Detected changes:', changesResult);

        if (changesResult) {
          const { changes, deletions } = changesResult;

          // 1. Handle Updates & Creations (PATCH)
          if (changes) {
            console.log('Processing base64 conversions for changes...');
            // Process base64 fields in changes before sending to server
            const processedChanges = await processChangesWithBase64(
              changes,
              mockProduct_base64_config,
            );
            console.log('Sending PATCH request:', processedChanges);

            await apiPatch(
              'http://localhost:3001/api/v1/products/data/ids',
              { data: processedChanges },
              { token },
            );
          }

          // 2. Handle Deletions (DELETE)
          if (deletions) {
            console.log('Sending DELETE request:', deletions);
            await apiDelete('http://localhost:3001/api/v1/products/data/ids', {
              token,
              body: { data: deletions },
            });
          }
        }

        // If external save callback is provided (e.g., for API calls), call it with the current data
        if (typeof externalSaveCallback === 'function') {
          await externalSaveCallback(pageData);
        }

        // Always update the products list if the saved product has an ID
        if (pageData.id) {
          const cleanedPageData = _cleanupFlags(pageData);

          // Update pageData with the cleaned version
          setPageData(cleanedPageData);

          setProducts((prevProductsState) => {
            // Check if products array exists in state, fallback to empty array if not
            const currentProductsList = prevProductsState.products || [];
            const updatedProductsList = [...currentProductsList];

            // Find index of the product in the list
            const existingIndex = updatedProductsList.findIndex(
              (p) => p.id === cleanedPageData.id,
            );

            // Create a deep copy of cleanedPageData to ensure all nested properties are synchronized
            const savedProductData = JSON.parse(
              JSON.stringify(cleanedPageData),
            );

            // If product exists, update it; otherwise, add it to the list
            if (existingIndex !== -1) {
              // Update existing product with deep copy
              updatedProductsList[existingIndex] = savedProductData;
            } else {
              // Add new product
              updatedProductsList.push(savedProductData);
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
    [pageData, getChangedData, token],
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
        getProductData,
        upsertProductPageData,

        getAllProducts,
        updateProducts,
        handleSave,
        createNewProduct,
        getAllData,
        isSaving,
        saveSuccess,
        saveError,
        isDataUnchanged,
        getChangedData,
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
