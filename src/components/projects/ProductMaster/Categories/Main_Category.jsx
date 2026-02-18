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

  // Handle category changes and update the context
  const handleCategoryChange = (ov, nv) => {
    if (nv.length > ov.length) {
      // Category added
      const addedCategories = nv.filter((id) => !ov.includes(id));
      addedCategories.forEach((catId) => {
        upsertProductPageData({
          product_categories: [
            {
              product_id: pageData.id,
              category_id: catId,
            },
          ],
        });
      });
    } else if (nv.length < ov.length) {
      // Category removed
      const removedCategories = ov.filter((id) => !nv.includes(id));

      // find the id of the product-category relationship to delete based on product_id and category_id
      const categoryRelationsToDelete = pageData.product_categories.filter(
        (rel) => removedCategories.includes(rel.category_id),
      );

      categoryRelationsToDelete.forEach((rel) => {
        upsertProductPageData({
          product_categories: [
            {
              id: rel.id, // Assuming rel.id is the unique identifier for the product-category relationship
              product_id: pageData.id,
              category_id: rel.category_id,
              _delete: true, // Flag to indicate deletion for backend processing
            },
          ],
        });
      });
    }
  };

  return (
    <Main_InputContainer label={'Category'}>
      <Main_TagInputField
        key={`category-input`}
        defaultOptions={category}
        defaultSelectedOptions={selectedCategoryIds}
        onChange={handleCategoryChange}
        canAddNewOptions={false}
      />
    </Main_InputContainer>
  );
};

export default Main_Category;
