import { useCallback } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext';
import useRowData from '../../../../hooks/useRowData';

const Main_ProductName = () => {
  const { pageData, updateProductPageData } = useProductContext();

  const template_data = {
    name: '',
    language: 1, // Default language ID
  };

  // Use the custom hook to manage product names
  const {
    rowData: product_names,
    rowIds,
    rowRef,
    setRowRef,
    handleRowIdsChange,
    handleRowAdd,
    handleRowRemove,
    handleFieldChange: handleProductNameChange,
  } = useRowData({
    data: pageData.product_names,
    updateProductPageData,
    dataKey: 'product_names',
    template: template_data,
    idPrefix: 'product-name',
  });

  return (
    <Main_InputContainer label="Product Names">
      <ControlRowBtn
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_ProductNameRow
          template_data={template_data}
          product_names={product_names}
          onChange={handleProductNameChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_ProductName;
