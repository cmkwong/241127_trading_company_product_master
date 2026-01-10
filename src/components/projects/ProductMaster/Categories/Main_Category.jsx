import { useState, useEffect, useMemo } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import styles from './Main_Category.module.css';
import { mockCategory } from '../../../../datas/Options/ProductOptions';
import { useProductContext } from '../../../../store/ProductContext';

const Main_Category = () => {
  const { pageData, updateProductPageData } = useProductContext();

  // Process category data from pageData
  const processedCategories = useMemo(() => {
    return pageData.category || [];
  }, [pageData.category]);

  // Initialize state with processed categories
  const [selectedCategoryIds, setSelectedCategoryIds] =
    useState(processedCategories);

  // Update local state when pageData changes
  useEffect(() => {
    setSelectedCategoryIds(processedCategories);
  }, [processedCategories]);

  // Handle category changes and update the context
  const handleCategoryChange = (nextOptions, nextSelectedIds) => {
    // Update both local state and context
    setSelectedCategoryIds(nextSelectedIds);
    updateProductPageData('category', nextSelectedIds);
  };

  return (
    <Main_InputContainer label={'Category'}>
      <Main_TagInputField
        key={`category-input-${selectedCategoryIds.length}`}
        options={mockCategory}
        selectedOptions={selectedCategoryIds}
        onChange={handleCategoryChange}
      />
    </Main_InputContainer>
  );
};

export default Main_Category;
