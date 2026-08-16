import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import EmptyState from '../../../common/State/EmptyState';
import Sub_AlibabaLink from './Sub_AlibabaLink';
import { useProductContext } from '../../../../store/ProductContext';
import styles from './Main_AlibabaLink.module.css';

const Main_AlibabaLink = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const [rowIds, setRowIds] = useState([]);
  const [rowDatas, setRowDatas] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const sortByDisplayOrder = useCallback((rows = []) => {
    return [...rows].sort((a, b) => {
      const left =
        typeof a?.display_order === 'number' ? a.display_order : 999999;
      const right =
        typeof b?.display_order === 'number' ? b.display_order : 999999;
      if (left !== right) return left - right;
      return String(a?.id || '').localeCompare(String(b?.id || ''));
    });
  }, []);

  useEffect(() => {
    const sortedRows = sortByDisplayOrder(pageData.product_alibaba_ids || []);
    setRowIds(sortedRows.map((item) => item.id));
  }, [pageData.product_alibaba_ids, sortByDisplayOrder]);

  useEffect(() => {
    setRowDatas(sortByDisplayOrder(pageData.product_alibaba_ids || []));
  }, [pageData.product_alibaba_ids, sortByDisplayOrder]);

  const upsertDisplayOrders = useCallback(
    (orderedRowIds = []) => {
      const patches = orderedRowIds.filter(Boolean).map((id, index) => ({
        id,
        display_order: index + 1,
      }));

      if (patches.length > 0) {
        upsertProductPageData({
          product_alibaba_ids: patches,
        });
      }
    },
    [upsertProductPageData],
  );

  const handleRowAdd = useCallback(
    (newId) => {
      const nextDisplayOrder = (rowIds?.length || 0) + 1;
      upsertProductPageData({
        product_alibaba_ids: [
          {
            id: newId,
            display_order: nextDisplayOrder,
          },
        ],
      });
    },
    [upsertProductPageData, rowIds],
  );

  const handleRowRemove = useCallback(
    (rowId) => {
      const remainingIds = rowIds.filter((id) => id !== rowId);

      upsertProductPageData({
        product_alibaba_ids: [
          {
            id: rowId,
            _delete: true,
          },
        ],
      });

      upsertDisplayOrders(remainingIds);
    },
    [upsertProductPageData, rowIds, upsertDisplayOrders],
  );

  const handleDragStart = useCallback((rowId) => {
    setDraggedId(rowId);
  }, []);

  const handleDragOver = useCallback(
    (event, rowId) => {
      event.preventDefault();
      if (dragOverId !== rowId) {
        setDragOverId(rowId);
      }
    },
    [dragOverId],
  );

  const handleDrop = useCallback(
    (event, targetRowId) => {
      event.preventDefault();

      if (!draggedId || draggedId === targetRowId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }

      const draggedIndex = rowIds.indexOf(draggedId);
      const targetIndex = rowIds.indexOf(targetRowId);

      if (draggedIndex < 0 || targetIndex < 0) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }

      const newRowIds = [...rowIds];
      newRowIds.splice(draggedIndex, 1);
      newRowIds.splice(targetIndex, 0, draggedId);

      setRowIds(newRowIds);
      upsertDisplayOrders(newRowIds);

      setDraggedId(null);
      setDragOverId(null);
    },
    [draggedId, rowIds, upsertDisplayOrders],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleAdd = useCallback(() => {
    const newId = uuidv4();
    handleRowAdd(newId);
  }, [handleRowAdd]);

  return (
    <Main_InputContainer
      label="Alibaba IDs"
      onAddNew={handleAdd}
      addNewText="Add Alibaba ID"
    >
      <div className={styles.list}>
        {rowIds.length === 0 ? (
          <EmptyState message="No Alibaba IDs yet." />
        ) : (
          rowIds.map((rowId, rowIndex) => (
            <div
              key={rowId}
              className={`${styles.row} ${dragOverId === rowId ? styles.dragOver : ''}`}
              onDragOver={(event) => handleDragOver(event, rowId)}
              onDrop={(event) => handleDrop(event, rowId)}
            >
              <button
                type="button"
                draggable
                className={styles.dragHandle}
                onDragStart={() => handleDragStart(rowId)}
                onDragEnd={handleDragEnd}
                title="Drag to reorder"
                aria-label="Drag to reorder row"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="5" cy="4" r="1.2" />
                  <circle cx="11" cy="4" r="1.2" />
                  <circle cx="5" cy="8" r="1.2" />
                  <circle cx="11" cy="8" r="1.2" />
                  <circle cx="5" cy="12" r="1.2" />
                  <circle cx="11" cy="12" r="1.2" />
                </svg>
              </button>

              <div className={styles.childrenContainer}>
                <Sub_AlibabaLink
                  product_alibaba_ids={rowDatas}
                  rowId={rowId}
                  rowindex={rowIndex}
                />
              </div>

              <div className={styles.rowBadge}>
                <span className={styles.rowBadgeText}>{rowIndex + 1}</span>
              </div>

              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRowRemove(rowId)}
                title="Remove row"
                aria-label={`Remove row ${rowIndex + 1}`}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_AlibabaLink;
