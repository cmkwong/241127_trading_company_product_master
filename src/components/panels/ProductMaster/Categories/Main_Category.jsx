import { useState, useEffect } from 'react';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import {
  upsertEntityData,
  useEntityRows,
  useEntityField,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';

const Main_Category = () => {
  const { category } = useMasterContext();
  const productId = useEntityField('products', 'id');
  const productCategories = useEntityRows('products', 'product_categories');

  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  useEffect(() => {
    setSelectedCategoryIds(
      (productCategories || []).map((el) => el.category_id),
    );
  }, [productCategories]);

  const handleCategoryChange = (ov, nv) => {
    if (nv.length > ov.length) {
      const addedCategories = nv.filter((id) => !ov.includes(id));
      addedCategories.forEach((catId) => {
        upsertEntityData('products', {
          product_categories: [
            {
              product_id: productId,
              category_id: catId,
            },
          ],
        });
      });
    } else if (nv.length < ov.length) {
      const removedCategories = ov.filter((id) => !nv.includes(id));
      const categoryRelationsToDelete = (productCategories || []).filter(
        (rel) => removedCategories.includes(rel.category_id),
      );

      categoryRelationsToDelete.forEach((rel) => {
        upsertEntityData('products', {
          product_categories: [
            {
              id: rel.id,
              product_id: productId,
              category_id: rel.category_id,
              _delete: true,
            },
          ],
        });
      });
    }
  };

  return (
    <Main_InputContainer label="Product Category">
      <Main_TagInputField
        key={`category-input`}
        defaultOptions={category}
        defaultSelectedOptions={selectedCategoryIds}
        onChange={handleCategoryChange}
        canAddNewOptions={false}
        enableHierarchyViewToggle={true}
        hierarchyToggleLabel="Show Hierarchy"
      />
    </Main_InputContainer>
  );
};

export default Main_Category;
