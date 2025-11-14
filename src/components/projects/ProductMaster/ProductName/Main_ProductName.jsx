import { useCallback } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext';
import useRowData from '../../../../hooks/useRowData';

const Main_ProductName = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    name: '',
    language: 1, // Default language ID
  };

  // Use the custom hook to manage product names
  const {
    rowData: productNames,
    rowIds,
    rowRef,
    setRowRef,
    handleRowIdsChange,
    handleRowAdd,
    handleRowRemove,
    handleFieldChange: handleProductNameChange,
  } = useRowData({
    data: pageData.productNames,
    updateData,
    dataKey: 'productNames',
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
          productNames={productNames}
          onChange={handleProductNameChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_ProductName;
