import { useCallback, useEffect, useState } from 'react';
import ControlRowBtn from '../../../common/Buttons/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext';

const Main_ProductName = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const [rowIds, setRowIds] = useState([]);
  const [rowDatas, setRowDatas] = useState([]);

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

  // set the row IDs and datas when pageData changes
  useEffect(() => {
    const sortedRows = sortByDisplayOrder(pageData.product_names || []);
    setRowIds(sortedRows.map((item) => item.id));
  }, [pageData.product_names, sortByDisplayOrder]);

  // set the row data when pageData changes
  useEffect(() => {
    setRowDatas(sortByDisplayOrder(pageData.product_names || []));
  }, [pageData.product_names, sortByDisplayOrder]);

  const handleRowIdsChange = useCallback((ov = [], nv = []) => {
    if (!Array.isArray(nv) || nv.length === 0) {
      setRowIds([]);
      return;
    }
    if (ov.join('|') === nv.join('|')) return;
    setRowIds(nv);
  }, []);

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

  const handleRowAdd = useCallback(
    (newId) => {
      const nextDisplayOrder = (rowIds?.length || 0) + 1;
      upsertProductPageData({
        product_names: [{ id: newId, display_order: nextDisplayOrder }],
      });
    },
    [upsertProductPageData, rowIds],
  );

  const handleRowRemove = useCallback(
    (id) => {
      const remainingIds = rowIds.filter((rowId) => rowId !== id);

      upsertProductPageData({
        product_names: [{ id: id, _delete: true }],
      });

      upsertDisplayOrders(remainingIds);
    },
    [upsertProductPageData, rowIds, upsertDisplayOrders],
  );

  const handleRowsReorder = useCallback(
    (ov = [], nv = []) => {
      if (!Array.isArray(nv) || nv.length === 0) return;
      if (ov.join('|') === nv.join('|')) return;
      setRowIds(nv);
      upsertDisplayOrders(nv);
    },
    [upsertDisplayOrders],
  );

  return (
    <Main_InputContainer label="Product Names">
      <ControlRowBtn
        rowIds={rowIds}
        onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
        onRowsReorder={handleRowsReorder}
        draggableRows
      >
        <Sub_ProductNameRow
          product_names={rowDatas}
          // onChange={handleFieldChange}
          // setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_ProductName;
