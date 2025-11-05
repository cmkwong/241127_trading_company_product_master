import { useState, useEffect } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import styles from './Main_Category.module.css';
import { mockCategory } from '../../../../datas/Options/ProductOptions';
import { useProductContext } from '../../../../store/ProductContext';

const Main_Category = () => {
  const { pageData, updateData } = useProductContext();

  // Initialize state with category IDs from pageData
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    pageData.category || []
  );

  // Update local state when pageData changes
  useEffect(() => {
    setSelectedCategoryIds(pageData.category || []);
  }, [pageData.category]);

  // Handle category changes and update the context
  const handleCategoryChange = (nextOptions, nextSelectedIds) => {
    setSelectedCategoryIds(nextSelectedIds);
    updateData('category', nextSelectedIds);
  };

  return (
    <Main_InputContainer label={'Category'}>
      <Main_TagInputField
        options={mockCategory}
        selectedOptions={selectedCategoryIds}
        onChange={handleCategoryChange}
      />
    </Main_InputContainer>
  );
};

export default Main_Category;
