import { useCallback, useEffect, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import Sub_ProductImagesRow from './Sub_ProductImagesRow';

const Main_ProductImages = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { productImageType } = useMasterContext();

  const [rowIds, setRowIds] = useState([]);

  const [processedImageData, setProcessedImageData] = useState([]);

  // prepare the image data grouped by MAIN image_type_id
  // e.g. Alibaba - description/display/video are grouped under Alibaba
  useEffect(() => {
    const images = pageData?.product_images || [];

    if (!images.length) {
      setProcessedImageData([]);
      setRowIds([]);
      return;
    }

    const imageTypeById = new Map(
      (productImageType || []).map((t) => [t.id, t]),
    );

    const resolveMainTypeId = (typeId) => {
      if (!typeId) return '__unassigned__';
      const type = imageTypeById.get(typeId);
      if (!type) return typeId;
      return type.parent_id || type.id;
    };

    const groupedByMainType = new Map();

    images.forEach((img) => {
      const mainTypeId = resolveMainTypeId(img.image_type_id);
      if (!groupedByMainType.has(mainTypeId)) {
        groupedByMainType.set(mainTypeId, {
          id: mainTypeId,
          images: [],
        });
      }
      groupedByMainType.get(mainTypeId).images.push(img);
    });

    const imageData = Array.from(groupedByMainType.values());
    const validRowIds = imageData.map((row) => row.id);

    setProcessedImageData(imageData);
    setRowIds(validRowIds);
  }, [pageData?.product_images, productImageType]);

  const handleRowIdsChange = useCallback(() => {
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
