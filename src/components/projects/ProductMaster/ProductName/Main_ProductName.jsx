import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext.jsx';

const Main_ProductName = () => {
  const { pageData, updateData } = useProductContext();
  const prevRowCountRef = useRef(0);

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

  // Update local state when pageData changes
  useEffect(() => {
    setProductNames(processedProductNames);
  }, [processedProductNames]);

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

  // Calculate row count for ControlRowBtn
  const rowCount = Math.max(1, productNames.length);

  // Only generate a new key when rowCount changes
  const controlRowKeyRef = useRef(`product-names-${rowCount}`);

  // Update the key reference only when rowCount changes
  if (prevRowCountRef.current !== rowCount) {
    controlRowKeyRef.current = `product-names-${rowCount}-${Date.now()}`;
    prevRowCountRef.current = rowCount;
  }

  return (
    <>
      <Main_InputContainer label={'Product Name'}>
        <ControlRowBtn
          key={controlRowKeyRef.current}
          initialRowCount={rowCount}
        >
          <Sub_ProductNameRow
            productNames={productNames}
            onChange={handleProductNameChange}
          />
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};

export default Main_ProductName;
