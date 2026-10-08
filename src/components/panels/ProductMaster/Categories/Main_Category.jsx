import { useState, useEffect, useMemo } from 'react';
import Header from '../../../common/Texts/Header';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import {
  upsertEntityData,
  useEntityRows,
  useEntityField,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_Category.module.css';

const Main_Category = () => {
  const { category } = useMasterContext();
  const productId = useEntityField('products', 'id');
  const productCategories = useEntityRows('products', 'product_categories');

  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const categoryOptions = useMemo(
    () =>
      (category || []).map((item) => {
        const chineseName = String(item?.description_trad_chinese || '').trim();
        if (!chineseName) return item;
        return { ...item, name: `${item.name} (${chineseName})` };
      }),
    [category],
  );

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
    <>
      <Header as="h3" size="L" text="Product Category" />
      <Main_TagInputField
        key={`category-input`}
        defaultOptions={categoryOptions}
        defaultSelectedOptions={selectedCategoryIds}
        onChange={handleCategoryChange}
        canAddNewOptions={false}
        enableHierarchyViewToggle={true}
        hierarchyToggleLabel="Show Hierarchy"
      />
    </>
  );
};

export default Main_Category;
