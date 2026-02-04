import { useCallback, useEffect, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_CustomizationRow from './Sub_CustomizationRow';
import { useProductContext } from '../../../../store/ProductContext';
import { v4 as uuidv4 } from 'uuid';

const Main_Customization = () => {
  const { pageData, upsertProductPageData } = useProductContext();

  const [rowIds, setRowIds] = useState(
    pageData.product_customizations?.map((el) => el.id) || [],
  );
  const [customizations, setCustomizations] = useState(
    pageData.product_customizations || [],
  );

  console.log('Customizations rendered:', rowIds, customizations);

  useEffect(() => {
    setRowIds(pageData.product_customizations?.map((el) => el.id) || []);
  }, [pageData, pageData.product_customizations]);

  useEffect(() => {
    setCustomizations(pageData.product_customizations || []);
  }, [pageData, pageData.product_customizations]);

  const handleRowAdd = () => {
    // Generate a new unique ID for the new row
    const newId = uuidv4();
    setRowIds((prevIds) => [...prevIds, newId]);
    upsertProductPageData('product_customizations', {
      id: newId,
      product_customization_images: [],
    });
  };

  const handleRowRemove = (idToRemove) => {
    setRowIds((prevIds) => prevIds.filter((id) => id !== idToRemove));
    upsertProductPageData('product_customizations', {
      id: idToRemove,
      _delete: true,
    });
  };

  return (
    <Main_InputContainer label="Customization Options">
      <ControlRowBtn
        rowIds={rowIds}
        // onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_CustomizationRow
          customizations={customizations}
          // onChange={handleCustomizationChange}
          // setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Customization;
