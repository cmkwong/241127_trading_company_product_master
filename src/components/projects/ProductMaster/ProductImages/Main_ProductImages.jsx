import { useCallback, useEffect, useMemo, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import Sub_ProductImagesRow from './Sub_ProductImagesRow';
import { v4 as uuidv4 } from 'uuid';

const Main_ProductImages = (props) => {
  const { pageData, upsertProductPageData } = useProductContext();

  const [rowIds, setRowIds] = useState([]);

  const [processedImageData, setProcessedImageData] = useState([]);

  // prepare the image data grouped by image_type_id
  useEffect(() => {
    let imageData = [];
    let distinctTypeIds = [];
    // getting distinct image type ids from pageData
    if (pageData && pageData.product_images) {
      if (pageData.product_images) {
        distinctTypeIds = [
          ...new Set(pageData.product_images.map((img) => img.image_type_id)),
        ];
      }

      // group images by image_type_id and prepare the imageData for the component
      const validRowIds = [];
      for (let i = 0; i < distinctTypeIds.length; i++) {
        let row = {};
        // Use a generated ID if type ID is missing, but ensure it's stable within this render cycle?
        // Actually, we should probably filter out empty type IDs or handle them specifically.
        // For now, let's just ensure we have valid string IDs.
        const currentId = distinctTypeIds[i] || `temp-${uuidv4()}`; 
        
        row['id'] = currentId;
        row['images'] = pageData.product_images.filter(
          (d) => d.image_type_id === distinctTypeIds[i],
        );
        imageData.push(row);
        validRowIds.push(currentId);
      }
      setProcessedImageData(imageData);
      setRowIds(validRowIds);
    } else {
      setProcessedImageData([]);
      setRowIds([]);
    }
  }, [pageData]);

  const handleRowIdsChange = useCallback((newRowIds) => {
    // Handle any additional logic when row IDs change, if necessary
  }, []);

  const handleRowAdd = useCallback((newId) => {
    // Logic to add a new product image row
    setProcessedImageData((prevData) => [
      ...prevData,
      { id: newId, images: [] },
    ]);
    setRowIds((prevRowIds) => [...prevRowIds, newId]);
  }, []);

  // Logic to remove a product image row
  const handleRowRemove = useCallback(
    (rowId) => {
      setProcessedImageData((prevData) =>
        prevData.filter((d) => d.id !== rowId),
      );
      setRowIds((prevRowIds) => prevRowIds.filter((id) => id !== rowId));

      // get all the image id from the array
      const imagesToRemove =
        processedImageData
          .find((d) => d.id === rowId)
          ?.images.map((img) => img.id) || [];

      for (let i = 0; i < imagesToRemove.length; i++) {
        upsertProductPageData({
          product_images: [
            {
              id: imagesToRemove[i],
              _delete: true,
            },
          ],
        });
      }
    },
    [upsertProductPageData, processedImageData],
  );

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
