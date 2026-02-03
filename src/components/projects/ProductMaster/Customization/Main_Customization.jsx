import { useCallback } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_CustomizationRow from './Sub_CustomizationRow';
import { useProductContext } from '../../../../store/ProductContext';
import useRowData from '../../../../hooks/useRowData';

const Main_Customization = () => {
  const { pageData, updateProductPageData } = useProductContext();

  const template_data = {
    type: 1,
    description: '',
    minQuantity: '',
    files: [],
  };

  // Use the custom hook to manage customization data
  const {
    rowDatas: customizations,
    rowIds,
    rowRef,
    setRowRef,
    handleRowIdsChange,
    handleRowAdd,
    handleRowRemove,
    handleFieldChange: handleCustomizationChange,
  } = useRowData({
    data: pageData.customizations,
    updateProductPageData,
    dataKey: 'customizations',
    template: template_data,
    idPrefix: 'customization',
  });

  return (
    <Main_InputContainer label="Customization Options">
      <ControlRowBtn
        rowIds={rowIds}
        onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_CustomizationRow
          template_data={template_data}
          customizations={customizations}
          onChange={handleCustomizationChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Customization;
