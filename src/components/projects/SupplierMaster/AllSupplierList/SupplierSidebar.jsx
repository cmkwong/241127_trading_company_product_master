import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './SupplierSidebar.module.css';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';

const SUPPLIER_SEARCH_HISTORY_KEY = 'supplier_sidebar_search_history';
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

const SupplierSidebar = ({
  onSelectSupplier,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { getSupplierData, suppliers, createNewSupplier, selectedSupplierId } =
    useSupplierContext();
  const { supplierType, services } = useMasterContext();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  const searchHistoryWithIcons = useMemo(() => {
    const currentSupplierList = Array.isArray(suppliers)
      ? suppliers
      : suppliers?.suppliers || [];

    return (searchHistory || []).map((entry) => {
      const normalizedId = String(entry?.id || '').trim();
      if (!normalizedId) {
        return entry;
      }

      const matchedSupplier = currentSupplierList.find(
        (item) => String(item?.id || '').trim() === normalizedId,
      );

      return {
        ...entry,
        icon_url: String(matchedSupplier?.icon_url || entry?.icon_url || ''),
      };
    });
  }, [searchHistory, suppliers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(SUPPLIER_SEARCH_HISTORY_KEY);
      const parsed = JSON.parse(raw || '[]');
      const normalized = (Array.isArray(parsed) ? parsed : [])
        .map(normalizeHistoryEntry)
        .filter(Boolean)
        .slice(0, MAX_SEARCH_HISTORY_ITEMS);
      setSearchHistory(normalized);
    } catch (error) {
      console.error('Failed to load supplier search history:', error);
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    const currentSupplierList = Array.isArray(suppliers)
      ? suppliers
      : suppliers?.suppliers || [];

    if (!searchTerm.trim()) {
      setFilteredSuppliers(currentSupplierList);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = currentSupplierList.filter((supplier) => {
      const name = supplier?.name || supplier?.company_name || '';
      const code = supplier?.code || '';
      const id = supplier?.id || '';
      const createdAt = supplier?.created_at || '';
      const updatedAt = supplier?.updated_at || '';

      return (
        String(name).toLowerCase().includes(lowerSearchTerm) ||
        String(code).toLowerCase().includes(lowerSearchTerm) ||
        String(id).toLowerCase().includes(lowerSearchTerm) ||
        String(createdAt).toLowerCase().includes(lowerSearchTerm) ||
        String(updatedAt).toLowerCase().includes(lowerSearchTerm)
      );
    });

    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  const formatDateTime = useCallback((value) => {
    if (!value) return '';
    return String(value)
      .replace('T', ' ')
      .replace(/\.\d{3}Z?$/, '');
  }, []);

  const getSupplierName = useCallback(
    (supplier) => supplier?.name || supplier?.company_name || '-',
    [],
  );

  const saveSearchHistory = useCallback((updater) => {
    setSearchHistory((prev) => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          SUPPLIER_SEARCH_HISTORY_KEY,
          JSON.stringify(next),
        );
      }
      return next;
    });
  }, []);

  const handleSupplierSelect = useCallback(
    (supplier) => {
      const getSupplierDataSuccess = getSupplierData(supplier.id);
      if (!getSupplierDataSuccess) return;

      if (windowWidth <= 768) {
        onToggleCollapse(true);
      }

      if (onSelectSupplier) {
        onSelectSupplier(supplier);
      }

      saveSearchHistory((prev) => {
        const entry = {
          id: String(supplier?.id || '').trim(),
          title: String(getSupplierName(supplier) || supplier?.id || '').trim(),
          icon_url: String(supplier?.icon_url || '').trim(),
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
      getSupplierData,
      windowWidth,
      onToggleCollapse,
      onSelectSupplier,
      saveSearchHistory,
      getSupplierName,
    ],
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSelectSearchHistory = useCallback(
    (entry) => {
      const normalized = normalizeHistoryEntry(entry);
      if (!normalized) return;

      const currentSupplierList = Array.isArray(suppliers)
        ? suppliers
        : suppliers?.suppliers || [];

      const found = currentSupplierList.find((item) => {
        const byId =
          normalized.id && String(item?.id || '').trim() === normalized.id;
        if (byId) return true;

        const itemTitle = String(getSupplierName(item) || '').trim();
        return (
          !normalized.id &&
          itemTitle &&
          itemTitle.toLowerCase() === normalized.title.toLowerCase()
        );
      });

      if (found) {
        handleSupplierSelect(found);
        return;
      }

      setSearchTerm(normalized.title);
    },
    [suppliers, getSupplierName, handleSupplierSelect],
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleCreateSupplier = () => {
    createNewSupplier();
  };

  const getSupplierRows = useCallback(
    (supplier) => {
      const relationTypeIds =
        supplier?.supplier_types?.map((item) => item.supplier_type_id) || [];

      const selectedTypeIds =
        relationTypeIds.length > 0
          ? relationTypeIds
          : supplier?.supplier_type_id
            ? [supplier.supplier_type_id]
            : [];

      const supplierTypeLabel = selectedTypeIds
        .map(
          (id) =>
            supplierType.find((item) => item.id === id)?.label ||
            supplierType.find((item) => item.id === id)?.name ||
            '',
        )
        .filter(Boolean)
        .join(', ');

      return [
        { label: 'ID:', value: supplier?.id || '' },
        {
          label: 'Code:',
          value: supplier?.code || supplier?.supplier_code || '',
        },
        { label: 'Type:', value: supplierTypeLabel },
        { label: 'Created At:', value: formatDateTime(supplier?.created_at) },
        { label: 'Updated At:', value: formatDateTime(supplier?.updated_at) },
      ];
    },
    [supplierType, formatDateTime],
  );

  const getSupplierExpandedRows = useCallback(
    (supplier) => {
      const relationTypeIds =
        supplier?.supplier_types?.map((item) => item.supplier_type_id) || [];

      const selectedTypeIds =
        relationTypeIds.length > 0
          ? relationTypeIds
          : supplier?.supplier_type_id
            ? [supplier.supplier_type_id]
            : [];

      const supplierTypeLabel = selectedTypeIds
        .map(
          (id) =>
            supplierType.find((item) => item.id === id)?.label ||
            supplierType.find((item) => item.id === id)?.name ||
            '',
        )
        .filter(Boolean)
        .join(', ');

      return [
        { label: 'ID:', value: supplier?.id || '' },
        {
          label: 'Code:',
          value: supplier?.code || supplier?.supplier_code || '',
        },
        { label: 'Type:', value: supplierTypeLabel },
        { label: 'Created At:', value: formatDateTime(supplier?.created_at) },
        { label: 'Updated At:', value: formatDateTime(supplier?.updated_at) },
      ];
    },
    [supplierType, formatDateTime],
  );

  const getSupplierExpandedSubRows = useCallback(
    (supplier) => {
      const supplierServices = supplier?.supplier_services || [];

      return supplierServices.map((service, index) => {
        const matchedService = (services || []).find(
          (item) => item.id === service?.service_id,
        );

        const serviceName =
          matchedService?.service_name ||
          matchedService?.label ||
          matchedService?.name ||
          `Service ${index + 1}`;

        // Only use blob URLs (image_url) as set by context loader
        const images = (service?.supplier_service_images || [])
          .filter(
            (image) =>
              typeof image?.image_url === 'string' &&
              image.image_url.startsWith('blob:'),
          )
          .map((image) => ({
            type: 'image',
            url: image.image_url,
            text: image?.image_name || '',
            alt: image?.image_name || 'service-image',
          }));

        return {
          title: serviceName,
          fields: [
            {
              label: 'Service Type',
              value: serviceName,
            },
            {
              label: 'HyperLinks',
              value:
                String(service?.link || '').trim().length > 0
                  ? [
                      {
                        type: 'link',
                        href: service.link,
                        text: service.link,
                      },
                    ]
                  : [],
            },
            {
              label: 'Remarks',
              value: service?.remark || '',
            },
            {
              label: 'Images',
              value: images,
            },
          ],
        };
      });
    },
    [services],
  );

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
          items={filteredSuppliers}
          selectedItemId={selectedSupplierId}
          onSelectItem={handleSupplierSelect}
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
          searchHistory={searchHistoryWithIcons}
          onSelectSearchHistory={handleSelectSearchHistory}
          onClearSearch={handleClearSearch}
          searchPlaceholder="Search suppliers..."
          onCreate={handleCreateSupplier}
          createButtonTitle="Create New Supplier"
          createButtonAriaLabel="Create New Supplier"
          noResultsMessage="No suppliers found"
          getItemId={(supplier) => supplier.id}
          getItemTitle={getSupplierName}
          getItemRows={getSupplierRows}
          getExpandedRows={getSupplierExpandedRows}
          getExpandedSubRows={getSupplierExpandedSubRows}
          getItemIconAlt={getSupplierName}
        />
      </div>

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

export default SupplierSidebar;
