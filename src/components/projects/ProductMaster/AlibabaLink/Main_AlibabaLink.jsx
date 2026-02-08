import { useCallback, useEffect, useState } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Sub_AlibabaLink from './Sub_AlibabaLink';
import { useProductContext } from '../../../../store/ProductContext';

const Main_AlibabaLink = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const [rowIds, setRowIds] = useState(
    pageData.product_alibaba_ids?.map((item) => item.id) || [],
  );

  useEffect(() => {
    if (pageData.product_alibaba_ids) {
      setRowIds(pageData.product_alibaba_ids.map((item) => item.id));
    } else {
      setRowIds([]);
    }
  }, [pageData.product_alibaba_ids]);

  const handleRowIdsChange = useCallback(() => {}, []);

  // handle adding a new product alibaba id row
  const handleRowAdd = useCallback(
    (newId) => {
      upsertProductPageData({
        product_alibaba_ids: [
          {
            id: newId,
          },
        ],
      });
    },
    [upsertProductPageData],
  );

  // Handle removing a product alibaba id row
  const handleRowRemove = useCallback(
    (rowId) => {
      upsertProductPageData({
        product_alibaba_ids: [
          {
            id: rowId,
            _delete: true,
          },
        ],
      });
    },
    [upsertProductPageData],
  );

  return (
    <Main_InputContainer label={'Alibaba'}>
      <ControlRowBtn
        rowIds={rowIds}
        onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_AlibabaLink
          product_alibaba_ids={pageData.product_alibaba_ids || []}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_AlibabaLink;
