import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import EmptyState from '../../../common/State/EmptyState';
import { useProductContext } from '../../../../store/ProductContext';
import Sub_ProductImagesRow from './Sub_ProductImagesRow';
import styles from './Main_ProductImages.module.css';

const Main_ProductImages = () => {
  const { pageData, upsertProductPageData } = useProductContext();

  const [rowIds, setRowIds] = useState([]);
  const [processedImageData, setProcessedImageData] = useState([]);

  useEffect(() => {
    const images = pageData?.product_images || [];

    if (!images.length) {
      setProcessedImageData([]);
      setRowIds([]);
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

    const imageData = Array.from(groupedByImageRow.values());
    const validRowIds = imageData.map((row) => row.id);

    setProcessedImageData(imageData);
    setRowIds(validRowIds);
  }, [pageData?.product_images]);

  const handleRowAdd = useCallback(() => {
    const newId = uuidv4();
    setProcessedImageData((prevData) => [
      ...prevData,
      { id: newId, images: [] },
    ]);
    setRowIds((prevRowIds) => [...prevRowIds, newId]);
  }, []);

  const handleRowRemove = useCallback(
    (rowId) => {
      setProcessedImageData((prevData) =>
        prevData.filter((d) => d.id !== rowId),
      );
      setRowIds((prevRowIds) => prevRowIds.filter((id) => id !== rowId));

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
    <Main_InputContainer
      label="Product Images"
      onAddNew={handleRowAdd}
      addNewText="Add Image Row"
    >
      <div className={styles.list}>
        {rowIds.length === 0 ? (
          <EmptyState message="No image rows added yet." />
        ) : (
          rowIds.map((rowId, rowIndex) => (
            <div key={rowId} className={styles.row}>
              <Sub_ProductImagesRow
                imageData={processedImageData}
                rowId={rowId}
                rowindex={rowIndex}
              />
              <div className={styles.rowBadge}>
                <span className={styles.rowBadgeText}>{rowIndex + 1}</span>
              </div>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRowRemove(rowId)}
                title="Remove row"
                aria-label={`Remove row ${rowIndex + 1}`}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_ProductImages;
