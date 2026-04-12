import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './ProductSidebar.module.css';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';

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

const ProductSidebar = ({ onSelectProduct, isCollapsed, onToggleCollapse }) => {
  const {
    getProductData,
    products,
    createNewProduct,
    selectedProductId,
    hydrateProductIcons,
    pageData,
  } = useProductContext();
  const { category, productStatus, productKeywords } = useMasterContext();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const keywordLabelById = useMemo(() => {
    const lookup = new Map();

    (productKeywords || []).forEach((item) => {
      const id = String(item?.id || '').trim();
      const label = String(item?.name || item?.label || '').trim();
      if (!id || !label) return;
      lookup.set(id, label);
    });

    return lookup;
  }, [productKeywords]);

  const getProductKeywordRelations = useCallback(
    (product) => {
      const listRelations = Array.isArray(product?.product_keywords)
        ? product.product_keywords
        : [];

      if (listRelations.length > 0) {
        return listRelations;
      }

      const productId = String(product?.id || '').trim();
      const selectedId = String(pageData?.id || '').trim();

      if (
        productId &&
        selectedId &&
        productId === selectedId &&
        Array.isArray(pageData?.product_keywords)
      ) {
        return pageData.product_keywords;
      }

      return [];
    },
    [pageData],
  );

  const resolveKeywordLabel = useCallback(
    (relation) => {
      if (!relation || typeof relation !== 'object') {
        return '';
      }

      const directLabel = String(
        relation?.keyword_name ||
          relation?.keywordName ||
          relation?.name ||
          relation?.label ||
          relation?.value ||
          relation?.text ||
          relation?.keyword?.name ||
          relation?.keyword?.label ||
          '',
      ).trim();

      if (directLabel) {
        return directLabel;
      }

      const keywordId = String(
        relation?.keyword_id ||
          relation?.keywordId ||
          relation?.master_keyword_id ||
          relation?.masterKeywordId ||
          relation?.keyword?.id ||
          '',
      ).trim();

      if (!keywordId) {
        return '';
      }

      return String(keywordLabelById.get(keywordId) || '').trim();
    },
    [keywordLabelById],
  );

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
    const currentProductList = Array.isArray(products)
      ? products
      : products?.products || [];

    if (!searchTerm.trim()) {
      setFilteredProducts(currentProductList);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = currentProductList.filter((product) => {
      const statusName =
        productStatus.find(
          (item) =>
            item.id === (product?.product_status_id || product?.status_id),
        )?.name ||
        productStatus.find(
          (item) =>
            item.id === (product?.product_status_id || product?.status_id),
        )?.label ||
        '';

      const keywordText =
        getProductKeywordRelations(product)
          .map((relation) => resolveKeywordLabel(relation))
          .filter(Boolean)
          .join(', ') || '';

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
  }, [
    searchTerm,
    products,
    productStatus,
    getProductKeywordRelations,
    resolveKeywordLabel,
  ]);

  useEffect(() => {
    const ids = filteredProducts
      .slice(0, 30)
      .map((item) => item?.id)
      .filter(Boolean);

    if (ids.length > 0) {
      hydrateProductIcons(ids);
    }
  }, [filteredProducts, hydrateProductIcons]);

  const formatDateTime = useCallback((value) => {
    if (!value) return '';
    return String(value)
      .replace('T', ' ')
      .replace(/\.\d{3}Z?$/, '');
  }, []);

  const getProductName = useCallback(
    (product) => product?.product_names?.[0]?.name || '',
    [],
  );

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
          title: String(getProductName(product) || product?.id || '').trim(),
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
      getProductName,
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

        const itemTitle = String(getProductName(item) || '').trim();
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
    [products, getProductName, handleProductSelect],
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

  const handleCreateProduct = () => {
    createNewProduct();
  };

  const getProductRows = useCallback(
    (product) => {
      const categoryLabels =
        product?.product_categories
          ?.map((c) => c.category_id)
          .map((categoryId) => {
            const item = category.find(
              (lookupItem) => lookupItem.id === categoryId,
            );
            return item?.label || item?.name || `Unknown (${categoryId})`;
          }) || [];

      const alibabaIdValues =
        product?.product_alibaba_ids
          ?.map((item) => item.value)
          .filter(Boolean) || [];

      const statusLabel =
        productStatus.find(
          (item) =>
            item.id === (product?.product_status_id || product?.status_id),
        )?.name ||
        productStatus.find(
          (item) =>
            item.id === (product?.product_status_id || product?.status_id),
        )?.label ||
        '';

      const keywordLabels = getProductKeywordRelations(product)
        .map((relation) => resolveKeywordLabel(relation))
        .filter(Boolean);

      return [
        { label: 'Product Keywords:', value: keywordLabels.join(', ') },
        { label: 'ID:', value: product?.id || '' },
        { label: 'Status:', value: statusLabel },
        { label: 'Categories:', value: categoryLabels.join(', ') },
        { label: 'Alibaba:', value: alibabaIdValues.join(', ') },
        { label: 'Created At:', value: formatDateTime(product?.created_at) },
        { label: 'Updated At:', value: formatDateTime(product?.updated_at) },
      ];
    },
    [
      category,
      productStatus,
      formatDateTime,
      getProductKeywordRelations,
      resolveKeywordLabel,
    ],
  );

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
          searchPlaceholder="Search products..."
          onCreate={handleCreateProduct}
          createButtonTitle="Create New Product"
          createButtonAriaLabel="Create New Product"
          noResultsMessage="No products found"
          getItemId={(product) => product.id}
          getItemTitle={getProductName}
          getItemRows={getProductRows}
          getItemIconUrl={(product) => product.icon_url}
          getItemIconAlt={getProductName}
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
    </>
  );
};

export default ProductSidebar;
