import { useState, useEffect, useMemo, useCallback } from 'react';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import styles from './SalesSidebar.module.css';
import {
  computeQuotationTotals,
  convertCurrencyToBase,
  formatMoney,
  toSafeString,
} from '../utils/quotationTotals';
import { STATUS_OPTIONS } from '../SalesBasicInfo/Main_SalesBasicInfo';

const SALES_QUOTATION_SEARCH_HISTORY_KEY =
  'sales_quotation_sidebar_search_history';
const MAX_SEARCH_HISTORY_ITEMS = 15;

const normalizeHistoryEntry = (entry) => {
  if (typeof entry === 'string') {
    const title = String(entry || '').trim();
    if (!title) return null;
    return { id: '', title };
  }

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const id = String(entry.id || '').trim();
  const title = String(entry.title || '').trim();

  if (!id && !title) {
    return null;
  }

  return { id, title };
};

const FILE_SERVER_BASE_URL = 'http://localhost:3001';

const resolveIconUrl = (iconUrl) => {
  const normalized = String(iconUrl || '').trim();
  if (!normalized) {
    return '';
  }

  if (/^(blob:|data:|https?:\/\/)/i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return `${FILE_SERVER_BASE_URL}${normalized}`;
  }

  return `${FILE_SERVER_BASE_URL}/${normalized}`;
};

