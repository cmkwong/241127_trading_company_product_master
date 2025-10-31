import { useState, useEffect, useMemo } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext.jsx';

const Main_ProductName = () => {
  const { pageData, updateData } = useProductContext();

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

  // Initialize with default data if none exists
  useEffect(() => {
    setProductNames(pageData.productName);
  }, [pageData.productName]);

  // handle the product name fields being changed
  const handleProductNameChange = (rowindex, field, value) => {
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

    // setProductNames(updatedProductNames);
    updateData('productName', updatedProductNames);
  };
  // Added a unique key prop to ControlRowBtn that changes when rowCount changes, forcing React to recreate the component
  // Calculate row count for ControlRowBtn - use key to force re-render
  const rowCount = Math.max(1, productNames.length);
  const controlRowKey = `product-names-${rowCount}-${Date.now()}`;
  return (
    <>
      <Main_InputContainer label={'Product Name'}>
        <ControlRowBtn key={controlRowKey} initialRowCount={rowCount}>
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
