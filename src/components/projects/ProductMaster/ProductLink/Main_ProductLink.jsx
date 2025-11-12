import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Main_ProductLink.module.css';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductLinkRow from './Sub_ProductLinkRow';
import { useProductContext } from '../../../../store/ProductContext';
import { useRowsHandler } from '../../../../utils/formHandlers';

const Main_ProductLink = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    link: '',
    images: [],
    remark: '',
    date: new Date().toISOString().split('T')[0],
  };

  // Use useMemo to process the product links from pageData
  const processedProductLinks = useMemo(() => {
    if (!pageData.productLinks || pageData.productLinks.length === 0) {
      // If there are no product links, return just one empty row
      return [{ id: 1, ...template_data }];
    } else {
      // Otherwise, return the existing product links
      return pageData.productLinks;
    }
  }, [pageData.productLinks]);

  // Initialize state with processed product links
  const [rowCount, setRowCount] = useState(processedProductLinks.length);
  const [productLinks, setProductLinks] = useState(processedProductLinks);
  const rowRef = useRef({});

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update the productLinks state when pageData changes
  useEffect(() => {
    setProductLinks(processedProductLinks);
    setRowCount(processedProductLinks.length);
  }, [processedProductLinks]);

  // Handle row count changes from ControlRowBtn
  const handleRowsChange = useCallback(
    (newRowCount) => {
      // Create a copy of the current product links
      let updatedProductLinks = [...productLinks];

      // If we need more rows, add them
      if (newRowCount > updatedProductLinks.length) {
        for (let i = updatedProductLinks.length; i < newRowCount; i++) {
          updatedProductLinks.push({
            id: `product-link-${Date.now()}-${i}`,
            ...template_data,
          });
        }
      }
      // If we need fewer rows, remove from the end
      else if (newRowCount < updatedProductLinks.length) {
        updatedProductLinks = updatedProductLinks.slice(0, newRowCount);
      }

      // Update both local state and context
      setProductLinks(updatedProductLinks);
      updateData('productLinks', updatedProductLinks);
      setRowCount(newRowCount);
    },
    [productLinks, template_data, updateData]
  );

  const handleProductLinkChange = useCallback(
    (rowIndex, field, value) => {
      // Ensure we have a valid row index
      if (rowIndex < 0 || rowIndex >= productLinks.length) return;

      const updatedProductLinks = [...productLinks];

      // Update the specified field
      updatedProductLinks[rowIndex] = {
        ...updatedProductLinks[rowIndex],
        [field]: value,
      };

      // Update both local state and context
      setProductLinks(updatedProductLinks);
      updateData('productLinks', updatedProductLinks);
    },
    [productLinks, updateData]
  );

  return (
    <Main_InputContainer label="Product Links">
      <ControlRowBtn
        initialRowCount={rowCount}
        setRowCount={setRowCount}
        onRowsChange={handleRowsChange}
      >
        <Sub_ProductLinkRow
          template_data={template_data}
          productLinks={productLinks}
          onChange={handleProductLinkChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_ProductLink;
