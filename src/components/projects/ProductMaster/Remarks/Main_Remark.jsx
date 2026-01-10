import { useCallback } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_Remark from './Sub_Remark';
import { useProductContext } from '../../../../store/ProductContext';

const Main_Remark = () => {
  const { pageData, updateProductPageData } = useProductContext();

  const handleRemarkChange = useCallback(
    (field, value) => {
      updateProductPageData(field, value);
    },
    [updateProductPageData]
  );

  return (
    <Main_InputContainer label="Product Remarks">
      <Sub_Remark
        remark={pageData.remark || ''}
        onChange={handleRemarkChange}
      />
    </Main_InputContainer>
  );
};

export default Main_Remark;
