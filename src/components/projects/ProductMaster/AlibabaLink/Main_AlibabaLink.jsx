import { useCallback, useEffect, useState } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/Buttons/ControlRowBtn';
import Sub_AlibabaLink from './Sub_AlibabaLink';
import { useProductContext } from '../../../../store/ProductContext';

const Main_AlibabaLink = () => {
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

  useEffect(() => {
    const sortedRows = sortByDisplayOrder(pageData.product_alibaba_ids || []);
    setRowIds(sortedRows.map((item) => item.id));
  }, [pageData.product_alibaba_ids, sortByDisplayOrder]);

  useEffect(() => {
    setRowDatas(sortByDisplayOrder(pageData.product_alibaba_ids || []));
  }, [pageData.product_alibaba_ids, sortByDisplayOrder]);

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
          product_alibaba_ids: patches,
        });
      }
    },
    [upsertProductPageData],
  );

  // handle adding a new product alibaba id row
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

  // Handle removing a product alibaba id row
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
    <Main_InputContainer label={'Alibaba'}>
      <ControlRowBtn
        rowIds={rowIds}
        onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
        onRowsReorder={handleRowsReorder}
        draggableRows
      >
        <Sub_AlibabaLink product_alibaba_ids={rowDatas} />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_AlibabaLink;
