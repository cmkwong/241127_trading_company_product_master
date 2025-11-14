import { useCallback } from 'react';
import styles from './Main_AlibabaLink.module.css';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Sub_AlibabaLink from './Sub_AlibabaLink';
import { useProductContext } from '../../../../store/ProductContext';
import useRowData from '../../../../hooks/useRowData';

const Main_AlibabaLink = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    value: '',
    link: '',
  };

  // Use the custom hook to manage alibaba IDs
  const {
    rowData: alibabaIds,
    rowIds,
    rowRef,
    setRowRef,
    handleRowIdsChange,
    handleRowAdd,
    handleRowRemove,
    handleFieldChange: handleAlibabaIdChange,
  } = useRowData({
    data: pageData.alibabaIds,
    updateData,
    dataKey: 'alibabaIds',
    template: template_data,
    idPrefix: 'alibaba-id',
  });

  return (
    <Main_InputContainer label={'Alibaba'}>
      <ControlRowBtn
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_AlibabaLink
          template_data={template_data}
          alibabaIds={alibabaIds}
          onChange={handleAlibabaIdChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_AlibabaLink;
