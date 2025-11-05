import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext.jsx';
import { useRowsHandler } from '../../../../utils/formHandlers.js';

const Main_ProductName = () => {
  const { pageData, updateData } = useProductContext();
  const rowRef = useRef({});

  const template_data = {
    name: '',
    type: 1,
  };

  // Process productNames from pageData with proper validation
  const processedProductNames = useMemo(() => {
    if (!pageData.productName || pageData.productName.length === 0) {
      return [{ id: 1, ...template_data }];
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
  const handleRowsChange = useRowsHandler(
    productNames,
    updateData,
    'productName',
    template_data,
    rowRef
  );

  // handle the product name fields being changed
  const handleProductNameChange = useCallback(
    (rowindex, field, value) => {
      const updatedProductNames = [...productNames];

      // Ensure the row exists in our array
      if (!updatedProductNames[rowindex]) {
        updatedProductNames[rowindex] = { id: rowindex + 1, ...template_data };
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
  // const controlRowKey = `product-names-${processedProductNames.length}`;

  // Set up ref for a row
  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  return (
    <>
      <Main_InputContainer label={'Product Name'}>
        <ControlRowBtn
          // key={controlRowKey}
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
