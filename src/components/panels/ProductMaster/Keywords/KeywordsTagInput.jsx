import { useCallback } from 'react';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import { v4 as uuidv4 } from 'uuid';

const KeywordsTagInput = ({
  productKeywords,
  keywords,
  pageData,
  onKeywordsChange,
  onAddNewOption,
}) => {
  const handleKeywordsChange = useCallback(
    (ov, nv) => {
      if (nv.length > ov.length) {
        // Keyword added
        const addedKeywords = nv.filter((kwid) => !ov.includes(kwid));
        addedKeywords.forEach((kwid) => {
          onKeywordsChange({
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

        onKeywordsChange({
          product_keywords: keywordRelationsToDelete.map((rel) => ({
            id: rel.id,
            _delete: true,
          })),
        });
      }
    },
    [pageData, onKeywordsChange],
  );

  return (
    <Main_TagInputField
      placeholder="Enter keywords"
      defaultOptions={productKeywords}
      defaultSelectedOptions={keywords.map((kw) => kw.keyword_id)}
      onChange={handleKeywordsChange}
      canAddNewOptions={true}
      onAddNewOption={onAddNewOption}
    />
  );
};

export default KeywordsTagInput;
