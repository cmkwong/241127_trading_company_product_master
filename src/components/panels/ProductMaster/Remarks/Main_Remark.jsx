import { useCallback } from 'react';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Sub_Remark from './Sub_Remark';
import {
  upsertEntityData,
  useEntityField,
} from '../../../../store/GeneralContext';

const Main_Remark = () => {
  const remark = useEntityField('products', 'remark');

  const handleRemarkChange = useCallback(
    (ov, nv) => {
      upsertEntityData('products', {
        remark: nv,
      });
    },
    [upsertEntityData],
  );

  return (
    <Main_InputContainer label="Product Remarks">
      <Sub_Remark remark={remark || ''} onChange={handleRemarkChange} />
    </Main_InputContainer>
  );
};

export default Main_Remark;
