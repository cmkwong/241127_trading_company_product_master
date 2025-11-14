import { useCallback } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import styles from './Main_CertificateData.module.css';
import Sub_CertificateData from './Sub_CertificateData';
import { useProductContext } from '../../../../store/ProductContext';
import useRowData from '../../../../hooks/useRowData';

const Main_CertificateData = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    type: 1,
    files: [],
    remark: '',
  };

  // Use the custom hook to manage certificate data
  const {
    rowData: certificates,
    rowIds,
    rowRef,
    setRowRef,
    handleRowIdsChange,
    handleRowAdd,
    handleRowRemove,
    handleFieldChange: handleCertificateChange,
  } = useRowData({
    data: pageData.certificates,
    updateData,
    dataKey: 'certificates',
    template: template_data,
    idPrefix: 'certificate',
  });

  return (
    <Main_InputContainer label="Certificates">
      <ControlRowBtn
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_CertificateData
          template_data={template_data}
          certificates={certificates}
          onChange={handleCertificateChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_CertificateData;
