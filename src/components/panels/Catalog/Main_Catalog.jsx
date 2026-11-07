import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './Main_Catalog.module.css';
import Divider from '../../common/Container/Divider';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import { useCatalogContext } from '../../../store/CatalogContext';
import { useProductContext } from '../../../store/ProductContext';
import { useMasterContext } from '../../../store/MasterContext';
import { useEntityField, useEntityRows, upsertEntityData } from '../../../store/GeneralContext';
import CatalogSidebar from './AllCatalogList/CatalogSidebar';
import CatalogSavePageContainer from './Container/CatalogSavePageContainer';
import CatalogHeaderForm from './Header/CatalogHeaderForm';
import CatalogRowList from './Rows/CatalogRowList';
import CatalogProductPickerModal from './ProductPicker/CatalogProductPickerModal';
import CatalogPrintPreviewModal from './Print/CatalogPrintPreviewModal';
import {
  buildCatalogRows,
  getDefaultDisplayAttributeIds,
  normalizeCatalogBundle,
} from '../ProductMaster/utils/catalogData';
import { buildCatalogA4Html } from '../ProductMaster/utils/catalogPrint';
import { applyCatalogRowOverrides } from './utils/catalogOverrides';

const Main_Catalog = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  const navigate = useNavigate();
  const { catalog_id } = useParams();

  const {
    selectedCatalogId,
    getCatalogData,
    getAllCatalogs,
    deleteCatalogById,
    duplicateSelectedCatalog,
    createNewCatalog,
  } = useCatalogContext();
  const { getCatalogDataByIds, getAllProducts } = useProductContext();
  const { getMasterTableData } = useMasterContext();

  const pageDataId = useEntityField('catalogs', 'id');
  const catalogName = useEntityField('catalogs', 'catalog_name');
  const displayHeader = useEntityField('catalogs', 'display_header');
  const catalogRows = useEntityRows('catalogs', 'catalog_product_rows');

  // Product ids already added to this catalog (ignoring rows flagged for
  // deletion), used to lock those products in the picker so they can't be
  // selected twice.
  const pickedProductIds = useMemo(() => {
    const set = new Set();
    (catalogRows || []).forEach((row) => {
      if (row?._delete) return;
      const id = String(row?.product_id || '').trim();
      if (id) set.add(id);
    });
    return set;
  }, [catalogRows]);

  const getCatalogDataRef = useRef(getCatalogData);
  useEffect(() => {
    getCatalogDataRef.current = getCatalogData;
  }, [getCatalogData]);

  const isAddingProductsRef = useRef(false);

  const handledIdRef = useRef(null);

  useEffect(() => {
    const routeId = String(catalog_id || '').trim();
    if (!routeId) {
      handledIdRef.current = '';
      return;
    }

    if (String(selectedCatalogId || '').trim() === routeId) {
      handledIdRef.current = routeId;
      return;
    }

    if (handledIdRef.current === routeId) return;

    handledIdRef.current = routeId;
    const loaded = getCatalogDataRef.current(routeId);
    if (!loaded) {
      navigate('/panel/catalog', { replace: true });
      handledIdRef.current = '';
    }
  }, [catalog_id, selectedCatalogId, navigate]);

  const catalogId = String(pageDataId || '').trim();
  const hasPersistedCatalog = (getAllCatalogs() || []).some(
    (item) => String(item?.id || '').trim() === catalogId,
  );

  const handleDeleteCatalog = useCallback(async () => {
    if (!catalogId || !hasPersistedCatalog || isDeleting) return;

    const confirmed = window.confirm(
      'Delete this catalog? This action cannot be undone.',
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteCatalogById(catalogId);
      navigate('/panel/catalog', { replace: true });
      alert('Catalog deleted successfully.');
    } catch (error) {
      console.error('Failed to delete catalog:', error);
      alert(error?.message || 'Failed to delete catalog.');
    } finally {
      setIsDeleting(false);
    }
  }, [catalogId, hasPersistedCatalog, isDeleting, deleteCatalogById, navigate]);

  const handleDuplicateCatalog = useCallback(async () => {
    if (!hasPersistedCatalog || isDuplicating) return;

    setIsDuplicating(true);
    try {
      await duplicateSelectedCatalog();
      navigate('/panel/catalog', { replace: true });
    } catch (error) {
      console.error('Failed to duplicate catalog:', error);
      alert(error?.message || 'Failed to duplicate catalog.');
    } finally {
      setIsDuplicating(false);
    }
  }, [duplicateSelectedCatalog, hasPersistedCatalog, isDuplicating, navigate]);

  const handleAddProducts = useCallback(
    async (productIds) => {
      if (isAddingProductsRef.current) return;
      isAddingProductsRef.current = true;

      try {
        const existing = catalogRows || [];
        const existingProductIds = new Set(
          existing
            .filter((row) => row?._delete !== true)
            .map((row) => String(row?.product_id || '').trim())
            .filter(Boolean),
        );

        const pendingIds = (productIds || []).filter(
          (id) => !existingProductIds.has(String(id || '').trim()),
        );

        // New rows carry no image data: the row's main image is the product's
        // own icon (editable in the row editor), and additional images come
        // live from `product_images`.
        const categoryAssigns =
          getMasterTableData('master_product_category_attribute_assign') || [];
        const attributes = getMasterTableData('master_product_attributes') || [];
        const productById = new Map(
          (getAllProducts() || []).map((product) => [
            String(product?.id || '').trim(),
            product,
          ]),
        );

        // `display_order` can have gaps (e.g. rows deleted or re-ordered over
        // time), so base the next order on the highest existing value rather
        // than the row count — otherwise a new row can sort into the middle of
        // the list instead of appearing last.
        const nextOrder =
          existing.reduce((max, row) => {
            if (row?._delete === true) return max;
            const order = Number(row?.display_order);
            return Number.isFinite(order) && order > max ? order : max;
          }, 0) + 1;
        const newRows = pendingIds.map((productId, index) => {
          const rowId = uuidv4();
          const defaultAttributeIds = getDefaultDisplayAttributeIds(
            productById.get(String(productId || '').trim()),
            categoryAssigns,
            attributes,
          );
          return {
            id: rowId,
            catalog_id: catalogId,
            product_id: productId,
            display_order: nextOrder + index,
            ...(defaultAttributeIds.length > 0
              ? {
                  catalog_product_row_attribute_displays:
                    defaultAttributeIds.map((attributeId) => ({
                      id: uuidv4(),
                      catalog_product_row_id: rowId,
                      attribute_id: attributeId,
                    })),
                }
              : {}),
          };
        });

        if (newRows.length > 0) {
          upsertEntityData('catalogs', { catalog_product_rows: newRows });
        }
      } finally {
        isAddingProductsRef.current = false;
        setIsPickerOpen(false);
      }
    },
    [catalogId, catalogRows, getAllProducts, getMasterTableData],
  );

  const handlePrint = useCallback(async () => {
    const orderedRows = [...(catalogRows || [])].sort((a, b) => {
      const aOrder = Number(a?.display_order);
      const bOrder = Number(b?.display_order);
      return (Number.isFinite(aOrder) ? aOrder : 999999) -
        (Number.isFinite(bOrder) ? bOrder : 999999);
    });

    const ids = orderedRows
      .map((row) => String(row?.product_id || '').trim())
      .filter(Boolean);

    if (ids.length === 0) {
      window.alert('No products in this catalog to print.');
      return;
    }

    setIsPrinting(true);
    setPrintHtml('');
    setPrintOpen(true);

    try {
      const bundle = await getCatalogDataByIds(ids);
      if (!bundle?.ok) {
        window.alert('Failed to load catalog data from server.');
        setPrintOpen(false);
        return;
      }

      const normalized = normalizeCatalogBundle(bundle);
      const overridden = applyCatalogRowOverrides(
        normalized.products,
        orderedRows,
      );
      const rows = buildCatalogRows(overridden, {
        currencies: normalized.currencies,
        masterDataMap: normalized.masterDataMap,
        baseCurrency: normalized.baseCurrency,
      });

      setPrintHtml(
        buildCatalogA4Html({
          rows,
          title: displayHeader || catalogName || 'Product Catalog',
          baseCurrency: normalized.baseCurrency,
          subtitle: `${rows.length} products · ${new Date().getFullYear()}`,
        }),
      );
    } catch (error) {
      console.error('Failed to build catalog printout:', error);
      window.alert('Failed to build the catalog printout.');
      setPrintOpen(false);
    } finally {
      setIsPrinting(false);
    }
  }, [catalogRows, getCatalogDataByIds, displayHeader, catalogName]);



  return (
    <CatalogSavePageContainer
      saveButtonText="Save Catalog"
      successMessage="Catalog saved successfully!"
      onCreate={() => {
        const created = createNewCatalog();
        if (created) {
          navigate('/panel/catalog', { replace: true });
        }
      }}
      createButtonText="Add Catalog"
      showCreateButton
      onPrint={handlePrint}
      printButtonText="Print"
      isPrinting={isPrinting}
      showPrintButton
      leftBottomAction={
        <div className={styles.bottomActionGroup}>
          <DeleteBtn
            text={isDeleting ? 'Deleting...' : 'Delete Catalog'}
            onClick={handleDeleteCatalog}
            disabled={!catalogId || !hasPersistedCatalog || isDeleting}
            title="Delete catalog"
            ariaLabel="Delete catalog"
          />
          <button
            type="button"
            className={styles.duplicateBottomButton}
            onClick={handleDuplicateCatalog}
            disabled={!hasPersistedCatalog || isDuplicating}
            title="Duplicate selected catalog"
            aria-label="Duplicate selected catalog"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="5.5" y="5.5" width="7" height="7" rx="1" />
              <path d="M10.5 5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1H5" />
            </svg>
            {isDuplicating ? 'Duplicating...' : 'Duplicate Catalog'}
          </button>
        </div>
      }
    >
      <div className={styles.masterContainer}>
        <CatalogSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />

        <div
          className={`${styles.container} ${
            sidebarCollapsed ? styles.fullWidth : ''
          }`}
        >
          <div className={styles.inputSide}>
            <CatalogHeaderForm />
            <Divider />
            <CatalogRowList onAddProducts={() => setIsPickerOpen(true)} />
          </div>
        </div>
      </div>

      {isPickerOpen ? (
        <CatalogProductPickerModal
          onClose={() => setIsPickerOpen(false)}
          onConfirm={handleAddProducts}
          pickedProductIds={pickedProductIds}
        />
      ) : null}

      {printOpen ? (
        <CatalogPrintPreviewModal
          html={printHtml}
          isPreparing={isPrinting}
          printTitle={displayHeader || catalogName || 'Product Catalog'}
          onClose={() => {
            setPrintOpen(false);
            setPrintHtml('');
          }}
        />
      ) : null}
    </CatalogSavePageContainer>
  );
};

export default Main_Catalog;
