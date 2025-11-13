import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Main_ProductLink.module.css';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductLinkRow from './Sub_ProductLinkRow';
import { useProductContext } from '../../../../store/ProductContext';

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
      return [{ id: `product-link-${Date.now()}-0`, ...template_data }];
    } else {
      // Otherwise, return the existing product links with ID check
      return pageData.productLinks.map((item, index) => ({
        ...item,
        id: item.id || `product-link-${Date.now()}-${index}`,
      }));
    }
  }, [pageData.productLinks]);

  // Initialize state with processed product links
  const [productLinks, setProductLinks] = useState(processedProductLinks);
  const rowRef = useRef({});

  // Extract just the IDs for the ControlRowBtn
  const rowIds = useMemo(
    () => productLinks.map((item) => item.id),
    [productLinks]
  );

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update the productLinks state when pageData changes
  useEffect(() => {
    setProductLinks(processedProductLinks);
  }, [processedProductLinks]);

  // Handle row IDs changes
  const handleRowIdsChange = useCallback(
    (newRowIds) => {
      // Filter productLinks to keep only the rows with IDs in newRowIds
      const updatedProductLinks = productLinks.filter((item) =>
        newRowIds.includes(item.id)
      );

      // Update both local state and context
      setProductLinks(updatedProductLinks);
      updateData('productLinks', updatedProductLinks);
    },
    [productLinks, updateData]
  );

  // Handle adding a new row
  const handleRowAdd = useCallback(
    (newRowId) => {
      const newRow = {
        id: newRowId,
        ...template_data,
        date: new Date().toISOString().split('T')[0], // Ensure date is always current
      };

      const updatedProductLinks = [...productLinks, newRow];

      // Update both local state and context
      setProductLinks(updatedProductLinks);
      updateData('productLinks', updatedProductLinks);
    },
    [productLinks, template_data, updateData]
  );

  // Handle removing a row
  const handleRowRemove = useCallback(
    (rowId) => {
      const updatedProductLinks = productLinks.filter(
        (item) => item.id !== rowId
      );

      // Update both local state and context
      setProductLinks(updatedProductLinks);
      updateData('productLinks', updatedProductLinks);
    },
    [productLinks, updateData]
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
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
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
