import { useState, useEffect, useCallback, useMemo } from 'react';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { useCustomerContext } from '../../../../store/CustomerContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './CustomerSidebar.module.css';

const CUSTOMER_SEARCH_HISTORY_KEY = 'customer_sidebar_search_history';
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
  const icon_url = String(entry.icon_url || entry.iconUrl || '').trim();
  if (!id && !title) return null;

  return { id, title, icon_url };
};

const getPrimaryCustomerName = (customer) => {
  const firstName = customer?.customer_names?.[0]?.name;
  if (String(firstName || '').trim()) {
    return String(firstName).trim();
  }

  if (String(customer?.name || '').trim()) {
    return String(customer.name).trim();
  }

  if (String(customer?.customer_code || '').trim()) {
    return String(customer.customer_code).trim();
  }

  return String(customer?.id || '').trim() || '-';
};

const CustomerSidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { customers, getCustomerData, createNewCustomer, selectedCustomerId } =
    useCustomerContext();
  const { customerType = [], getMasterTableData } = useMasterContext();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const customerTypeRows = useMemo(() => {
    const fallbackRows =
      typeof getMasterTableData === 'function'
        ? getMasterTableData('master_customer_types')
        : [];

    return Array.isArray(customerType) && customerType.length > 0
      ? customerType
      : fallbackRows;
  }, [customerType, getMasterTableData]);

  const customerTypeById = useMemo(() => {
    const map = new Map();
    (customerTypeRows || []).forEach((item) => {
      const id = String(item?.id || '').trim();
      if (!id) return;
      map.set(id, {
        name: String(item?.name || item?.label || id).trim(),
        code: String(item?.code || item?.customer_type_code || '').trim(),
      });
    });
    return map;
  }, [customerTypeRows]);

  const customerList = useMemo(() => {
    return Array.isArray(customers)
      ? customers
      : Array.isArray(customers?.customers)
        ? customers.customers
        : [];
  }, [customers]);

  const searchHistoryWithIcons = useMemo(() => {
    return (searchHistory || []).map((entry) => {
      const normalizedId = String(entry?.id || '').trim();
      if (!normalizedId) {
        return entry;
      }

      const matched = customerList.find(
        (item) => String(item?.id || '').trim() === normalizedId,
      );

      const firstImage = matched?.customer_images?.[0]?.image_url || '';

      return {
        ...entry,
        icon_url: String(firstImage || entry?.icon_url || ''),
      };
    });
  }, [searchHistory, customerList]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(CUSTOMER_SEARCH_HISTORY_KEY);
      const parsed = JSON.parse(raw || '[]');
      const normalized = (Array.isArray(parsed) ? parsed : [])
        .map(normalizeHistoryEntry)
        .filter(Boolean)
        .slice(0, MAX_SEARCH_HISTORY_ITEMS);
      setSearchHistory(normalized);
    } catch (error) {
      console.error('Failed to load customer search history:', error);
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customerList);
      return;
    }

    const query = searchTerm.toLowerCase();

    const filtered = customerList.filter((customer) => {
      const searchable = [
        customer?.id,
        customer?.customer_code,
        customer?.remark,
        getPrimaryCustomerName(customer),
        ...(customer?.customer_names || []).map((item) => item?.name),
        customer?.created_at,
        customer?.updated_at,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });

    setFilteredCustomers(filtered);
  }, [searchTerm, customerList]);

  const formatDateTime = useCallback((value) => {
    if (!value) return '';
    return String(value)
      .replace('T', ' ')
      .replace(/\.\d{3}Z?$/, '');
  }, []);

  const formatCustomerTypeLabel = useCallback(
    (customer) => {
      const selectedTypeIds = (customer?.customer_types || [])
        .map((item) => String(item?.customer_type_id || '').trim())
        .filter(Boolean);

      return selectedTypeIds
        .map((typeId) => {
          const typeMeta = customerTypeById.get(typeId);
          if (!typeMeta) {
            return typeId;
          }

          if (typeMeta.code && typeMeta.code !== typeMeta.name) {
            return `${typeMeta.name} (${typeMeta.code})`;
          }

          return typeMeta.name;
        })
        .join(', ');
    },
    [customerTypeById],
  );

  const saveSearchHistory = useCallback((updater) => {
    setSearchHistory((prev) => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          CUSTOMER_SEARCH_HISTORY_KEY,
          JSON.stringify(next),
        );
      }
      return next;
    });
  }, []);

  const handleCustomerSelect = useCallback(
    (customer) => {
      const success = getCustomerData(customer.id);
      if (!success) return;

      if (windowWidth <= 768) {
        onToggleCollapse(true);
      }

      const iconUrl = customer?.customer_images?.[0]?.image_url || '';

      saveSearchHistory((prev) => {
        const entry = {
          id: String(customer?.id || '').trim(),
          title: String(getPrimaryCustomerName(customer)).trim(),
          icon_url: String(iconUrl).trim(),
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
    [getCustomerData, onToggleCollapse, saveSearchHistory, windowWidth],
  );

  const handleSelectSearchHistory = useCallback(
    (entry) => {
      const normalized = normalizeHistoryEntry(entry);
      if (!normalized) return;

      const found = customerList.find((item) => {
        const byId =
          normalized.id && String(item?.id || '').trim() === normalized.id;
        if (byId) return true;

        const title = String(getPrimaryCustomerName(item)).toLowerCase();
        return !normalized.id && title === normalized.title.toLowerCase();
      });

      if (found) {
        handleCustomerSelect(found);
        return;
      }

      setSearchTerm(normalized.title);
    },
    [customerList, handleCustomerSelect],
  );

  const getCustomerRows = useCallback(
    (customer) => {
      return [
        { label: 'ID:', value: customer?.id || '' },
        {
          label: 'Code:',
          value: customer?.customer_code || customer?.code || '',
        },
        { label: 'Name:', value: getPrimaryCustomerName(customer) },
        { label: 'Type:', value: formatCustomerTypeLabel(customer) },
        { label: 'Created At:', value: formatDateTime(customer?.created_at) },
        { label: 'Updated At:', value: formatDateTime(customer?.updated_at) },
      ];
    },
    [formatCustomerTypeLabel, formatDateTime],
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
          items={filteredCustomers}
          selectedItemId={selectedCustomerId}
          onSelectItem={handleCustomerSelect}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchHistory={searchHistoryWithIcons}
          onSelectSearchHistory={handleSelectSearchHistory}
          onClearSearch={() => setSearchTerm('')}
          searchPlaceholder="Search customers..."
          onCreate={createNewCustomer}
          createButtonTitle="Create New Customer"
          createButtonAriaLabel="Create New Customer"
          noResultsMessage="No customers found"
          getItemId={(customer) => customer.id}
          getItemTitle={(customer) => getPrimaryCustomerName(customer)}
          getItemRows={getCustomerRows}
          getItemIconUrl={(customer) =>
            customer?.customer_images?.[0]?.image_url
          }
          getItemIconAlt={(customer) => getPrimaryCustomerName(customer)}
          exportFileName="customers_filtered_list"
          exportSheetName="Customers"
        />
      </div>

      <div
        className={`${styles.sidebarToggle} ${isCollapsed ? styles.collapsed : ''}`}
        onClick={() => onToggleCollapse(!isCollapsed)}
      >
        {isCollapsed ? '›' : '‹'}
      </div>
    </>
  );
};

export default CustomerSidebar;
