import { useCallback, useEffect, useMemo, useState } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_Remark from './Sub_Remark';
import { useProductContext } from '../../../../store/ProductContext';

const Main_Remark = () => {
  const { pageData, upsertProductPageData } = useProductContext();

  const [remark, setRemark] = useState(pageData.remark || '');
  console.log('remark: ', remark);

  useEffect(() => {
    setRemark(pageData.remark || '');
  }, [pageData]);

  const handleRemarkChange = useCallback(
    (ov, nv) => {
      // Direct update of the remark field on the pageData object
      upsertProductPageData({
        remark: nv,
      });
    },
    [upsertProductPageData],
  );

  return (
    <Main_InputContainer label="Product Remarks">
      <Sub_Remark remark={remark || ''} onChange={handleRemarkChange} />
    </Main_InputContainer>
  );
};

export default Main_Remark;
