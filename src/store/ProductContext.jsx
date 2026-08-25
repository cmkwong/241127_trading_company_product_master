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
  canProceedAndDiscardUnsavedChanges,
  getEffectiveComparisonKeys,
  mergeEntityIntoStateList,
  ensureContextAvailable,
} from '../utils/contextDataUtils';
import { apiGet, apiPatch, apiDelete, apiPost } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import { useGeneralContext } from './GeneralContext';
import {
  readJson,
  stripBlobUrls,
  writeJson,
} from '../utils/TanStackUtils/listCache';
import { getEntityRecord, setEntityRecord } from './GeneralContext';
import { v4 as uuidv4 } from 'uuid';

// Thin product-scoped shims so internal call sites keep working while the
// record now lives in the generic entity store (key 'products').
const getPageData = () => getEntityRecord('products');
const setPageData = (valueOrUpdater) =>
  setEntityRecord('products', valueOrUpdater);

// Create context for data collection
export const ProductContext = createContext();

const PRODUCTS_LIST_STORAGE_KEY = 'trade_business_products_list';

const readStoredProducts = () =>
  readJson(PRODUCTS_LIST_STORAGE_KEY, { products: [] });

const persistProducts = (productsState) =>
  writeJson(
    PRODUCTS_LIST_STORAGE_KEY,
    stripBlobUrls({ products: productsState?.products ?? [] }),
  );

const SIDEBAR_ICON_MEMORY_BUDGET_BYTES = 400 * 1024 * 1024;
const ICON_FETCH_BATCH_SIZE = 40;
const PRODUCT_LIST_ICON_COMPRESSION = {
  iconCompress: true,
  iconMaxWidth: 220,
  iconMaxHeight: 220,
  iconQuality: 0.45,
};

const cloneProductForDuplication = (sourceProduct) => {
  const source = cleanupNestedInternalFlags(sourceProduct || {});
  const idMap = new Map();

  const collectRowIds = (value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item?._delete) return;
        collectRowIds(item);
      });
      return;
    }

    if (!value || typeof value !== 'object') return;

    const id = String(value.id || '').trim();
    if (id && !idMap.has(id)) {
      idMap.set(id, uuidv4());
    }

    Object.values(value).forEach(collectRowIds);
  };

  const cloneValue = (value) => {
    if (Array.isArray(value)) {
      return value
        .filter((item) => !item?._delete)
        .map((item) => cloneValue(item));
    }

    if (!value || typeof value !== 'object') return value;

    return Object.entries(value).reduce((copy, [key, nestedValue]) => {
      if (
        key === '_delete' ||
        key === '_base64_changed' ||
        key === '_objUrl' ||
        key === 'created_at' ||
        key === 'updated_at'
      ) {
        return copy;
      }

      if (key === 'id') {
        const replacementId = idMap.get(String(nestedValue || '').trim());
        if (replacementId) {
          copy.id = replacementId;
        }
        return copy;
      }

      if (key.endsWith('_id')) {
        const replacementId = idMap.get(String(nestedValue || '').trim());
        copy[key] = replacementId || nestedValue;
        return copy;
      }

      copy[key] = cloneValue(nestedValue);
      return copy;
    }, {});
  };

  collectRowIds(source);
  return cloneValue(source);
};

