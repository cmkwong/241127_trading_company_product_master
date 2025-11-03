import { useState, useEffect } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import styles from './Main_Category.module.css';
import {
  getLabelsFromLookup,
  mockCategory,
} from '../../../../datas/Options/ProductOptions';
import { useProductContext } from '../../../../store/ProductContext';

const Main_Category = () => {
  const { pageData, updateData } = useProductContext();

  // Initialize state with category from pageData
  // const [selectedCategory, setSelectedCategory] = useState(
  //   getLabelsFromLookup(pageData.category || [], mockCategory)
  // );
  const [selectedCategory, setSelectedCategory] = useState(
    pageData.category || []
  );

  console.log(getLabelsFromLookup(pageData.category || [], mockCategory));

  // Update local state when pageData changes
  useEffect(() => {
    setSelectedCategory(pageData.category || []);
  }, [pageData.category]);

  // Handle category changes and update the context
  const handleCategoryChange = (newValue) => {
    setSelectedCategory(newValue);
    updateData('category', newValue);
  };
  console.log('selectedCategory: ', selectedCategory);

  return (
    <Main_InputContainer label={'Category'}>
      <Main_TagInputField
        defaultOptions={mockCategory}
        defaultSelectedOptions={selectedCategory}
        onChange={handleCategoryChange}
      />
    </Main_InputContainer>
  );
};

export default Main_Category;
