import { useCallback, useEffect, useMemo, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import Sub_ProductImagesRow from './Sub_ProductImagesRow';

const Main_ProductImages = (props) => {
  const { pageData } = useProductContext();

  const [rowIds, setRowIds] = useState([]);

  const [processedImageData, setProcessedImageData] = useState([]);

  // prepare the image data grouped by image_type_id
  useMemo(() => {
    let imageData = [];
    let distinctTypeIds;
    // getting distinct image type ids from pageData
    if (pageData && pageData.product_images) {
      if (pageData.product_images) {
        distinctTypeIds = [
          ...new Set(pageData.product_images.map((img) => img.image_type_id)),
        ];
      }
      // group images by image_type_id and prepare the imageData for the component
      for (let i = 0; i < distinctTypeIds.length; i++) {
        let row = {};
        // let the image type id as the row id for now, can be changed to something else if needed
        row['id'] = distinctTypeIds[i];
        row['images'] = pageData.product_images.filter(
          (d) => d.image_type_id === distinctTypeIds[i],
        );
        imageData.push(row);
      }
      setProcessedImageData(imageData);
      setRowIds(distinctTypeIds);
    } else {
      setProcessedImageData([]);
      setRowIds([]);
    }
  }, [pageData]);

  console.log('rowIds:', rowIds);
  console.log('processedImageData:', processedImageData);

  const handleRowIdsChange = useCallback((newRowIds) => {
    // Handle any additional logic when row IDs change, if necessary
  }, []);

  const handleRowAdd = useCallback((newId) => {
    // Logic to add a new product image row
  }, []);

  const handleRowRemove = useCallback((rowId) => {
    // Logic to remove a product image row by rowId
  }, []);

  return (
    <Main_InputContainer label="Product Images">
      <ControlRowBtn
        rowIds={rowIds}
        onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_ProductImagesRow imageData={processedImageData} />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_ProductImages;