// Provider component for save page data.
//
// The currently edited product (pageData) lives in productStore.js and is read
// through useProductSelector / useProductRows by the panel components. This
// means editing one field only re-renders the panels that select that slice,
// instead of re-rendering every context consumer on each keystroke.
export const ProductContext_Provider = ({ children, initialData = {} }) => {
  const { token } = useAuthContext();
  const { fileMappings, isFileMappingsLoading } = useGeneralContext();
  const [originalPageData, setOriginalPageData] = useState(initialData); // Store original data for change detection
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [products, setProducts] = useState(readStoredProducts);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [comparisonKeys, setComparisonKeys] = useState([]);
  const objectUrlRegistryRef = useRef([]);
  const pageDataUrlRegistryRef = useRef([]);
  const hasInitialFetchRef = useRef(false);
  const hasFetchedWithMappingsRef = useRef(false);
  const productsFetchSequenceRef = useRef(0);
  const iconFetchedIdsRef = useRef(new Set());
  const iconInFlightIdsRef = useRef(new Set());
  const iconMemoryEntriesRef = useRef([]); // [{ id, url, bytes }]
  const iconMemoryBytesRef = useRef(0);
  const pageDataLoadedWithMappingsRef = useRef(false);
  const getProductDataRef = useRef(null);

  // Seed the external store with the initial data (once).
  useEffect(() => {
    if (!getPageData()?.id && initialData?.id) {
      setPageData(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productBase64Config = useMemo(() => {
    return {
      ...(fileMappings || {}),
    };
  }, [fileMappings]);

  // Extracted function to fetch products
  const doFetchProducts = useCallback(async () => {
    const fetchSequence = ++productsFetchSequenceRef.current;
    const hasMappings = Object.keys(productBase64Config || {}).length > 0;

    if (!token) {
      setProducts({ products: [] });
      return;
    }

    setIsProductsLoading(true);
    try {
      const response = await apiPost(
        'http://localhost:3001/api/v1/trade_business/products/data/list',
        {
          includeBase64: false,
          fields: {
            products: ['id', 'product_status_id', 'created_at', 'updated_at'],
            product_names: ['id', 'product_id', 'name', 'display_order'],
            product_categories: ['id', 'product_id', 'category_id'],
            product_alibaba_ids: ['id', 'product_id', 'value'],
            product_keywords: ['id', 'product_id', 'keyword_id'],
          },
        },
        {
          token,
        },
      );

      const rawData = normalizeStructuredTableResponse(response, 'products');

      // Ignore stale responses (e.g., non-mapping fetch finishing after mapping fetch)
      if (fetchSequence !== productsFetchSequenceRef.current) {
        return;
      }

      if (objectUrlRegistryRef.current.length > 0) {
        releaseObjectUrls(objectUrlRegistryRef.current);
      }

      setProducts(rawData || { products: [] });
      persistProducts(rawData || { products: [] });
      hasFetchedWithMappingsRef.current = hasMappings;
      objectUrlRegistryRef.current = [];
      iconFetchedIdsRef.current = new Set();
      iconInFlightIdsRef.current = new Set();
      iconMemoryEntriesRef.current = [];
      iconMemoryBytesRef.current = 0;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // On error, keep empty or handle gracefully
      setProducts({ products: [] });
    } finally {
      setIsProductsLoading(false);
    }
  }, [token, productBase64Config]);

  const enforceIconMemoryBudget = useCallback(() => {
    if (iconMemoryBytesRef.current <= SIDEBAR_ICON_MEMORY_BUDGET_BYTES) {
      return;
    }

    const idsToRelease = [];
    const urlsToRelease = [];

    while (
      iconMemoryBytesRef.current > SIDEBAR_ICON_MEMORY_BUDGET_BYTES &&
      iconMemoryEntriesRef.current.length > 0
    ) {
      const oldest = iconMemoryEntriesRef.current.shift();
      if (!oldest) break;
      iconMemoryBytesRef.current -= Number(oldest.bytes || 0);
      if (oldest.url) {
        urlsToRelease.push(oldest.url);
      }
      if (oldest.id) {
        idsToRelease.push(oldest.id);
        iconFetchedIdsRef.current.delete(oldest.id);
      }
    }

    if (urlsToRelease.length > 0) {
      releaseObjectUrls(urlsToRelease);
      objectUrlRegistryRef.current = objectUrlRegistryRef.current.filter(
        (url) => !urlsToRelease.includes(url),
      );
    }

    if (idsToRelease.length > 0) {
      const ids = new Set(idsToRelease);
      setProducts((prev) => ({
        ...prev,
        products: (prev?.products || []).map((item) =>
          ids.has(item.id) ? { ...item, icon_url: '' } : item,
        ),
      }));
    }
  }, []);

  // Public method to refresh product list, can be called from outside (e.g., after saving) to ensure data is up to date
  // when visiting the product list page again or when needing to refresh icons after changes
  const hydrateProductIcons = useCallback(
    async (requestedIds = []) => {
      const hasMappings = Object.keys(productBase64Config || {}).length > 0;
      if (!token || !Array.isArray(requestedIds) || requestedIds.length === 0) {
        return {};
      }

      if (!hasMappings) {
        return {};
      }

      const candidateIds = requestedIds
        .map((id) => String(id || '').trim())
        .filter(Boolean)
        .filter(
          (id) =>
            !iconFetchedIdsRef.current.has(id) &&
            !iconInFlightIdsRef.current.has(id),
        );

      if (candidateIds.length === 0) {
        return {};
      }

      const ids = candidateIds.slice(0, ICON_FETCH_BATCH_SIZE);
      ids.forEach((id) => iconInFlightIdsRef.current.add(id));

      try {
        const response = await apiPost(
          'http://localhost:3001/api/v1/trade_business/products/data/get/ids',
          {
            includeBase64: true,
            iconOnly: true,
            compress: true,
            ...PRODUCT_LIST_ICON_COMPRESSION,
            fields: {
              products: ['id', 'product_status_id', 'created_at', 'updated_at'],
              product_names: ['id', 'product_id', 'name', 'display_order'],
              product_categories: ['id', 'product_id', 'category_id'],
              product_alibaba_ids: ['id', 'product_id', 'value'],
              product_keywords: ['id', 'product_id', 'keyword_id'],
            },
            data: {
              products: ids.map((id) => ({ id })),
            },
          },
          { token },
        );

        const rawData = normalizeStructuredTableResponse(response, 'products');
        const urlRegistry = [];
        const processed = recursiveProcess_base64_to_objectUrl(
          rawData,
          'root',
          productBase64Config,
          urlRegistry,
        );

        const processedProducts = processed?.products || [];
        const rawProducts = rawData?.products || [];
        const iconMap = new Map();

        processedProducts.forEach((product, index) => {
          const id = String(product?.id || rawProducts[index]?.id || '').trim();
          if (!id) return;

          const iconUrl = String(product?.icon_url || '').trim();
          const base64Image = String(rawProducts[index]?.base64_image || '');
          const estimatedBytes = base64Image
            ? Math.floor((base64Image.length * 3) / 4)
            : 0;

          if (!iconUrl) {
            return;
          }

          iconMap.set(id, { icon_url: iconUrl, estimatedBytes });
          iconFetchedIdsRef.current.add(id);
        });

        setProducts((prev) => ({
          ...prev,
          products: (prev?.products || []).map((item) => {
            const iconInfo = iconMap.get(String(item?.id || '').trim());
            if (!iconInfo) return item;
            if (!iconInfo.icon_url) return item;
            return {
              ...item,
              icon_url: iconInfo.icon_url,
            };
          }),
        }));

        objectUrlRegistryRef.current = [
          ...objectUrlRegistryRef.current,
          ...urlRegistry,
        ];

        iconMap.forEach((iconInfo, id) => {
          if (!iconInfo.icon_url) return;
          iconMemoryEntriesRef.current.push({
            id,
            url: iconInfo.icon_url,
            bytes: iconInfo.estimatedBytes,
          });
          iconMemoryBytesRef.current += Number(iconInfo.estimatedBytes || 0);
        });

        enforceIconMemoryBudget();

        return Object.fromEntries(
          Array.from(iconMap.entries()).map(([id, iconInfo]) => [
            id,
            String(iconInfo?.icon_url || '').trim(),
          ]),
        );
      } catch (error) {
        console.error('Failed to hydrate product icons:', error);
        return {};
      } finally {
        ids.forEach((id) => iconInFlightIdsRef.current.delete(id));
      }
    },
    [token, productBase64Config, enforceIconMemoryBudget],
  );

  // Extracted function to fetch comparison keys
  const doFetchComparisonKeys = useCallback(async () => {
    if (!token) {
      setComparisonKeys([]);
      return;
    }

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
  }, [token]);

  // Public method to manually refresh all product data
  const refreshProductList = useCallback(async () => {
    await doFetchProducts();
    await doFetchComparisonKeys();
  }, [doFetchProducts, doFetchComparisonKeys]);

  // Fetch products data on mount and when token changes
  useEffect(() => {
    if (isFileMappingsLoading) {
      return;
    }

    // If no token, we can't fetch. Reset products or keep existing?
    if (!token) {
      releaseObjectUrls(objectUrlRegistryRef.current);
      objectUrlRegistryRef.current = [];
      releaseObjectUrls(pageDataUrlRegistryRef.current);
      pageDataUrlRegistryRef.current = [];
      iconFetchedIdsRef.current = new Set();
      iconInFlightIdsRef.current = new Set();
      iconMemoryEntriesRef.current = [];
      iconMemoryBytesRef.current = 0;
      setProducts({ products: [] });
      setPageData({});
      setSelectedProductId(null);
      hasInitialFetchRef.current = false;
      hasFetchedWithMappingsRef.current = false;
      return;
    }

    const hasMappings = Object.keys(productBase64Config || {}).length > 0;
    const shouldRefetchWithMappings =
      hasMappings && !hasFetchedWithMappingsRef.current;

    // Only fetch once per token to prevent re-fetching on tab switches
    if (!hasInitialFetchRef.current || shouldRefetchWithMappings) {
      doFetchProducts();
      doFetchComparisonKeys();
      hasInitialFetchRef.current = true;
    }
  }, [
    token,
    isFileMappingsLoading,
    productBase64Config,
    doFetchProducts,
    doFetchComparisonKeys,
  ]);

  // Cleanup object URLs only when provider unmounts.
  useEffect(() => {
    return () => {
      releaseObjectUrls(objectUrlRegistryRef.current);
      objectUrlRegistryRef.current = [];
      releaseObjectUrls(pageDataUrlRegistryRef.current);
      pageDataUrlRegistryRef.current = [];
      iconFetchedIdsRef.current = new Set();
      iconInFlightIdsRef.current = new Set();
      iconMemoryEntriesRef.current = [];
      iconMemoryBytesRef.current = 0;
    };
  }, []);

  const effectiveComparisonKeys = useCallback(
    () =>
      getEffectiveComparisonKeys({ comparisonKeys, pageData: getPageData() }),
    [comparisonKeys],
  );

  // Helper function to deep compare and return differences
  const getChangedData = useCallback(() => {
    return buildNestedChangedData({
      pageData: getPageData(),
      originalPageData,
      comparisonKeys: effectiveComparisonKeys(),
      rootTableName: 'products',
      base64Config: productBase64Config,
    });
  }, [originalPageData, effectiveComparisonKeys, productBase64Config]);

  // Function to check if pageData is the same as the corresponding product in products
  const isDataUnchanged = useCallback(() => {
    return getChangedData() === null;
  }, [getChangedData]);

  const discardCurrentProductUnsavedChanges = useCallback(() => {
    const current = getPageData();
    if (
      originalPageData &&
      String(originalPageData?.id || '').trim() ===
        String(current?.id || '').trim()
    ) {
      setPageData(JSON.parse(JSON.stringify(originalPageData)));
      return;
    }

    setPageData({});
  }, [originalPageData]);

  const getProductSaveDryRunData = useCallback(async () => {
    const changesResult = getChangedData();
    const current = getPageData();
    const preview = {
      endpoint: 'http://localhost:3001/api/v1/trade_business/products/data/ids',
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
      !originalPageData || originalPageData.id !== current.id;

    // For dry run, we want to show the final payload after processing base64 but without actually sending it to the server
    let processedChanges = changesResult?.changes;
    if (processedChanges) {
      processedChanges = await processChangesWithBase64(
        processedChanges,
        productBase64Config,
      );
      preview.payload = { data: processedChanges };
    }

    if (processedChanges?.products) {
      if (isRootCreate) {
        preview.create.products = processedChanges.products;
      } else {
        preview.update.products = processedChanges.products;
      }
    }

    if (changesResult?.deletions) {
      preview.delete = changesResult.deletions;
    }

    return preview;
  }, [getChangedData, originalPageData, productBase64Config]);

  /**
   * Load a product into the store by ID.
   */
  const getProductData = useCallback(
    (id) => {
      const current = getPageData();
      const canSwitch = canProceedAndDiscardUnsavedChanges({
        hasRecordId: !!current.id,
        isDataUnchanged: isDataUnchanged(),
        onDiscard: discardCurrentProductUnsavedChanges,
      });

      if (!canSwitch) {
        return false;
      }

      setSelectedProductId(id);
      pageDataLoadedWithMappingsRef.current =
        Object.keys(productBase64Config || {}).length > 0;

      // Start async fetch to retrieve full product data (including base64 images)
      (async () => {
        setIsProductsLoading(true);
        try {
          const response = await apiPost(
            'http://localhost:3001/api/v1/trade_business/products/data/get/ids',
            {
              includeBase64: true,
              compress: true,
              data: {
                products: [
                  {
                    id,
                  },
                ],
              },
            },
            {
              token,
            },
          );

          const rawData = normalizeStructuredTableResponse(
            response,
            'products',
          );

          releaseObjectUrls(pageDataUrlRegistryRef.current);
          const urlRegistry = [];

          const processed = recursiveProcess_base64_to_objectUrl(
            rawData,
            'root',
            productBase64Config,
            urlRegistry,
          );

          const product =
            processed?.products?.[0] || rawData?.products?.[0] || null;
          if (product) {
            setPageData(product);
            setOriginalPageData(JSON.parse(JSON.stringify(product)));
            pageDataUrlRegistryRef.current = urlRegistry;
            pageDataLoadedWithMappingsRef.current =
              Object.keys(productBase64Config || {}).length > 0;
          } else {
            console.error('getProductData: no product returned for id', id);
          }
        } catch (err) {
          console.error('Failed to fetch product by id:', err);
        } finally {
          setIsProductsLoading(false);
        }
      })();

      return true;
    },
    [
      isDataUnchanged,
      token,
      productBase64Config,
      discardCurrentProductUnsavedChanges,
    ],
  );

  useEffect(() => {
    getProductDataRef.current = getProductData;
  }, [getProductData]);

  // When file mappings arrive after the product was already loaded, re-fetch.
  useEffect(() => {
    const hasMappings = Object.keys(productBase64Config || {}).length > 0;
    if (!hasMappings || isFileMappingsLoading) return;

    const productId = String(
      selectedProductId || getPageData()?.id || '',
    ).trim();
    if (!productId) return;
    if (pageDataLoadedWithMappingsRef.current) return;

    getProductDataRef.current(productId);
  }, [productBase64Config, isFileMappingsLoading, selectedProductId]);

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
        const current = getPageData();
        const changesResult = getChangedData();

        if (changesResult) {
          const { changes, deletions } = changesResult;

          // 1. Handle Deletions (DELETE)
          if (deletions) {
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
            const processedChanges = await processChangesWithBase64(
              changes,
              productBase64Config,
            );

            await apiPatch(
              'http://localhost:3001/api/v1/trade_business/products/data/ids',
              { data: processedChanges },
              { token },
            );
          }
        }

        if (typeof externalSaveCallback === 'function') {
          await externalSaveCallback(current);
        }

        if (current.id) {
          const cleanedPageData = _cleanupFlags(current);
          const savedProductData = JSON.parse(JSON.stringify(cleanedPageData));

          setPageData(cleanedPageData);
          setOriginalPageData(savedProductData);

          setProducts((prevProductsState) => {
            const nextState = mergeEntityIntoStateList({
              prevState: prevProductsState,
              listKey: 'products',
              entity: savedProductData,
            });
            persistProducts(nextState);
            return nextState;
          });
        }

        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);

        return true;
      } catch (error) {
        console.error('Error saving data:', error);

        setSaveError(error.message || 'Failed to save data');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [getChangedData, token, _cleanupFlags, productBase64Config],
  );

  const deleteProductById = useCallback(
    async (id) => {
      const productId = String(id || '').trim();
      if (!productId) {
        throw new Error('Product ID is required for deletion');
      }

      await apiDelete(
        'http://localhost:3001/api/v1/trade_business/products/data/ids',
        {
          token,
          body: {
            data: {
              products: [{ id: productId }],
            },
          },
        },
      );

      setProducts((prevState) => {
        const nextState = {
          ...prevState,
          products: (prevState?.products || []).filter(
            (item) => String(item?.id || '').trim() !== productId,
          ),
        };
        persistProducts(nextState);
        return nextState;
      });

      setSelectedProductId((prevSelectedId) => {
        return String(prevSelectedId || '').trim() === productId
          ? null
          : prevSelectedId;
      });

      if (String(getPageData()?.id || '').trim() === productId) {
        releaseObjectUrls(pageDataUrlRegistryRef.current);
        pageDataUrlRegistryRef.current = [];
        setPageData({});
        setOriginalPageData({});
      }

      iconFetchedIdsRef.current.delete(productId);
      iconInFlightIdsRef.current.delete(productId);

      return true;
    },
    [token],
  );

  // Create a new product (clear page data)
  const createNewProduct = useCallback(() => {
    const current = getPageData();
    const canCreate = canProceedAndDiscardUnsavedChanges({
      hasRecordId: !!current.id,
      isDataUnchanged: isDataUnchanged(),
      onDiscard: discardCurrentProductUnsavedChanges,
    });

    if (!canCreate) {
      return false;
    }

    const newProductId = uuidv4();
    setSelectedProductId(newProductId);
    setPageData({ id: newProductId });
    return true;
  }, [isDataUnchanged, discardCurrentProductUnsavedChanges]);

  const duplicateSelectedProduct = useCallback(() => {
    const current = getPageData();
    if (!String(current?.id || '').trim()) {
      throw new Error('No product selected to duplicate.');
    }

    const duplicatedProduct = cloneProductForDuplication(current);
    const duplicatedProductId = String(duplicatedProduct?.id || '').trim();

    if (!duplicatedProductId) {
      throw new Error('Failed to create a duplicate product draft.');
    }

    setPageData(duplicatedProduct);
    setOriginalPageData({});
    setSelectedProductId(duplicatedProductId);
    setSaveError(null);

    return duplicatedProduct;
  }, []);

  // Get all collected data
  const getAllData = useCallback(() => {
    return getPageData();
  }, []);

  const value = useMemo(
    () => ({
      // Core product state (list + selection; pageData is read via selectors)
      products,
      selectedProductId,

      // Data loading and mutation actions
      getProductData,
      getAllProducts,
      updateProducts,
      refreshProductList,
      hydrateProductIcons,
      setSelectedProductId,

      // Save/create actions
      handleProductSave,
      createNewProduct,
      duplicateSelectedProduct,
      deleteProductById,

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
      getProductSaveDryRunData,
    }),
    [
      products,
      selectedProductId,
      getProductData,
      getAllProducts,
      updateProducts,
      refreshProductList,
      hydrateProductIcons,
      handleProductSave,
      createNewProduct,
      duplicateSelectedProduct,
      deleteProductById,
      getAllData,
      isSaving,
      saveSuccess,
      saveError,
      isProductsLoading,
      isDataUnchanged,
      getChangedData,
      getProductSaveDryRunData,
    ],
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

// Custom hook to use the save page context
export const useProductContext = () => {
  const context = useContext(ProductContext);
  return ensureContextAvailable(
    context,
    'useProductContext',
    'ProductContext_Provider',
  );
};
