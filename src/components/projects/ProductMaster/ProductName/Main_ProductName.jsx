import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import RemoveRowBtn from '../../../common/Buttons/RemoveRowBtn';
import EmptyState from '../../../common/State/EmptyState';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_ProductName.module.css';

const defaultProductName = [
  'Elizabeth Collar Pet Grooming Shield Anti Bite Collar Dog Necklace Cat Neck Shame Collar',
  'High Quality Wholesale Pet Dog Toys Pet Plush Toys Dog Chew Toys with Rope for dog animals',
  'Waterproof Foldable Seat Protector Hammock Pets Dog Car Seat Cover Pet/dog Back Cover for Car Rear Back Seat',
  'Pet Water Dispenser Automatic Pet Drinking Feeder Cat Water Fountain LED Water Level Display Cat Products',
  'Hot sale and high quality Pet plush toy simulation sounding duck dog toy large molar tooth cleaning toy',
  'Durable Plush Eggplant Cat Chew Toy with Funny Expression and Squeaker Sound Long-Lasting Teething Toy',
  'Hot Selling High Quality USB Interactive Cat Toys Classic Style Laser Pen Cat Teaser Exerciser Training Toy Wholesale Price',
  'Durable Convenient Stainless Steel Blade Free Nail Clipper No More Over Cutting Nail Trimmers',
];

const Main_ProductName = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { productNameType } = useMasterContext();
  const [rowIds, setRowIds] = useState([]);
  const [rowDatas, setRowDatas] = useState([]);
  const [draggedRowId, setDraggedRowId] = useState(null);
  const [dragOverRowId, setDragOverRowId] = useState(null);
  const [nameValues, setNameValues] = useState({});

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
    const sortedRows = sortByDisplayOrder(pageData.product_names || []);
    setRowIds(sortedRows.map((item) => item.id));
  }, [pageData.product_names, sortByDisplayOrder]);

  useEffect(() => {
    setRowDatas(sortByDisplayOrder(pageData.product_names || []));
  }, [pageData.product_names, sortByDisplayOrder]);

  const upsertDisplayOrders = useCallback(
    (orderedRowIds = []) => {
      const patches = orderedRowIds.filter(Boolean).map((id, index) => ({
        id,
        display_order: index + 1,
      }));

      if (patches.length > 0) {
        upsertProductPageData({
          product_names: patches,
        });
      }
    },
    [upsertProductPageData],
  );

  const handleRowAdd = useCallback(() => {
    const newId = uuidv4();
    const nextDisplayOrder = (rowIds?.length || 0) + 1;
    upsertProductPageData({
      product_names: [{ id: newId, display_order: nextDisplayOrder }],
    });
  }, [upsertProductPageData, rowIds]);

  const handleRowRemove = useCallback(
    (id) => {
      const remainingIds = rowIds.filter((rowId) => rowId !== id);

      upsertProductPageData({
        product_names: [{ id, _delete: true }],
      });

      upsertDisplayOrders(remainingIds);
    },
    [upsertProductPageData, rowIds, upsertDisplayOrders],
  );

  const handleProductNameChange = useCallback(
    (rowId, ov, nv) => {
      upsertProductPageData({
        product_names: [
          {
            id: rowId,
            name: nv,
          },
        ],
      });
      setNameValues((prev) => ({ ...prev, [rowId]: nv }));
    },
    [upsertProductPageData],
  );

  const handleTypeChange = useCallback(
    (rowId, ov, nv) => {
      upsertProductPageData({
        product_names: [
          {
            id: rowId,
            name_type_id: nv,
          },
        ],
      });
    },
    [upsertProductPageData],
  );

  const handleDragStart = useCallback((rowId) => {
    setDraggedRowId(rowId);
  }, []);

  const handleDragOver = useCallback(
    (event, rowId) => {
      event.preventDefault();
      if (dragOverRowId !== rowId) {
        setDragOverRowId(rowId);
      }
    },
    [dragOverRowId],
  );

  const handleDrop = useCallback(
    (event, targetRowId) => {
      event.preventDefault();

      if (!draggedRowId || draggedRowId === targetRowId) {
        setDraggedRowId(null);
        setDragOverRowId(null);
        return;
      }

      const draggedIndex = rowIds.indexOf(draggedRowId);
      const targetIndex = rowIds.indexOf(targetRowId);

      if (draggedIndex < 0 || targetIndex < 0) {
        setDraggedRowId(null);
        setDragOverRowId(null);
        return;
      }

      const newRowIds = [...rowIds];
      newRowIds.splice(draggedIndex, 1);
      newRowIds.splice(targetIndex, 0, draggedRowId);

      setRowIds(newRowIds);
      upsertDisplayOrders(newRowIds);

      setDraggedRowId(null);
      setDragOverRowId(null);
    },
    [draggedRowId, rowIds, upsertDisplayOrders],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedRowId(null);
    setDragOverRowId(null);
  }, []);

  const getCurrentProduct = useCallback(
    (rowId) => rowDatas.find((d) => d.id === rowId) || {},
    [rowDatas],
  );

  const getDisplayName = useCallback(
    (rowId) => nameValues[rowId] ?? getCurrentProduct(rowId)?.name ?? '',
    [nameValues, getCurrentProduct],
  );

  return (
    <Main_InputContainer
      label="Product Names"
      onAddNew={handleRowAdd}
      addNewText="Add Name"
    >
      <div className={styles.namesList}>
        {rowIds.length === 0 ? (
          <EmptyState message="No product names added yet." />
        ) : (
          rowIds.map((rowId, rowIndex) => {
            const currentProduct = getCurrentProduct(rowId);

            return (
              <div
                key={rowId}
                className={`${styles.nameRow} ${
                  dragOverRowId === rowId ? styles.dragOver : ''
                }`}
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

                <div className={styles.inputWrapper}>
                  <Main_Suggest
                    defaultSuggestions={defaultProductName}
                    onChange={(ov, nv) =>
                      handleProductNameChange(rowId, ov, nv)
                    }
                    defaultValue={getDisplayName(rowId)}
                  />
                </div>

                <div>
                  <Main_Dropdown
                    defaultOptions={productNameType}
                    defaultSelectedOption={currentProduct?.name_type_id}
                    onChange={(ov, nv) => handleTypeChange(rowId, ov, nv)}
                  />
                </div>

                <RemoveRowBtn
                  onClick={() => handleRowRemove(rowId)}
                  text=""
                  className={styles.removeBtn}
                />

                <div className={styles.rowBadge}>
                  <span className={styles.rowBadgeText}>{rowIndex + 1}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_ProductName;
