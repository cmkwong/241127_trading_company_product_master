import { useState, useEffect, useMemo, useCallback } from 'react';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import styles from './SalesQuotationSidebar.module.css';

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

const SalesQuotationSidebar = ({
  quotations = [],
  selectedQuotationId,
  onSelectQuotation,
  onCreateQuotation,
  isCollapsed,
  onToggleCollapse,
  customerOptions = [],
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
      map.set(id, String(item?.name || item?.label || item?.id || '').trim());
    });
    return map;
  }, [customerOptions]);

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
      const shortId = String(quotation?.id || '').slice(0, 8) || 'new';
      return `SQ-${shortId} | ${customerName}`;
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
      const summary = [
        quotation?.id,
        quotation?.remark,
        quotation?.customer_id,
        quotation?.customer_address_id,
        customerName,
        quotation?.to_order ? 'ordered' : 'pending',
        quotation?.created_at,
        quotation?.updated_at,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return summary.includes(query);
    });
  }, [searchTerm, quotations, customerNameById]);

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

  const getQuotationRows = useCallback(
    (quotation) => [
      {
        label: 'Status:',
        value: quotation?.to_order ? 'Ordered' : 'Open Quotation',
      },
      {
        label: 'Customer:',
        value:
          customerNameById.get(String(quotation?.customer_id || '').trim()) ||
          '',
      },
      {
        label: 'Shipping:',
        value: String(quotation?.sales_shipping_details?.length || 0),
      },
      {
        label: 'Products:',
        value: String(quotation?.sales_product_details?.length || 0),
      },
      {
        label: 'Services:',
        value: String(quotation?.sales_service_details?.length || 0),
      },
      {
        label: 'Updated At:',
        value: formatDateTime(quotation?.updated_at),
      },
    ],
    [customerNameById, formatDateTime],
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
          searchPlaceholder="Search sales quotations..."
          onCreate={onCreateQuotation}
          createButtonTitle="Create New Sales Quotation"
          createButtonAriaLabel="Create New Sales Quotation"
          noResultsMessage="No sales quotations found"
          getItemId={(quotation) => quotation.id}
          getItemTitle={getQuotationTitle}
          getItemRows={getQuotationRows}
          exportFileName="sales_quotations_filtered_list"
          exportSheetName="Sales Quotations"
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

export default SalesQuotationSidebar;
