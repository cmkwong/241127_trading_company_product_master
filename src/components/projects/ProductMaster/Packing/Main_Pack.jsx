import { useState, useCallback } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_PackRow from './Sub_PackRow';
import { useProductContext } from '../../../../store/ProductContext';

const Main_Pack = () => {
  const { pageData, upsertProductPageData } = useProductContext();

  const [rowIds, setRowIds] = useState(
    pageData.product_packings?.map((item) => item.id) || [],
  );

  const handleRowIdsChange = useCallback(() => {}, []);

  //  handle adding a new product packing row
  const handleRowAdd = useCallback((newId) => {
    upsertProductPageData({
      product_packings: [
        {
          id: newId,
          product_id: pageData.id,
        },
      ],
    });
  }, []);

  // Handle removing a product packing row
  const handleRowRemove = useCallback((id) => {
    upsertProductPageData({
      product_packings: [
        {
          id: id,
          _delete: true,
        },
      ],
    });
  }, []);

  return (
    <Main_InputContainer label="Packing Information">
      <ControlRowBtn
        rowIds={rowIds}
        onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_PackRow packings={pageData.product_packings || []} />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Pack;
