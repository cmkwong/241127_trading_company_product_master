import { useCallback, useMemo, useState } from 'react';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import EmptyState from '../../../common/State/EmptyState';
import {
  upsertEntityData,
  useEntityRows,
} from '../../../../store/GeneralContext';
import CatalogProductRow from './CatalogProductRow';
import styles from './CatalogRowList.module.css';

const sortByDisplayOrder = (rows) =>
  [...rows].sort((a, b) => {
    const aOrder = Number(a?.display_order);
    const bOrder = Number(b?.display_order);
    const aVal = Number.isFinite(aOrder) ? aOrder : Number.MAX_SAFE_INTEGER;
    const bVal = Number.isFinite(bOrder) ? bOrder : Number.MAX_SAFE_INTEGER;
    if (aVal !== bVal) return aVal - bVal;
    return String(a?.id || '').localeCompare(String(b?.id || ''));
  });

const CatalogRowList = ({ onAddProducts }) => {
  const rows = useEntityRows('catalogs', 'catalog_product_rows');
  const [draggedRowId, setDraggedRowId] = useState(null);
  const [dragOverRowId, setDragOverRowId] = useState(null);

  const sortedRows = useMemo(() => sortByDisplayOrder(rows || []), [rows]);

  const upsertDisplayOrders = useCallback((orderedRowIds) => {
    const patches = orderedRowIds.filter(Boolean).map((id, index) => ({
      id,
      display_order: index + 1,
    }));
    if (patches.length > 0) {
      upsertEntityData('catalogs', { catalog_product_rows: patches });
    }
  }, []);

  const patchRow = useCallback(
    (rowId, patch) => {
      upsertEntityData('catalogs', {
        catalog_product_rows: [{ id: rowId, ...patch }],
      });
    },
    [],
  );

  const removeRow = useCallback((rowId) => {
    upsertEntityData('catalogs', {
      catalog_product_rows: [{ id: rowId, _delete: true }],
    });
  }, []);

  const handleDragStart = useCallback((rowId) => setDraggedRowId(rowId), []);
  const handleDragEnd = useCallback(() => {
    setDraggedRowId(null);
    setDragOverRowId(null);
  }, []);

  const handleDragOver = useCallback((event, rowId) => {
    event.preventDefault();
    setDragOverRowId(rowId);
  }, []);

  const handleDrop = useCallback(
    (event, targetRowId) => {
      event.preventDefault();
      if (!draggedRowId || draggedRowId === targetRowId) {
        setDraggedRowId(null);
        setDragOverRowId(null);
        return;
      }

      const orderedIds = sortedRows.map((row) => row.id);
      const draggedIndex = orderedIds.indexOf(draggedRowId);
      const targetIndex = orderedIds.indexOf(targetRowId);
      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedRowId(null);
        setDragOverRowId(null);
        return;
      }

      orderedIds.splice(draggedIndex, 1);
      orderedIds.splice(targetIndex, 0, draggedRowId);
      upsertDisplayOrders(orderedIds);

      setDraggedRowId(null);
      setDragOverRowId(null);
    },
    [draggedRowId, sortedRows, upsertDisplayOrders],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <span className={styles.title}>Catalog Product Rows</span>
        <AddNewBtn onClick={onAddProducts} text="Add Products" />
      </div>

      {sortedRows.length === 0 ? (
        <EmptyState message="No products added yet. Click 'Add Products' to build the catalog." />
      ) : (
        <div className={styles.list}>
          {sortedRows.map((row, index) => (
            <CatalogProductRow
              key={row.id}
              row={row}
              index={index}
              dragOver={dragOverRowId === row.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onRemove={removeRow}
              onPatchRow={patchRow}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogRowList;
