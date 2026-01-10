import { useCallback } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_PackRow from './Sub_PackRow';
import { useProductContext } from '../../../../store/ProductContext';
import useRowData from '../../../../hooks/useRowData';

const Main_Pack = () => {
  const { pageData, updateProductPageData } = useProductContext();

  const template_data = {
    type: 1,
    quantity: '',
    unit: 1,
    weight: '',
    weightUnit: 1,
    dimension: {
      length: '',
      width: '',
      height: '',
    },
    dimensionUnit: 1,
  };

  // Use the custom hook to manage pack data
  const {
    rowData: packings,
    rowIds,
    rowRef,
    setRowRef,
    handleRowIdsChange,
    handleRowAdd,
    handleRowRemove,
    handleFieldChange: handlePackChange,
  } = useRowData({
    data: pageData.packings,
    updateProductPageData,
    dataKey: 'packings',
    template: template_data,
    idPrefix: 'pack',
  });

  return (
    <Main_InputContainer label="Packing Information">
      <ControlRowBtn
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_PackRow
          template_data={template_data}
          packings={packings}
          onChange={handlePackChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Pack;
