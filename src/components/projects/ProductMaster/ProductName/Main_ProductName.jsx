import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext';

const Main_ProductName = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    name: '',
    language: 1, // Default language ID
  };

  // Process product names from page data
  const processedProductNames = useMemo(() => {
    if (!pageData.productNames || pageData.productNames.length === 0) {
      // If there are no product names, return just one empty row
      return [{ id: `product-name-${Date.now()}-0`, ...template_data }];
    } else {
      // Otherwise, return the existing product names with ID check
      return pageData.productNames.map((item, index) => ({
        ...item,
        id: item.id || `product-name-${Date.now()}-${index}`,
      }));
    }
  }, [pageData.productNames]);

  // Initialize state with processed product names
  const [productNames, setProductNames] = useState(processedProductNames);
  const rowRef = useRef({});

  // Extract just the IDs for the ControlRowBtn
  const rowIds = useMemo(
    () => productNames.map((item) => item.id),
    [productNames]
  );

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update the productNames state when pageData changes
  useEffect(() => {
    setProductNames(processedProductNames);
  }, [processedProductNames]);

  // Handle row IDs changes
  const handleRowIdsChange = useCallback(
    (newRowIds) => {
      // Filter productNames to keep only the rows with IDs in newRowIds
      const updatedProductNames = productNames.filter((item) =>
        newRowIds.includes(item.id)
      );

      // Update both local state and context
      setProductNames(updatedProductNames);
      updateData('productNames', updatedProductNames);
    },
    [productNames, updateData]
  );

  // Handle adding a new row
  const handleRowAdd = useCallback(
    (newRowId) => {
      const newRow = {
        id: newRowId,
        ...template_data,
      };

      const updatedProductNames = [...productNames, newRow];

      // Update both local state and context
      setProductNames(updatedProductNames);
      updateData('productNames', updatedProductNames);
    },
    [productNames, template_data, updateData]
  );

  // Handle removing a row
  const handleRowRemove = useCallback(
    (rowId) => {
      const updatedProductNames = productNames.filter(
        (item) => item.id !== rowId
      );

      // Update both local state and context
      setProductNames(updatedProductNames);
      updateData('productNames', updatedProductNames);
    },
    [productNames, updateData]
  );

  // Handle field changes
  const handleProductNameChange = useCallback(
    (rowIndex, field, value) => {
      // Ensure we have a valid row index
      if (rowIndex < 0 || rowIndex >= productNames.length) return;

      const updatedProductNames = [...productNames];

      // Update the specified field
      updatedProductNames[rowIndex] = {
        ...updatedProductNames[rowIndex],
        [field]: value,
      };

      // Update both local state and context
      setProductNames(updatedProductNames);
      updateData('productNames', updatedProductNames);
    },
    [productNames, updateData]
  );

  return (
    <Main_InputContainer label="Product Names">
      <ControlRowBtn
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_ProductNameRow
          template_data={template_data}
          productNames={productNames}
          onChange={handleProductNameChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_ProductName;
