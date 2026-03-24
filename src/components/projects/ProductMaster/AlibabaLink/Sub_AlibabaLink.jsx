import { useState, useCallback, useEffect } from 'react';
import styles from './Main_AlibabaLink.module.css';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { useProductContext } from '../../../../store/ProductContext';

const Sub_AlibabaLink = (props) => {
  const { product_alibaba_ids, rowId } = props;

  const { upsertProductPageData, pageData } = useProductContext();

  // Resolve current row by stable rowId (important for drag reorder)
  const currentAlibabaLink =
    product_alibaba_ids.find((item) => item.id === rowId) || {};

  const [alibabaId, setAlibabaId] = useState(currentAlibabaLink?.value || '');
  const [alibabaLinkValue, setAlibabaLinkValue] = useState(
    currentAlibabaLink?.link || '',
  );

  useEffect(() => {
    setAlibabaId(currentAlibabaLink?.value || '');
    setAlibabaLinkValue(currentAlibabaLink?.link || '');
  }, [currentAlibabaLink?.value, currentAlibabaLink?.link]);

  const handleAlibabaIdChange = useCallback(
    (ov, nv) => {
      upsertProductPageData({
        product_alibaba_ids: [
          {
            id: rowId,
            product_id: pageData.id,
            value: nv,
          },
        ],
      });
    },
    [upsertProductPageData, rowId, pageData.id],
  );

  const handleLinkChange = useCallback(
    (ov, nv) => {
      upsertProductPageData({
        product_alibaba_ids: [
          {
            id: rowId,
            product_id: pageData.id,
            link: nv,
          },
        ],
      });
    },
    [upsertProductPageData, rowId, pageData.id],
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
          type="link"
          onChange={handleLinkChange}
        />
      </div>
    </div>
  );
};

export default Sub_AlibabaLink;
