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
  canProceedWithRecordSwitch,
} from '../utils/contextDataUtils';
import { upsertNestedData } from '../utils/crudObj';
import { apiGet, apiPatch, apiDelete, apiPost } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import { useGeneralContext } from './GeneralContext';
import { v4 as uuidv4 } from 'uuid';

// Create context for data collection
export const ProductContext = createContext();

// Provider component for save page data
export const ProductContext_Provider = ({ children, initialData = {} }) => {
  const { token } = useAuthContext();
  const { fileMappings, isFileMappingsLoading } = useGeneralContext();
  const [pageData, setPageData] = useState(initialData);
  const [originalPageData, setOriginalPageData] = useState(initialData); // Store original data for change detection
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [products, setProducts] = useState({ products: [] });
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [comparisonKeys, setComparisonKeys] = useState([]);
  const objectUrlRegistryRef = useRef([]);
  const pageDataUrlRegistryRef = useRef([]);

  const productBase64Config = useMemo(() => fileMappings || {}, [fileMappings]);

  // Fetch products data on mount and when token changes
  useEffect(() => {
    if (isFileMappingsLoading) {
      return;
    }

    // If no token, we can't fetch. Reset products or keep existing?
    if (!token) {
      setProducts({ products: [] });
      setPageData({});
      return;
    }

    const fetchProducts = async () => {
      setIsProductsLoading(true);
      try {
        const response = await apiPost(
          'http://localhost:3001/api/v1/trade_business/products/data/list',
          {
            includeBase64: true,
            iconOnly: true,
            compress: true,
          },
          {
            token,
          },
        );

        console.log('Fetched products data:', response);

        // Extract data based on expected API response structure
        const rawData = normalizeStructuredTableResponse(response, 'products');

        // Clear any previously created object URLs before regenerating new ones.
        releaseObjectUrls(objectUrlRegistryRef.current);
        const urlRegistry = [];

        console.log('Raw products data before processing:', rawData);
        // Process images (base64 to objectUrl)
        let processedProducts = recursiveProcess_base64_to_objectUrl(
          rawData,
          'root',
          productBase64Config,
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

    const fetchProductComparisonKeys = async () => {
      try {
        const response = await apiGet(
          'http://localhost:3001/api/v1/trade_business/products/data/comparison-keys',
          { token },
        );

        const keys = response?.data?.firstLevelKeys;
        setComparisonKeys(Array.isArray(keys) ? keys : []);
      } catch (err) {
        console.error('Failed to fetch product comparison keys:', err);
        setComparisonKeys([]);
      }
    };

    fetchProducts();
    fetchProductComparisonKeys();

    return () => {
      releaseObjectUrls(objectUrlRegistryRef.current);
      objectUrlRegistryRef.current = [];
      releaseObjectUrls(pageDataUrlRegistryRef.current);
      pageDataUrlRegistryRef.current = [];
    };
  }, [token, isFileMappingsLoading, productBase64Config]); // Re-run when token/mappings change

  const effectiveComparisonKeys = useCallback(() => {
    if (comparisonKeys.length > 0) {
      return comparisonKeys;
    }

    return Object.keys(pageData || {}).filter(
      (key) => key !== '_objUrl' && key !== '_base64_changed',
    );
  }, [comparisonKeys, pageData]);

  // Helper function to deep compare and return differences
  const getChangedData = useCallback(() => {
    return buildNestedChangedData({
      pageData,
      originalPageData,
      comparisonKeys: effectiveComparisonKeys(),
      rootTableName: 'products',
      base64Config: productBase64Config,
    });
  }, [
    pageData,
    originalPageData,
    effectiveComparisonKeys,
    productBase64Config,
  ]);

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
      if (
        !canProceedWithRecordSwitch({
          hasRecordId: !!pageData.id,
          isDataUnchanged: isDataUnchanged(),
        })
      ) {
        return false;
      }

      // Start async fetch to retrieve full product data (including base64 images)
      (async () => {
        setIsProductsLoading(true);
        try {
          const requestBody = {
            includeBase64: true,
            compress: true,
            data: {
              products: [
                {
                  id,
                },
              ],
            },
          };

          const response = await apiPost(
            'http://localhost:3001/api/v1/trade_business/products/data/get/ids',
            requestBody,
            {
              token,
            },
          );

          // Extract data similar to fetchProducts
          const rawData = normalizeStructuredTableResponse(
            response,
            'products',
          );

          // Clear previous pageData object URLs
          releaseObjectUrls(pageDataUrlRegistryRef.current);
          const urlRegistry = [];

          // Process images (base64 -> objectUrl)
          const processed = recursiveProcess_base64_to_objectUrl(
            rawData,
            'root',
            productBase64Config,
            urlRegistry,
          );

          console.log('processed product data for id', id, processed);

          const product =
            processed?.products?.[0] || rawData?.products?.[0] || null;
          if (product) {
            setPageData(product);
            setOriginalPageData(JSON.parse(JSON.stringify(product)));
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
    [pageData, isDataUnchanged, token, productBase64Config],
  );

  /**
   * Upsert (Update or Insert) data in a specific table
   * Supports nested data structures. If the data contains array fields,
   * it will recursively upsert nested items.
   *
   * Examples:
   *
   * 1) Update root product fields
   * upsertProductPageData({
   *   id: "product-1",
   *   remark: "Updated remark",
   *   hs_code: "1234.56"
   * })
   *
   * 2) Add or update a nested row by id (product_names)
   * upsertProductPageData({
   *   product_names: [
   *     {
   *       id: "name-row-1",
   *       name: "New Product Name",
   *       product_name_type_id: "master-name-type-1"
   *     }
   *   ]
   * })
   *
   * 3) Soft delete a nested row using _delete
   * upsertProductPageData({
   *   product_keywords: [
   *     {
   *       id: "keyword-row-1",
   *       _delete: true
   *     }
   *   ]
   * })
   *
   * 4) Deep nested update (parent + child table)
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
  const _cleanupFlags = useCallback((obj) => {
    return cleanupNestedInternalFlags(obj);
  }, []);

  // Function to handle save action with built-in product list update
  const handleProductSave = useCallback(
    async (externalSaveCallback = null) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        // --- Process Changes and Commit to Server ---
        const changesResult = getChangedData();
        console.log('Detected changes:', changesResult);

        if (changesResult) {
          const { changes, deletions } = changesResult;

          // 1. Handle Deletions (DELETE)
          if (deletions) {
            console.log('Sending DELETE request:', deletions);
            await apiDelete(
              'http://localhost:3001/api/v1/trade_business/products/data/ids',
              {
                token,
                body: { data: deletions },
              },
            );
          }

          // 2. Handle Updates & Creations (PATCH)
          if (changes) {
            console.log('Processing base64 conversions for changes...');
            // Process base64 fields in changes before sending to server
            const processedChanges = await processChangesWithBase64(
              changes,
              productBase64Config,
            );
            console.log('Sending PATCH request:', processedChanges);

            await apiPatch(
              'http://localhost:3001/api/v1/trade_business/products/data/ids',
              { data: processedChanges },
              { token },
            );
          }
        }

        // If external save callback is provided (e.g., for API calls), call it with the current data
        if (typeof externalSaveCallback === 'function') {
          await externalSaveCallback(pageData);
        }

        // Always update the products list if the saved product has an ID
        if (pageData.id) {
          const cleanedPageData = _cleanupFlags(pageData);
          const savedProductData = JSON.parse(JSON.stringify(cleanedPageData));

          // Update pageData with the cleaned version
          setPageData(cleanedPageData);
          // Refresh baseline for change detection after successful save
          setOriginalPageData(savedProductData);

          setProducts((prevProductsState) => {
            // Check if products array exists in state, fallback to empty array if not
            const currentProductsList = prevProductsState.products || [];
            const updatedProductsList = [...currentProductsList];

            // Find index of the product in the list
            const existingIndex = updatedProductsList.findIndex(
              (p) => p.id === cleanedPageData.id,
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
    [pageData, getChangedData, token, _cleanupFlags, productBase64Config],
  );

  // Create a new product (clear page data)
  const createNewProduct = useCallback(() => {
    // Check if there are unsaved changes in the current product
    if (
      !canProceedWithRecordSwitch({
        hasRecordId: !!pageData.id,
        isDataUnchanged: isDataUnchanged(),
      })
    ) {
      return false;
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
        // Core product state
        pageData,
        products,

        // Data loading and mutation actions
        getProductData,
        upsertProductPageData,
        getAllProducts,
        updateProducts,

        // Save/create actions
        handleProductSave,
        createNewProduct,

        // Utility getters
        getAllData,

        // Save status flags
        isSaving,
        saveSuccess,
        saveError,
        isProductsLoading,

        // Change detection helpers
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
