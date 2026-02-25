import { useEffect, useState, useCallback } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import { v4 as uuidv4 } from 'uuid';

const Main_Keywords = () => {
  const { pageData, upsertProductPageData } = useProductContext();

  const { productKeywords, updateMasterTableData } = useMasterContext();

  const [keywords, setKeywords] = useState(pageData.product_keywords || []);

  useEffect(() => {
    setKeywords(pageData.product_keywords || []);
  }, [pageData.product_keywords]);

  const handleKeywordsChange = useCallback(
    (ov, nv) => {
      if (nv.length > ov.length) {
        // Keyword added
        const addedKeywords = nv.filter((kwid) => !ov.includes(kwid));
        addedKeywords.forEach((kwid) => {
          upsertProductPageData({
            product_keywords: [
              {
                id: uuidv4(),
                product_id: pageData.id,
                keyword_id: kwid,
              },
            ],
          });
        });
      } else if (nv.length < ov.length) {
        // Keyword removed
        const removedKeywords = ov.filter((kwid) => !nv.includes(kwid));
        const keywordRelationsToDelete = pageData.product_keywords.filter(
          (rel) => removedKeywords.includes(rel.keyword_id),
        );

        upsertProductPageData({
          product_keywords: keywordRelationsToDelete.map((rel) => ({
            id: rel.id,
            _delete: true,
          })),
        });
      }
    },
    [pageData, upsertProductPageData],
  );

  const handleNewOptionAdd = useCallback(
    async (newOptionName) => {
      await updateMasterTableData('master_keywords', {
        id: newOptionName.id,
        name: newOptionName.name.toLowerCase(),
      });
    },
    [updateMasterTableData],
  );

  return (
    <Main_InputContainer label={'Product Keywords'}>
      <Main_TagInputField
        placeholder="Enter keywords"
        defaultOptions={productKeywords}
        defaultSelectedOptions={keywords.map((kw) => kw.keyword_id)}
        onChange={handleKeywordsChange}
        canAddNewOptions={true}
        onAddNewOption={handleNewOptionAdd}
      />
    </Main_InputContainer>
  );
};

export default Main_Keywords;
