import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductSidebar.module.css';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { useProductContext } from '../../../../store/ProductContext';
import { buildCatalogRows, normalizeCatalogBundle } from '../utils/catalogData';
import {
  buildCatalogA4Html,
  printCatalogPreviewFrame,
} from '../utils/catalogPrint';
import ProductItemCard, {
  useProductCardLookups,
  buildProductCardTitle,
  buildProductCardRows,
  resolveProductCardIconUrl,
  resolveProductCardStatusLabel,
  buildProductCardKeywordText,
} from './ProductItemCard';

const PRODUCT_SEARCH_HISTORY_KEY = 'product_sidebar_search_history';
const MAX_SEARCH_HISTORY_ITEMS = 15;

const normalizeHistoryEntry = (entry) => {
  if (typeof entry === 'string') {
    const title = String(entry || '').trim();
    if (!title) return null;
    return { id: '', title, icon_url: '' };
  }

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const id = String(entry.id || '').trim();
  const title = String(entry.title || entry.name || '').trim();
  const rawIconUrl = String(entry.icon_url || entry.iconUrl || '').trim();
  const icon_url = rawIconUrl.startsWith('blob:') ? '' : rawIconUrl;
  if (!id && !title) return null;

  return { id, title, icon_url };
};

const getProductTime = (product, key) => {
  const value = new Date(product?.[key] || 0).getTime();
  return Number.isFinite(value) ? value : 0;
};

// Order item cards by most recent first:
// 1) updated_at (falling back to created_at when updated_at is missing)
// 2) created_at as the tie-breaker
// Non-mutating so the context array is left untouched.
const sortProductsByRecent = (rows = []) => {
  const source = Array.isArray(rows) ? rows : [];

  return [...source].sort((a, b) => {
    const aUpdated =
      getProductTime(a, 'updated_at') || getProductTime(a, 'created_at');
    const bUpdated =
      getProductTime(b, 'updated_at') || getProductTime(b, 'created_at');
    if (aUpdated !== bUpdated) return bUpdated - aUpdated;

    const aCreated = getProductTime(a, 'created_at');
    const bCreated = getProductTime(b, 'created_at');
    if (aCreated !== bCreated) return bCreated - aCreated;

    return String(a?.id || '').localeCompare(String(b?.id || ''));
  });
};

