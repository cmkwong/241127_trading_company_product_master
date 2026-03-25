import { useState, useEffect, useCallback } from 'react';
import styles from './SupplierSidebar.module.css';
import SearchSideBarList from '../../../common/SearchSideBarList/SearchSideBarList';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';

const SupplierSidebar = ({
  onSelectSupplier,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { getSupplierData, suppliers, createNewSupplier } =
    useSupplierContext();
  const { supplierType, services } = useMasterContext();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

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

      return (
        String(name).toLowerCase().includes(lowerSearchTerm) ||
        String(code).toLowerCase().includes(lowerSearchTerm) ||
        String(id).toLowerCase().includes(lowerSearchTerm)
      );
    });

    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  const handleSupplierSelect = useCallback(
    (supplier) => {
      const getSupplierDataSuccess = getSupplierData(supplier.id);
      if (!getSupplierDataSuccess) return;

      setSelectedSupplier(supplier);

      if (windowWidth <= 768) {
        onToggleCollapse(true);
      }

      if (onSelectSupplier) {
        onSelectSupplier(supplier);
      }
    },
    [getSupplierData, windowWidth, onToggleCollapse, onSelectSupplier],
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleCreateSupplier = () => {
    createNewSupplier();
    setSelectedSupplier(null);
  };

  const getSupplierName = useCallback(
    (supplier) => supplier?.name || supplier?.company_name || '-',
    [],
  );

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
      ];
    },
    [supplierType],
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
      ];
    },
    [supplierType],
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
          selectedItemId={selectedSupplier?.id}
          onSelectItem={handleSupplierSelect}
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
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