const SalesSidebar = ({
  quotations = [],
  selectedQuotationId,
  onSelectQuotation,
  isCollapsed,
  onToggleCollapse,
  customerOptions = [],
  productOptions = [],
  baseCurrencyCode = 'HKD',
  currencyCodeById = {},
  exchangeRateMap = { HKD: 1 },
  docTypeOptions = [],
  purchaseCosts = null,
  searchPlaceholder = 'Search sales quotations...',
  noResultsMessage = 'No sales quotations found',
  sidebarTitle = 'Quotation List',
  exportFileName = 'sales_quotations_filtered_list',
  exportSheetName = 'Sales Quotations',
}) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  const customerNameById = useMemo(() => {
    const map = new Map();
    (customerOptions || []).forEach((item) => {
      const id = String(item?.id || '').trim();
      if (!id) return;
      map.set(
        id,
        String(
          item?.customer_display_name ||
            item?.display_name ||
            item?.customer_name ||
            item?.name ||
            item?.label ||
            item?.id ||
            '',
        ).trim(),
      );
    });
    return map;
  }, [customerOptions]);

  const productOptionById = useMemo(() => {
    const map = new Map();

    (productOptions || []).forEach((item) => {
      const id = String(item?.id || '').trim();
      if (!id || map.has(id)) {
        return;
      }

      map.set(id, item);
    });

    return map;
  }, [productOptions]);

  const docTypeById = useMemo(() => {
    const map = new Map();

    (docTypeOptions || []).forEach((item) => {
      const id = String(item?.id || '').trim();
      if (!id) return;
      map.set(id, {
        name: String(item?.name || item?.label || '').trim(),
        color: String(item?.color_code || '').trim(),
      });
    });

    return map;
  }, [docTypeOptions]);

  const quotationTotalsById = useMemo(() => {
    const map = new Map();

    (quotations || []).forEach((quotation) => {
      const id = String(quotation?.id || '').trim();
      if (!id) return;
      map.set(
        id,
        computeQuotationTotals(quotation, {
          baseCurrencyCode,
          currencyCodeById,
          exchangeRateMap,
        }),
      );
    });

    return map;
  }, [quotations, baseCurrencyCode, currencyCodeById, exchangeRateMap]);

  const purchaseCostTotals = useMemo(() => {
    const sumRows = (rows) =>
      (Array.isArray(rows) ? rows : []).reduce((total, row) => {
        const converted = convertCurrencyToBase(
          row?.price,
          row?.currency_code,
          baseCurrencyCode,
          exchangeRateMap,
        );
        return Number.isFinite(converted) ? total + converted : total;
      }, 0);

    const shippingTotal = sumRows(purchaseCosts?.shipping_costs);
    const productTotal = sumRows(purchaseCosts?.product_costs);
    const serviceTotal = sumRows(purchaseCosts?.service_costs);

    return {
      hasPoData:
        !!purchaseCosts &&
        ((Array.isArray(purchaseCosts?.shipping_costs) &&
          purchaseCosts.shipping_costs.length > 0) ||
          (Array.isArray(purchaseCosts?.product_costs) &&
            purchaseCosts.product_costs.length > 0) ||
          (Array.isArray(purchaseCosts?.service_costs) &&
            purchaseCosts.service_costs.length > 0)),
      total: shippingTotal + productTotal + serviceTotal,
    };
  }, [purchaseCosts, baseCurrencyCode, exchangeRateMap]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(
        SALES_QUOTATION_SEARCH_HISTORY_KEY,
      );
      const parsed = JSON.parse(raw || '[]');
      const normalized = (Array.isArray(parsed) ? parsed : [])
        .map(normalizeHistoryEntry)
        .filter(Boolean)
        .slice(0, MAX_SEARCH_HISTORY_ITEMS);

      setSearchHistory(normalized);
    } catch (error) {
      console.error('Failed to load sales quotation search history:', error);
      setSearchHistory([]);
    }
  }, []);

  const saveSearchHistory = useCallback((updater) => {
    setSearchHistory((prev) => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          SALES_QUOTATION_SEARCH_HISTORY_KEY,
          JSON.stringify(next),
        );
      }
      return next;
    });
  }, []);

  const formatDateTime = useCallback((value) => {
    if (!value) return '';
    return String(value)
      .replace('T', ' ')
      .replace(/\.\d{3}Z?$/, '');
  }, []);

  const getQuotationTitle = useCallback(
    (quotation) => {
      const customerName =
        customerNameById.get(String(quotation?.customer_id || '').trim()) ||
        'Unknown Customer';
      return customerName;
    },
    [customerNameById],
  );

  const filteredQuotations = useMemo(() => {
    if (!searchTerm.trim()) {
      return quotations;
    }

    const query = searchTerm.toLowerCase();

    return (quotations || []).filter((quotation) => {
      const customerName =
        customerNameById.get(String(quotation?.customer_id || '').trim()) || '';
      const docTypeName =
        docTypeById.get(String(quotation?.doc_type || '').trim())?.name || '';
      const summary = [
        quotation?.id,
        quotation?.remark,
        quotation?.customer_id,
        quotation?.customer_address_id,
        customerName,
        docTypeName,
        quotation?.status || 'draft',
        quotation?.created_at,
        quotation?.updated_at,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return summary.includes(query);
    });
  }, [searchTerm, quotations, customerNameById, docTypeById]);

  const handleQuotationSelect = useCallback(
    (quotation) => {
      onSelectQuotation?.(quotation);

      if (windowWidth <= 768) {
        onToggleCollapse?.(true);
      }

      saveSearchHistory((prev) => {
        const entry = {
          id: String(quotation?.id || '').trim(),
          title: getQuotationTitle(quotation),
        };

        const deduped = prev.filter((item) => {
          if (entry.id && item.id) {
            return item.id !== entry.id;
          }

          return (
            String(item?.title || '').toLowerCase() !==
            String(entry?.title || '').toLowerCase()
          );
        });

        return [entry, ...deduped].slice(0, MAX_SEARCH_HISTORY_ITEMS);
      });
    },
    [
      onSelectQuotation,
      windowWidth,
      onToggleCollapse,
      saveSearchHistory,
      getQuotationTitle,
    ],
  );

  const handleSelectSearchHistory = useCallback(
    (entry) => {
      const normalized = normalizeHistoryEntry(entry);
      if (!normalized) return;

      const found = (quotations || []).find((item) => {
        const byId =
          normalized.id && String(item?.id || '').trim() === normalized.id;
        if (byId) return true;

        const title = getQuotationTitle(item).toLowerCase();
        return !normalized.id && title === normalized.title.toLowerCase();
      });

      if (found) {
        handleQuotationSelect(found);
        return;
      }

      setSearchTerm(normalized.title);
    },
    [quotations, getQuotationTitle, handleQuotationSelect],
  );

  const resolveStatusOption = useCallback((statusId) => {
    const normalized = toSafeString(statusId).toLowerCase();
    return (
      STATUS_OPTIONS.find((opt) => opt.id === normalized) || STATUS_OPTIONS[0]
    );
  }, []);

  const getQuotationRows = useCallback(
    (quotation) => {
      const quotationId = String(quotation?.id || '').trim();
      const summary = quotationTotalsById.get(quotationId);

      const statusOption = resolveStatusOption(quotation?.status || 'open');
      const docType = docTypeById.get(
        String(quotation?.doc_type || '').trim(),
      );
      const isSelected =
        String(selectedQuotationId || '').trim() === quotationId;
      const hasRealCost = isSelected && purchaseCostTotals.hasPoData;

      const sales = summary?.grandTotal;
      const estimatedCost = summary?.costGrandTotal;
      const realCost = hasRealCost ? purchaseCostTotals.total : null;

      const estimatedProfitPercent =
        Number.isFinite(estimatedCost) && estimatedCost > 0
          ? ((sales - estimatedCost) / estimatedCost) * 100
          : null;
      const realProfitPercent =
        Number.isFinite(realCost) && realCost > 0
          ? ((sales - realCost) / realCost) * 100
          : null;

      const currencyCode =
        toSafeString(summary?.baseCurrencyCode) || toSafeString(baseCurrencyCode);

      return [
        {
          label: 'Status:',
          value: statusOption.name,
          color: statusOption.color,
        },
        {
          label: 'Document Type:',
          value: docType?.name || '',
          color: docType?.color || undefined,
        },
        {
          label: 'Customer:',
          value:
            customerNameById.get(String(quotation?.customer_id || '').trim()) ||
            '',
        },
        {
          label: 'Estimated Cost:',
          value: `${currencyCode} ${formatMoney(estimatedCost)}`,
        },
        {
          label: 'Real Cost:',
          value: Number.isFinite(realCost)
            ? `${currencyCode} ${formatMoney(realCost)}`
            : '-',
        },
        {
          label: 'Estimated Profit %:',
          value: Number.isFinite(estimatedProfitPercent)
            ? `${estimatedProfitPercent.toFixed(2)}%`
            : '-',
        },
        {
          label: 'Real Profit %:',
          value: Number.isFinite(realProfitPercent)
            ? `${realProfitPercent.toFixed(2)}%`
            : '-',
        },
        {
          label: 'Updated At:',
          value: formatDateTime(quotation?.updated_at),
        },
        {
          label: 'Created At:',
          value: formatDateTime(quotation?.created_at),
        },
      ];
    },
    [
      baseCurrencyCode,
      customerNameById,
      docTypeById,
      formatDateTime,
      purchaseCostTotals,
      quotationTotalsById,
      resolveStatusOption,
      selectedQuotationId,
    ],
  );

  const getQuotationIconUrl = useCallback(
    (quotation) => {
      const firstProductId = String(
        quotation?.sales_product_details?.[0]?.product_id || '',
      ).trim();

      if (!firstProductId) {
        return '';
      }

      const product = productOptionById.get(firstProductId);
      return resolveIconUrl(product?.icon_url);
    },
    [productOptionById],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      >
        <SearchSideBarList
          items={filteredQuotations}
          selectedItemId={selectedQuotationId}
          onSelectItem={handleQuotationSelect}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchHistory={searchHistory}
          onSelectSearchHistory={handleSelectSearchHistory}
          onClearSearch={() => setSearchTerm('')}
          searchPlaceholder={searchPlaceholder}
          showCreateButton={false}
          noResultsMessage={noResultsMessage}
          getItemId={(quotation) => quotation.id}
          getItemTitle={getQuotationTitle}
          getItemRows={getQuotationRows}
          getItemIconUrl={getQuotationIconUrl}
          getItemIconAlt={(quotation) => {
            const customerName = getQuotationTitle(quotation);
            return customerName ? `${customerName} product` : 'Product';
          }}
          exportFileName={exportFileName}
          exportSheetName={exportSheetName}
          sidebarTitle={sidebarTitle}
        />
      </div>

      <div
        className={`${styles.sidebarToggle} ${
          isCollapsed ? styles.collapsed : ''
        }`}
        onClick={() => onToggleCollapse?.(!isCollapsed)}
      >
        {isCollapsed ? '>' : '<'}
      </div>
    </>
  );
};

export default SalesSidebar;