const ProductSidebar = ({ onSelectProduct, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const {
    getProductData,
    products,
    selectedProductId,
    hydrateProductIcons,
    getCatalogDataByIds,
  } = useProductContext();
  const cardLookups = useProductCardLookups();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isCatalogPreviewOpen, setIsCatalogPreviewOpen] = useState(false);
  const [catalogPreviewHtml, setCatalogPreviewHtml] = useState('');
  const [isPreparingCatalog, setIsPreparingCatalog] = useState(false);
  const catalogPreviewIframeRef = useRef(null);

  const searchHistoryWithIcons = useMemo(() => {
    const currentProductList = Array.isArray(products)
      ? products
      : products?.products || [];

    return (searchHistory || []).map((entry) => {
      const normalizedId = String(entry?.id || '').trim();
      if (!normalizedId) {
        return entry;
      }

      const matchedProduct = currentProductList.find(
        (item) => String(item?.id || '').trim() === normalizedId,
      );

      return {
        ...entry,
        icon_url: String(matchedProduct?.icon_url || entry?.icon_url || ''),
      };
    });
  }, [products, searchHistory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(PRODUCT_SEARCH_HISTORY_KEY);
      const parsed = JSON.parse(raw || '[]');
      const normalized = (Array.isArray(parsed) ? parsed : [])
        .map(normalizeHistoryEntry)
        .filter(Boolean)
        .slice(0, MAX_SEARCH_HISTORY_ITEMS);
      setSearchHistory(normalized);
    } catch (error) {
      console.error('Failed to load product search history:', error);
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    const currentProductList = sortProductsByRecent(
      Array.isArray(products) ? products : products?.products || [],
    );

    if (!searchTerm.trim()) {
      setFilteredProducts(currentProductList);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = currentProductList.filter((product) => {
      const statusName = resolveProductCardStatusLabel(product, cardLookups);

      const keywordText = buildProductCardKeywordText(product, cardLookups);

      return (
        (typeof product.product_names === 'string' &&
          product.product_names.toLowerCase().includes(lowerSearchTerm)) ||
        (Array.isArray(product.product_names) &&
          product.product_names.some((name) =>
            name.name.toLowerCase().includes(lowerSearchTerm),
          )) ||
        product.id.toLowerCase().includes(lowerSearchTerm) ||
        String(statusName).toLowerCase().includes(lowerSearchTerm) ||
        String(product?.created_at || '')
          .toLowerCase()
          .includes(lowerSearchTerm) ||
        String(product?.updated_at || '')
          .toLowerCase()
          .includes(lowerSearchTerm) ||
        String(keywordText).toLowerCase().includes(lowerSearchTerm) ||
        (Array.isArray(product.product_alibaba_ids) &&
          product.product_alibaba_ids.some((id) =>
            typeof id === 'string'
              ? id.toLowerCase().includes(lowerSearchTerm)
              : id.value && id.value.toLowerCase().includes(lowerSearchTerm),
          )) ||
        (Array.isArray(product.product_categories) &&
          product.product_categories.some((cat) =>
            typeof cat === 'string' || typeof cat === 'number'
              ? String(cat).toLowerCase().includes(lowerSearchTerm)
              : false,
          ))
      );
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products, cardLookups]);

  useEffect(() => {
    const ids = filteredProducts
      .slice(0, 30)
      .map((item) => item?.id)
      .filter(Boolean);

    if (ids.length > 0) {
      hydrateProductIcons(ids);
    }
  }, [filteredProducts, hydrateProductIcons]);

  const saveSearchHistory = useCallback((updater) => {
    setSearchHistory((prev) => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          PRODUCT_SEARCH_HISTORY_KEY,
          JSON.stringify(next),
        );
      }
      return next;
    });
  }, []);

  // Handle product selection
  const handleProductSelect = useCallback(
    (product) => {
      const getProductDataSuccess = getProductData(product.id);
      if (!getProductDataSuccess) return;

      navigate(`/panel/product_master/${product.id}`, { replace: true });

      // On mobile, collapse the sidebar after selection
      if (windowWidth <= 768) {
        onToggleCollapse(true);
      }

      // Pass the selected product to the parent component
      if (onSelectProduct) {
        onSelectProduct(product);
      }

      saveSearchHistory((prev) => {
        const entry = {
          id: String(product?.id || '').trim(),
          title: String(
            buildProductCardTitle(product, cardLookups) || product?.id || '',
          ).trim(),
          // Do not persist blob URLs; they become invalid after reload.
          icon_url: '',
        };

        const deduped = prev.filter((item) => {
          if (entry.id && item.id) {
            return item.id !== entry.id;
          }

          return (
            String(item.title || '').toLowerCase() !==
            String(entry.title || '').toLowerCase()
          );
        });

        return [entry, ...deduped].slice(0, MAX_SEARCH_HISTORY_ITEMS);
      });
    },
    [
      getProductData,
      windowWidth,
      onToggleCollapse,
      onSelectProduct,
      saveSearchHistory,
      cardLookups,
      navigate,
    ],
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSelectSearchHistory = useCallback(
    (entry) => {
      const normalized = normalizeHistoryEntry(entry);
      if (!normalized) return;

      const currentProductList = Array.isArray(products)
        ? products
        : products?.products || [];

      const found = currentProductList.find((item) => {
        const byId =
          normalized.id && String(item?.id || '').trim() === normalized.id;
        if (byId) return true;

        const itemTitle = String(
          buildProductCardTitle(item, cardLookups) || '',
        ).trim();
        return (
          !normalized.id &&
          itemTitle &&
          itemTitle.toLowerCase() === normalized.title.toLowerCase()
        );
      });

      if (found) {
        handleProductSelect(found);
        return;
      }

      setSearchTerm(normalized.title);
    },
    [products, cardLookups, handleProductSelect],
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleVisibleItemIdsChange = useCallback(
    (visibleIds = []) => {
      if (!Array.isArray(visibleIds) || visibleIds.length === 0) return;
      hydrateProductIcons(visibleIds);
    },
    [hydrateProductIcons],
  );

  const handleVisibleHistoryItemIdsChange = useCallback(
    (visibleIds = []) => {
      if (!Array.isArray(visibleIds) || visibleIds.length === 0) return;
      hydrateProductIcons(visibleIds);
    },
    [hydrateProductIcons],
  );

  const resolveProductExportImage = useCallback(
    async ({ item, currentSource }) => {
      const existingSource = String(
        currentSource || item?.icon_url || '',
      ).trim();

      if (existingSource) {
        return existingSource;
      }

      const productId = String(item?.id || '').trim();
      if (!productId) {
        return '';
      }

      const hydrated = await hydrateProductIcons([productId]);
      return String(hydrated?.[productId] || '').trim();
    },
    [hydrateProductIcons],
  );

  const resolveProductExportImagesBatch = useCallback(
    async ({ requests = [], maxBatchSize = 10 }) => {
      const normalizedBatchSize = Math.max(
        1,
        Math.min(10, Number(maxBatchSize) || 10),
      );

      const idSet = new Set();

      requests.forEach((request) => {
        const productId = String(
          request?.itemId || request?.item?.id || '',
        ).trim();
        if (!productId) {
          return;
        }
        idSet.add(productId);
      });

      const ids = Array.from(idSet);
      if (ids.length === 0) {
        return {};
      }

      const resolved = {};

      for (let index = 0; index < ids.length; index += normalizedBatchSize) {
        const chunk = ids.slice(index, index + normalizedBatchSize);
        const hydrated = await hydrateProductIcons(chunk);

        chunk.forEach((id) => {
          const source = String(hydrated?.[id] || '').trim();
          if (!source) {
            return;
          }
          resolved[id] = source;
        });
      }

      return resolved;
    },
    [hydrateProductIcons],
  );

  const handleExportCatalog = useCallback(
    async ({ items = [], getItemId }) => {
      const ids = [
        ...new Set(
          (Array.isArray(items) ? items : [])
            .map((item) =>
              typeof getItemId === 'function' ? getItemId(item) : item?.id,
            )
            .map((id) => String(id || '').trim())
            .filter(Boolean),
        ),
      ];

      if (ids.length === 0) {
        window.alert('No products to print.');
        return;
      }

      if (isPreparingCatalog) {
        return;
      }

      setIsPreparingCatalog(true);
      setCatalogPreviewHtml('');
      setIsCatalogPreviewOpen(true);

      try {
        const catalogResponse = await getCatalogDataByIds(ids);
        if (!catalogResponse?.ok) {
          window.alert('Failed to load catalog data from server.');
          setIsCatalogPreviewOpen(false);
          return;
        }

        const catalogBundle = normalizeCatalogBundle(catalogResponse);
        const rows = buildCatalogRows(catalogBundle.products, {
          currencies: catalogBundle.currencies,
          masterDataMap: catalogBundle.masterDataMap,
          baseCurrency: catalogBundle.baseCurrency,
        });
        if (rows.length === 0) {
          window.alert('No product data returned for the selected products.');
          setIsCatalogPreviewOpen(false);
          return;
        }

        setCatalogPreviewHtml(
          buildCatalogA4Html({
            rows,
            baseCurrency: catalogBundle.baseCurrency,
            subtitle: `${rows.length} products · ${new Date().getFullYear()}`,
          }),
        );
      } catch (err) {
        console.error('Failed to build catalog printout:', err);
        window.alert('Failed to build the catalog printout.');
        setIsCatalogPreviewOpen(false);
      } finally {
        setIsPreparingCatalog(false);
      }
    },
    [getCatalogDataByIds, isPreparingCatalog],
  );

  const handlePrintCatalog = useCallback(async () => {
    try {
      await printCatalogPreviewFrame(catalogPreviewIframeRef.current, {
        title: 'Product Catalog',
      });
    } catch (error) {
      console.error('Failed to print catalog:', error);
      window.alert(error?.message || 'Failed to print the catalog.');
    }
  }, []);

  const handleCloseCatalogPreview = useCallback(() => {
    setIsCatalogPreviewOpen(false);
    setCatalogPreviewHtml('');
  }, []);

  // Track window resize for responsive behavior
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <>
      <div
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      >
        <SearchSideBarList
          items={filteredProducts}
          selectedItemId={selectedProductId}
          onSelectItem={handleProductSelect}
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
          searchHistory={searchHistoryWithIcons}
          onSelectSearchHistory={handleSelectSearchHistory}
          onClearSearch={handleClearSearch}
          onVisibleItemIdsChange={handleVisibleItemIdsChange}
          onVisibleHistoryItemIdsChange={handleVisibleHistoryItemIdsChange}
          searchPlaceholder="Search products..."
          showCreateButton={false}
          noResultsMessage="No products found"
          getItemId={(product) => product.id}
          getItemTitle={(product) =>
            buildProductCardTitle(product, cardLookups)
          }
          getItemRows={(product) => buildProductCardRows(product, cardLookups)}
          getItemIconUrl={resolveProductCardIconUrl}
          getItemIconAlt={(product) =>
            buildProductCardTitle(product, cardLookups)
          }
          renderItem={(product) => (
            <ProductItemCard product={product} lookups={cardLookups} />
          )}
          exportFileName="products_filtered_list"
          exportSheetName="Products"
          sidebarTitle="Product List"
          onResolveExportImage={resolveProductExportImage}
          onResolveExportImagesBatch={resolveProductExportImagesBatch}
          onExportCatalog={handleExportCatalog}
        />
      </div>

      {/* Toggle button for sidebar */}
      <div
        className={`${styles.sidebarToggle} ${
          isCollapsed ? styles.collapsed : ''
        }`}
        onClick={() => onToggleCollapse(!isCollapsed)}
      >
        {isCollapsed ? '›' : '‹'}
      </div>

      {isCatalogPreviewOpen ? (
        <div
          className={styles.catalogPreviewBackdrop}
          onClick={handleCloseCatalogPreview}
        >
          <div
            className={styles.catalogPreviewWindow}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.catalogPreviewHeader}>
              <div className={styles.catalogPreviewTitle}>
                Catalog A4 Preview
              </div>
              <div className={styles.catalogPreviewActions}>
                {isPreparingCatalog ? (
                  <span className={styles.catalogPreviewStatus}>
                    Preparing…
                  </span>
                ) : null}
                <button
                  type="button"
                  className={styles.catalogPreviewPrimaryBtn}
                  onClick={handlePrintCatalog}
                  disabled={isPreparingCatalog || !catalogPreviewHtml}
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  className={styles.catalogPreviewBtn}
                  onClick={handleCloseCatalogPreview}
                >
                  Close
                </button>
              </div>
            </div>

            <div className={styles.catalogPreviewFrameWrap}>
              {catalogPreviewHtml ? (
                <iframe
                  ref={catalogPreviewIframeRef}
                  title="Catalog Preview"
                  className={styles.catalogPreviewFrame}
                  srcDoc={catalogPreviewHtml}
                />
              ) : (
                <span className={styles.catalogPreviewLoading}>
                  Preparing catalog preview…
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProductSidebar;
