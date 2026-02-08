import { useCallback, useMemo, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import styles from './Main_CertificateData.module.css';
import Sub_CertificateData from './Sub_CertificateData';
import { useProductContext } from '../../../../store/ProductContext';

const Main_CertificateData = () => {
  const { pageData, upsertProductPageData } = useProductContext();

  const [rowIds, setRowIds] = useState(
    pageData.product_certificates?.map((item) => item.id) || [],
  );

  useMemo(() => {
    if (pageData.product_certificates) {
      setRowIds(pageData.product_certificates.map((item) => item.id));
    } else {
      setRowIds([]);
    }
  }, [pageData.product_certificates]);

  const handleRowIdsChange = useCallback(() => {}, []);

  const handleRowAdd = useCallback(
    (newId) => {
      upsertProductPageData({
        product_certificates: [
          {
            id: newId,
            product_certificate_files: [],
          },
        ],
      });
    },
    [upsertProductPageData],
  );

  const handleRowRemove = useCallback(
    (idToRemove) => {
      upsertProductPageData({
        product_certificates: [
          {
            id: idToRemove,
            _delete: true,
          },
        ],
      });
    },
    [upsertProductPageData],
  );

  return (
    <Main_InputContainer label="Certificates">
      <ControlRowBtn
        rowIds={rowIds}
        onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_CertificateData
          certificates={pageData.product_certificates || []}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_CertificateData;
