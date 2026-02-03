import { useState, useEffect, useMemo } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_Category.module.css';
const Main_Category = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { category } = useMasterContext();

  // Initialize state with processed categories
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    pageData.product_categories?.map((el) => el.category_id) || [],
  );

  // Update selectedCategoryIds when pageData changes
  useEffect(() => {
    setSelectedCategoryIds(
      pageData.product_categories?.map((el) => el.category_id) || [],
    );
  }, [pageData, pageData.product_categories]);

  console.log('selectedCategoryIds: ', selectedCategoryIds);

  // Handle category changes and update the context
  const handleCategoryChange = (nextOptions, nextSelectedIds) => {
    // Update both local state and context
    // setSelectedCategoryIds(nextSelectedIds);
    // upsertProductPageData('category', nextSelectedIds);
  };

  return (
    <Main_InputContainer label={'Category'}>
      <Main_TagInputField
        key={`category-input`}
        defaultOptions={category}
        defaultSelectedOptions={selectedCategoryIds}
        onChange={handleCategoryChange}
      />
    </Main_InputContainer>
  );
};

export default Main_Category;
