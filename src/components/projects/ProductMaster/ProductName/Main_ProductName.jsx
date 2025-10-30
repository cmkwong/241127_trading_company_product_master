import { useState, useEffect } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useProductContext } from '../../../../store/ProductContext';

const Main_ProductName = () => {
  const { pageData, updateData } = useProductContext;
  console.log('pageData, updateData: ', pageData, updateData);
  const [productNames, setProductNames] = useState(pageData.productName || []);

  // Initialize with default data if none exists
  useEffect(() => {
    if (!pageData.productName || pageData.productName.length === 0) {
      const initialProductName = [{ id: 1, name: '', type: 1 }];
      updateData('productName', initialProductName);
    } else if (typeof pageData.productName === 'string') {
      // Convert string productName to array format
      const initialProductName = [
        { id: 1, name: pageData.productName, type: 1 },
      ];
      setProductNames(initialProductName);
    } else {
      setProductNames(pageData.productName);
    }
  }, [pageData.productName, updateData]);

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

    setProductNames(updatedProductNames);
    updateData('productName', updatedProductNames);
  };

  return (
    <>
      <Main_InputContainer label={'Product Name'}>
        <ControlRowBtn initialRowCount={Math.max(1, productNames.length)}>
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
