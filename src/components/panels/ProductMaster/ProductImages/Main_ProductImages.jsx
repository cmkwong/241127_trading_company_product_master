import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import EditableDataForm from '../../../common/Forms/EditableDataForm';
import {
  upsertEntityData,
  useEntityRows,
} from '../../../../store/GeneralContext';
import Sub_ProductImagesRow from './Sub_ProductImagesRow';

const Main_ProductImages = () => {
  const productImages = useEntityRows('products', 'product_images');

  const [processedImageData, setProcessedImageData] = useState([]);

  useEffect(() => {
    const images = productImages || [];

    if (!images.length) {
      setProcessedImageData([]);
      return;
    }

    const groupedByImageRow = new Map();

    images.forEach((img) => {
      const imageRowId = img.image_row || `legacy-${img.id}`;
      if (!groupedByImageRow.has(imageRowId)) {
        groupedByImageRow.set(imageRowId, {
          id: imageRowId,
          images: [],
        });
      }
      groupedByImageRow.get(imageRowId).images.push(img);
    });

    setProcessedImageData(Array.from(groupedByImageRow.values()));
  }, [productImages]);

  const handleRowAdd = useCallback(() => {
    const newId = uuidv4();
    setProcessedImageData((prevData) => [
      ...prevData,
      { id: newId, images: [] },
    ]);
  }, []);

  const handleRowRemove = useCallback(
    (row) => {
      const rowId = row?.id;

      setProcessedImageData((prevData) =>
        prevData.filter((d) => d.id !== rowId),
      );

      const imagesToRemove = (row?.images || []).map((img) => img.id);

      for (let i = 0; i < imagesToRemove.length; i++) {
        upsertEntityData('products', {
          product_images: [
            {
              id: imagesToRemove[i],
              _delete: true,
            },
          ],
        });
      }
    },
    [upsertEntityData],
  );

  const handleRowsReorder = useCallback(
    (orderedRowKeys = []) => {
      const keySet = orderedRowKeys.filter(Boolean);
      if (keySet.length === 0) return;

      const patches = [];

      keySet.forEach((rowKey, index) => {
        const row = processedImageData.find((d) => d.id === rowKey);
        (row?.images || []).forEach((img) => {
          patches.push({
            id: img.id,
            display_order: index + 1,
          });
        });
      });

      if (patches.length > 0) {
        upsertEntityData('products', {
          product_images: patches,
        });
      }
    },
    [processedImageData, upsertEntityData],
  );

  const columns = [
    {
      key: 'images',
      label: '',
      renderCell: (row, { rowIndex }) => (
        <Sub_ProductImagesRow
          imageData={processedImageData}
          rowindex={rowIndex}
          rowId={row.id}
        />
      ),
    },
  ];

  return (
    <Main_InputContainer label="Product Images">
      <EditableDataForm
        rows={processedImageData}
        columns={columns}
        rowKey="id"
        emptyMessage="No image rows added yet."
        onAddRow={handleRowAdd}
        addRowText="Add Image Row"
        onRemoveRow={handleRowRemove}
        showRowBadge
        // draggableRows
        onRowsReorder={handleRowsReorder}
      />
    </Main_InputContainer>
  );
};

export default Main_ProductImages;
