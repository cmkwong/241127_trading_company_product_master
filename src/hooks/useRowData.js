import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for managing row-based data with unique IDs
 */
const useRowData = ({ data, updateProductPageData, dataKey }) => {
  // 1. Process data: Ensure every item has a UUID
  // We use a ref to track if we have initialized to avoid infinite loops
  const processedData = useMemo(() => {
    // If no data, return one empty row
    if (!data || data.length === 0) {
      return [{ id: uuidv4() }];
    }

    // Map existing data, ensuring IDs exist
    return data.map((item) => ({
      ...item,
      id: item.id || uuidv4(), // Use UUID instead of index
    }));
  }, [data]);

  // Initialize state
  const [rowDatas, setRowDatas] = useState(processedData);
  const rowRef = useRef({});

  // 2. Sync: Update local state when parent data changes externally
  useEffect(() => {
    // We perform a length check or ID check to see if we need to resync
    // This is much faster than JSON.stringify
    if (data && data.length !== rowDatas.length) {
      setRowDatas(processedData);
    } else {
      // Optional: Check if IDs match to detect reordering/swapping
      const isIdsDifferent =
        data && data.some((item, i) => item.id !== rowDatas[i]?.id);
      if (isIdsDifferent) {
        setRowDatas(processedData);
      }
    }
  }, [processedData]);

  const rowIds = useMemo(() => rowDatas.map((item) => item.id), [rowDatas]);

  // Set row reference
  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // 3. Handle adding a new row
  const handleRowAdd = useCallback(() => {
    const newRow = {
      id: uuidv4(), // Generate clean UUID
    };

    const updatedData = [...rowDatas, newRow];
    const newRowIndex = updatedData.length - 1;

    // Focus the newly added row after state update
    setTimeout(() => {
      if (rowRef.current[newRowIndex]?.focus) {
        rowRef.current[newRowIndex].focus();
      }
    }, 0);

    setRowDatas(updatedData);
    updateProductPageData(dataKey, updatedData);
  }, [rowDatas, updateProductPageData, dataKey]);

  // 4. Handle removing a row
  const handleRowRemove = useCallback(
    (rowId) => {
      const updatedData = rowDatas.filter((item) => item.id !== rowId);
      setRowDatas(updatedData);
      updateProductPageData(dataKey, updatedData);
    },
    [rowDatas, updateProductPageData, dataKey],
  );

  // 5. Handle field changes (Optimized)
  const handleFieldChange = useCallback(
    (rowIndex, field, value) => {
      setRowDatas((prevData) => {
        if (rowIndex < 0 || rowIndex >= prevData.length) return prevData;

        const newData = [...prevData];
        const currentRow = { ...newData[rowIndex] };

        // Handle nested fields (e.g., 'dimension.width')
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          currentRow[parent] = {
            ...currentRow[parent],
            [child]: value,
          };
        } else {
          currentRow[field] = value;
        }

        newData[rowIndex] = currentRow;

        // Sync with parent immediately
        // Note: In high-frequency typing, you might want to debounce this call
        updateProductPageData(dataKey, newData);

        return newData;
      });
    },
    [updateProductPageData, dataKey],
  );

  // 6. Handle Reordering (via ControlRowBtn)
  const handleRowIdsChange = useCallback(
    (oldRowIds, newRowIds) => {
      // Sort the current data based on the new ID order
      const updatedData = newRowIds
        .map((id) => rowDatas.find((item) => item.id === id))
        .filter(Boolean); // Remove undefined if any

      if (
        updatedData.length !== rowDatas.length ||
        updatedData.some((item, i) => item.id !== rowDatas[i].id)
      ) {
        setRowDatas(updatedData);
        updateProductPageData(dataKey, updatedData);
      }
    },
    [rowDatas, updateProductPageData, dataKey],
  );

  return {
    rowDatas,
    rowIds,
    rowRef,
    setRowRef,
    handleRowIdsChange,
    handleRowAdd,
    handleRowRemove,
    handleFieldChange,
  };
};

export default useRowData;
