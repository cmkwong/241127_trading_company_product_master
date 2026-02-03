import { useCallback, useMemo, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext';

const Main_ProductName = () => {
  const { pageData } = useProductContext();

  // Use the custom hook to manage product names
  // const {
  //   rowDatas,
  //   rowIds,
  //   rowRef,
  //   setRowRef,
  //   handleRowIdsChange,
  //   handleRowAdd,
  //   handleRowRemove,
  //   handleFieldChange,
  // } = useRowData({
  //   data: pageData.product_names,
  //   updateProductPageData,
  //   dataKey: 'product_names',
  //   idPrefix: 'product-name',
  // });
  const [rowIds, setRowIds] = useState([]);
  const [rowDatas, setRowDatas] = useState([]);
  useMemo(() => {
    setRowIds(
      pageData.product_names
        ? pageData.product_names.map((item) => item.id)
        : [],
    );
  }, [pageData.product_names]);

  useMemo(() => {
    setRowDatas(pageData.product_names || []);
  }, [pageData.product_names]);

  const handleRowIdsChange = useCallback(() => {}, []);
  const handleRowAdd = useCallback(() => {}, []);
  const handleRowRemove = useCallback(() => {}, []);

  return (
    <Main_InputContainer label="Product Names">
      <ControlRowBtn
        rowIds={rowIds}
        onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
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
