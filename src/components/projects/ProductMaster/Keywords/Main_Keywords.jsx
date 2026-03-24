import { useEffect, useState, useCallback } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { v4 as uuidv4 } from 'uuid';
import KeywordsTagInput from './KeywordsTagInput';
import KeywordsActions from './KeywordsActions';
import KeywordsTextHelper from './KeywordsTextHelper';
import styles from './Main_Keywords.module.css';

const Main_Keywords = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { productKeywords, updateMasterTableData } = useMasterContext();

  const [keywords, setKeywords] = useState(pageData.product_keywords || []);
  const [showTextAreaHelper, setShowTextAreaHelper] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState('');

  useEffect(() => {
    setKeywords(pageData.product_keywords || []);
  }, [pageData.product_keywords]);

  const handleNewOptionAdd = useCallback(
    async (newOptionName) => {
      await updateMasterTableData('master_keywords', {
        id: newOptionName.id,
        name: newOptionName.name.toLowerCase(),
      });
    },
    [updateMasterTableData],
  );

  const parseKeywordsFromText = useCallback((text) => {
    return text
      .split(',')
      .map((kw) => kw.trim().toLowerCase())
      .filter((kw) => kw.length > 0);
  }, []);

  const handleConvertKeywords = useCallback(async () => {
    const parsedKeywords = parseKeywordsFromText(textAreaValue);

    if (parsedKeywords.length === 0) {
      alert(
        'No valid keywords found. Please enter keywords separated by commas.',
      );
      return;
    }

    const currentKeywordIds = new Set(keywords.map((kw) => kw.keyword_id));
    const keywordsToAdd = [];
    const keywordNamesToAdd = new Set();

    for (const keywordText of parsedKeywords) {
      const existingKeyword = productKeywords.find(
        (kw) => kw.name.toLowerCase() === keywordText,
      );

      if (existingKeyword) {
        keywordsToAdd.push(existingKeyword.id);
      } else {
        keywordNamesToAdd.add(keywordText);
      }
    }

    for (const keywordName of keywordNamesToAdd) {
      const newKeywordId = uuidv4();
      keywordsToAdd.push(newKeywordId);

      await updateMasterTableData('master_keywords', {
        id: newKeywordId,
        name: keywordName,
      });
    }

    const keywordsToAddFiltered = keywordsToAdd.filter(
      (kid) => !currentKeywordIds.has(kid),
    );

    const keywordsToRemove = Array.from(currentKeywordIds).filter(
      (kid) => !keywordsToAdd.includes(kid),
    );

    if (keywordsToAddFiltered.length > 0) {
      upsertProductPageData({
        product_keywords: keywordsToAddFiltered.map((kwid) => ({
          id: uuidv4(),
          product_id: pageData.id,
          keyword_id: kwid,
        })),
      });
    }

    if (keywordsToRemove.length > 0) {
      const keywordRelationsToDelete = pageData.product_keywords.filter((rel) =>
        keywordsToRemove.includes(rel.keyword_id),
      );

      upsertProductPageData({
        product_keywords: keywordRelationsToDelete.map((rel) => ({
          id: rel.id,
          _delete: true,
        })),
      });
    }

    setTextAreaValue('');
    setShowTextAreaHelper(false);
    alert('Keywords converted and synced successfully!');
  }, [
    textAreaValue,
    keywords,
    productKeywords,
    pageData,
    upsertProductPageData,
    updateMasterTableData,
    parseKeywordsFromText,
  ]);

  const handleReset = useCallback(() => {
    setTextAreaValue('');
  }, []);

  const handleConvertToText = useCallback(() => {
    if (keywords.length === 0) {
      alert('No keywords to convert. Add some keywords first.');
      return;
    }

    const keywordNames = keywords
      .map((kw) => {
        const keywordObj = productKeywords.find(
          (pk) => pk.id === kw.keyword_id,
        );
        return keywordObj ? keywordObj.name : '';
      })
      .filter((name) => name.length > 0)
      .join(', ');

    setTextAreaValue(keywordNames);

    navigator.clipboard
      .writeText(keywordNames)
      .then(() => {
        alert('Keywords copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy to clipboard');
      });
  }, [keywords, productKeywords]);

  return (
    <Main_InputContainer label={'Product Keywords'}>
      <div className={styles.keywordsContainer}>
        <KeywordsTagInput
          productKeywords={productKeywords}
          keywords={keywords}
          pageData={pageData}
          onKeywordsChange={upsertProductPageData}
          onAddNewOption={handleNewOptionAdd}
        />

        <KeywordsActions
          keywords={keywords}
          showTextAreaHelper={showTextAreaHelper}
          onToggleHelper={setShowTextAreaHelper}
          onConvertToText={handleConvertToText}
        />

        {showTextAreaHelper && (
          <KeywordsTextHelper
            textAreaValue={textAreaValue}
            onTextAreaChange={setTextAreaValue}
            onConvert={handleConvertKeywords}
            onReset={handleReset}
            parseKeywordsFromText={parseKeywordsFromText}
          />
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_Keywords;
