import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext.jsx';

const Main_ProductName = () => {
  const { pageData, updateData } = useProductContext();
  const rowRefs = useRef({});

  // Process productNames from pageData with proper validation
  const processedProductNames = useMemo(() => {
    if (!pageData.productName || pageData.productName.length === 0) {
      return [{ id: 1, name: '', type: 1 }];
    } else if (typeof pageData.productName === 'string') {
      return [{ id: 1, name: pageData.productName, type: 1 }];
    } else {
      return pageData.productName;
    }
  }, [pageData.productName]);

  // Use the processed names as state
  const [productNames, setProductNames] = useState(processedProductNames);

  // Update productNames when pageData changes
  useEffect(() => {
    setProductNames(processedProductNames);
  }, [processedProductNames]);

  // Track row count for ControlRowBtn
  const [rowCount, setRowCount] = useState(Math.max(1, productNames.length));

  // Update rowCount when productNames changes
  useEffect(() => {
    setRowCount(Math.max(1, processedProductNames.length));
  }, [processedProductNames]);

  // Handle row count changes from ControlRowBtn
  const handleRowsChange = useCallback(
    (newRowCount) => {
      // Ensure productNames array has the correct number of items
      const currentNames = [...productNames];

      // If we need more rows, add empty ones
      if (newRowCount > currentNames.length) {
        for (let i = currentNames.length; i < newRowCount; i++) {
          currentNames.push({ id: i + 1, name: '', type: 1 });
        }

        // Update the context with the new array
        updateData('productName', currentNames);

        // Focus the new row after a short delay
        setTimeout(() => {
          const newRowIndex = newRowCount - 1;
          if (rowRefs.current[newRowIndex]) {
            rowRefs.current[newRowIndex].focus();
          }
        }, 50);
      }
      // If we need fewer rows, remove from the end
      else if (newRowCount < currentNames.length) {
        currentNames.splice(newRowCount);
        updateData('productName', currentNames);
      }
    },
    [productNames, updateData]
  );

  // handle the product name fields being changed
  const handleProductNameChange = useCallback(
    (rowindex, field, value) => {
      const updatedProductNames = [...productNames];

      // Ensure the row exists in our array
      if (!updatedProductNames[rowindex]) {
        updatedProductNames[rowindex] = { id: rowindex + 1, name: '', type: 1 };
      }

      // Update the specified field
      updatedProductNames[rowindex] = {
        ...updatedProductNames[rowindex],
        [field]: value,
      };

      updateData('productName', updatedProductNames);
    },
    [updateData, productNames]
  );

  // Generate a key that changes when productNames length changes
  const controlRowKey = `product-names-${processedProductNames.length}`;

  // Set up ref for a row
  const setRowRef = useCallback((index, ref) => {
    rowRefs.current[index] = ref;
  }, []);

  return (
    <>
      <Main_InputContainer label={'Product Name'}>
        <ControlRowBtn
          key={controlRowKey}
          initialRowCount={rowCount}
          setRowCount={setRowCount}
          onRowsChange={handleRowsChange}
        >
          <Sub_ProductNameRow
            productNames={productNames}
            onChange={handleProductNameChange}
            setRowRef={setRowRef}
          />
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};

export default Main_ProductName;
