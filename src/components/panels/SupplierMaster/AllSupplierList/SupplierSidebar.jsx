import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SupplierSidebar.module.css';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import {
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';

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
  const navigate = useNavigate();
  const {
    getSupplierData,
    suppliers,
    selectedSupplierId,
    setSelectedSupplierId,
  } = useSupplierContext();
  const { supplierType, services } = useMasterContext();
  const pageSupplierId = useEntityField('supplier', 'id');
  const pageSupplierName = useEntityField('supplier', 'name');
  const pageSupplierCode = useEntityField('supplier', 'supplier_code');
  const pageSupplierCodeCompat = useEntityField('supplier', 'code');
  const pageSupplierStatus = useEntityField('supplier', 'status');
  const pageSupplierScore = useEntityField('supplier', 'score');
  const pageSupplierTypeId = useEntityField('supplier', 'supplier_type_id');
  const pageSupplierTypes = useEntityRows('supplier', 'supplier_types');

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  const supplierListForSidebar = useMemo(() => {
    const baseList = Array.isArray(suppliers)
      ? suppliers
      : suppliers?.suppliers || [];

    const normalizedPageId = String(pageSupplierId || '').trim();
    const normalizedSelectedId = String(selectedSupplierId || '').trim();

    if (!normalizedPageId || normalizedPageId !== normalizedSelectedId) {
      return baseList;
    }

    const existsInList = baseList.some(
      (item) => String(item?.id || '').trim() === normalizedPageId,
    );

    if (existsInList) {
      return baseList;
    }

    const draftSupplier = {
      id: normalizedPageId,
      name: String(pageSupplierName || '').trim(),
      supplier_code: String(pageSupplierCode || '').trim(),
      code: String(pageSupplierCodeCompat || pageSupplierCode || '').trim(),
      status: String(pageSupplierStatus || 'active').trim() || 'active',
      score: pageSupplierScore,
      supplier_type_id: String(pageSupplierTypeId || '').trim(),
      supplier_types: Array.isArray(pageSupplierTypes) ? pageSupplierTypes : [],
      _isContextDraft: true,
    };

    return [draftSupplier, ...baseList];
  }, [
    suppliers,
    pageSupplierId,
    selectedSupplierId,
    pageSupplierName,
    pageSupplierCode,
    pageSupplierCodeCompat,
    pageSupplierStatus,
    pageSupplierScore,
    pageSupplierTypeId,
    pageSupplierTypes,
  ]);

  const searchHistoryWithIcons = useMemo(() => {
    const currentSupplierList = supplierListForSidebar;

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
  }, [searchHistory, supplierListForSidebar]);

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
    const currentSupplierList = supplierListForSidebar;

    if (!searchTerm.trim()) {
      setFilteredSuppliers(currentSupplierList);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = currentSupplierList.filter((supplier) => {
      const name = supplier?.name || '';
      const code = supplier?.code || '';
      const id = supplier?.id || '';
      const status = supplier?.status || '';
      const createdAt = supplier?.created_at || '';
      const updatedAt = supplier?.updated_at || '';

      return (
        String(name).toLowerCase().includes(lowerSearchTerm) ||
        String(code).toLowerCase().includes(lowerSearchTerm) ||
        String(id).toLowerCase().includes(lowerSearchTerm) ||
        String(status).toLowerCase().includes(lowerSearchTerm) ||
        String(createdAt).toLowerCase().includes(lowerSearchTerm) ||
        String(updatedAt).toLowerCase().includes(lowerSearchTerm)
      );
    });

    setFilteredSuppliers(filtered);
  }, [searchTerm, supplierListForSidebar]);

  const formatDateTime = useCallback((value) => {
    if (!value) return '';
    return String(value)
      .replace('T', ' ')
      .replace(/\.\d{3}Z?$/, '');
  }, []);

  const getSupplierName = useCallback((supplier) => supplier?.name || '-', []);

  const supplierTypeById = useMemo(() => {
    const map = new Map();
    (supplierType || []).forEach((item) => {
      const id = String(item?.id || '').trim();
      if (id) {
        map.set(id, item);
      }
    });
    return map;
  }, [supplierType]);

  const formatSupplierTypeLabel = useCallback(
    (supplier) => {
      const relationTypeIds =
        supplier?.supplier_types?.map((item) => item.supplier_type_id) || [];

      const selectedTypeIds =
        relationTypeIds.length > 0
          ? relationTypeIds
          : supplier?.supplier_type_id
            ? [supplier.supplier_type_id]
            : [];

      const levelCache = new Map();
      const getLevel = (rawId, stack = new Set()) => {
        const id = String(rawId || '').trim();
        if (!id) return 0;
        if (levelCache.has(id)) return levelCache.get(id);
        if (stack.has(id)) return 0;

        const current = supplierTypeById.get(id);
        if (!current) {
          levelCache.set(id, 0);
          return 0;
        }

        const parentId = String(current?.parent_id || '').trim();
        if (!parentId || !supplierTypeById.has(parentId)) {
          levelCache.set(id, 0);
          return 0;
        }

        const nextStack = new Set(stack);
        nextStack.add(id);
        const level = getLevel(parentId, nextStack) + 1;
        levelCache.set(id, level);
        return level;
      };

      return selectedTypeIds
        .map((rawId, index) => {
          const id = String(rawId || '').trim();
          if (!id) return null;

          const item = supplierTypeById.get(id);
          const label = String(item?.label || item?.name || '').trim();
          if (!label) return null;

          return {
            id,
            label,
            level: getLevel(id),
            index,
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return a.index - b.index;
        })
        .map((item) => item.label)
        .join(', ');
    },
    [supplierTypeById],
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
      const isContextDraft = Boolean(supplier?._isContextDraft);

      if (isContextDraft) {
        setSelectedSupplierId(String(supplier?.id || '').trim() || null);
        navigate('/panel/supplier_master', { replace: true });

        if (windowWidth <= 768) {
          onToggleCollapse(true);
        }

        if (onSelectSupplier) {
          onSelectSupplier(supplier);
        }

        return;
      }

      const getSupplierDataSuccess = getSupplierData(supplier.id);
      if (!getSupplierDataSuccess) return;

      navigate(`/panel/supplier_master/${supplier.id}`, { replace: true });

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
      navigate,
      setSelectedSupplierId,
    ],
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSelectSearchHistory = useCallback(
    (entry) => {
      const normalized = normalizeHistoryEntry(entry);
      if (!normalized) return;

      const currentSupplierList = supplierListForSidebar;

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
    [supplierListForSidebar, getSupplierName, handleSupplierSelect],
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const getSupplierRows = useCallback(
    (supplier) => {
      const supplierTypeLabel = formatSupplierTypeLabel(supplier);
      const status = String(supplier?.status || 'active').trim();
      const statusLabel =
        status.length > 0
          ? `${status.charAt(0).toUpperCase()}${status.slice(1)}`
          : 'Active';

      return [
        { label: 'ID:', value: supplier?.id || '' },
        {
          label: 'Code:',
          value: supplier?.code || supplier?.supplier_code || '',
        },
        { label: 'Status:', value: statusLabel },
        { label: 'Score:', value: supplier?.score ?? '' },
        { label: 'Type:', value: supplierTypeLabel },
        { label: 'Created At:', value: formatDateTime(supplier?.created_at) },
        { label: 'Updated At:', value: formatDateTime(supplier?.updated_at) },
      ];
    },
    [formatDateTime, formatSupplierTypeLabel],
  );

  const getSupplierExpandedRows = useCallback(
    (supplier) => {
      const supplierTypeLabel = formatSupplierTypeLabel(supplier);
      const status = String(supplier?.status || 'active').trim();
      const statusLabel =
        status.length > 0
          ? `${status.charAt(0).toUpperCase()}${status.slice(1)}`
          : 'Active';

      return [
        { label: 'ID:', value: supplier?.id || '' },
        {
          label: 'Code:',
          value: supplier?.code || supplier?.supplier_code || '',
        },
        { label: 'Status:', value: statusLabel },
        { label: 'Score:', value: supplier?.score ?? '' },
        { label: 'Type:', value: supplierTypeLabel },
        { label: 'Created At:', value: formatDateTime(supplier?.created_at) },
        { label: 'Updated At:', value: formatDateTime(supplier?.updated_at) },
      ];
    },
    [formatDateTime, formatSupplierTypeLabel],
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

        const files = (service?.supplier_service_files || [])
          .filter((file) => typeof file?.file_url === 'string')
          .map((file) => ({
            type: 'link',
            href: file.file_url,
            text: file?.file_name || file?.file_url || '',
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
              label: 'Files',
              value: files,
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
          showCreateButton={false}
          noResultsMessage="No suppliers found"
          getItemId={(supplier) => supplier.id}
          getItemTitle={getSupplierName}
          getItemRows={getSupplierRows}
          getExpandedRows={getSupplierExpandedRows}
          getExpandedSubRows={getSupplierExpandedSubRows}
          getItemIconAlt={getSupplierName}
          exportFileName="suppliers_filtered_list"
          exportSheetName="Suppliers"
          sidebarTitle="Supplier List"
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
