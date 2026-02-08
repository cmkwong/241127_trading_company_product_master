import { useState, useCallback, useEffect } from 'react';
import styles from './Main_AlibabaLink.module.css';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { useProductContext } from '../../../../store/ProductContext';

const Sub_AlibabaLink = (props) => {
  const { product_alibaba_ids, rowindex } = props;

  const { upsertProductPageData, pageData } = useProductContext();

  // Get the current row data or use template data if it doesn't exist
  const [alibabaLink, setAlibabaLink] = useState(
    product_alibaba_ids[rowindex] || {},
  );
  const [alibabaId, setAlibabaId] = useState(alibabaLink?.value || '');
  const [alibabaLinkValue, setAlibabaLinkValue] = useState(
    alibabaLink?.link || '',
  );

  useEffect(() => {
    setAlibabaId(alibabaLink?.value || '');
    setAlibabaLinkValue(alibabaLink?.link || '');
  }, [alibabaLink]);

  const handleAlibabaIdChange = useCallback(
    (ov, nv) => {
      upsertProductPageData({
        product_alibaba_ids: [
          {
            id: alibabaLink.id,
            product_id: pageData.id,
            value: nv,
          },
        ],
      });
    },
    [upsertProductPageData, alibabaLink.id, pageData.id],
  );

  const handleLinkChange = useCallback(
    (ov, nv) => {
      upsertProductPageData({
        product_alibaba_ids: [
          {
            id: alibabaLink.id,
            product_id: pageData.id,
            link: nv,
          },
        ],
      });
    },
    [upsertProductPageData, alibabaLink.id, pageData.id],
  );

  return (
    <div className={styles.inputContainer}>
      <div className={styles.idField}>
        <Main_TextField
          placeholder={'Enter Alibaba ID ...'}
          defaultValue={alibabaId}
          onChange={handleAlibabaIdChange}
        />
      </div>
      <div className={styles.linkField}>
        <Main_TextField
          placeholder={'Enter Link ...'}
          defaultValue={alibabaLinkValue}
          onChange={handleLinkChange}
        />
      </div>
    </div>
  );
};

export default Sub_AlibabaLink;
