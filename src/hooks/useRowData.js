import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

/**
 * Custom hook for managing row-based data with unique IDs
 * @param {Object} options - Configuration options
 * @param {Array} options.data - The data from the context
 * @param {Function} options.updateData - Function to update data in the context
 * @param {String} options.dataKey - The key in the context where data is stored
 * @param {Object} options.template - Template for new rows
 * @param {String} options.idPrefix - Prefix for generated IDs
 * @returns {Object} - Row data state and handlers
 */
const useRowData = ({ data, updateData, dataKey, template, idPrefix }) => {
  // Use a ref to store the timestamp for stable ID generation
  const timestampRef = useRef(Date.now());

  // Process data to ensure all items have IDs
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      // If there's no data, return just one empty row
      return [{ id: `${idPrefix}-${timestampRef.current}-0`, ...template }];
    } else {
      // Otherwise, return the existing data with ID check
      return data.map((item, index) => ({
        ...item,
        id: item.id || `${idPrefix}-${timestampRef.current}-${index}`,
      }));
    }
  }, [data, idPrefix, template]);

  // Initialize state with processed data
  const [rowData, setRowData] = useState(processedData);
  const rowRef = useRef({});

  // Extract just the IDs for the ControlRowBtn
  const rowIds = useMemo(() => rowData.map((item) => item.id), [rowData]);

  // Update the state when data changes, but only if the data is different
  useEffect(() => {
    // Deep comparison to prevent unnecessary updates
    const isDataDifferent =
      JSON.stringify(rowData) !== JSON.stringify(processedData);
    if (isDataDifferent) {
      setRowData(processedData);
    }
  }, [processedData]);

  // Set row reference
  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Handle row IDs changes
  const handleRowIdsChange = useCallback(
    (newRowIds) => {
      // Filter data to keep only the rows with IDs in newRowIds
      const updatedData = rowData.filter((item) => newRowIds.includes(item.id));

      // Only update if there's an actual change
      if (updatedData.length !== rowData.length) {
        // Update both local state and context
        setRowData(updatedData);
        updateData(dataKey, updatedData);
      }
    },
    [rowData, updateData, dataKey]
  );

  // Handle adding a new row
  const handleRowAdd = useCallback(
    (newRowId) => {
      // Create new row with the provided ID and template data
      const newRow = {
        id: newRowId,
        ...template,
      };

      // For date fields, ensure they're always current
      if (template.date) {
        newRow.date = new Date().toISOString().split('T')[0];
      }

      const updatedData = [...rowData, newRow];

      // Update both local state and context
      setRowData(updatedData);
      updateData(dataKey, updatedData);
    },
    [rowData, template, updateData, dataKey]
  );

  // Handle removing a row
  const handleRowRemove = useCallback(
    (rowId) => {
      const updatedData = rowData.filter((item) => item.id !== rowId);

      // Update both local state and context
      setRowData(updatedData);
      updateData(dataKey, updatedData);
    },
    [rowData, updateData, dataKey]
  );

  // Handle field changes
  const handleFieldChange = useCallback(
    (rowIndex, field, value) => {
      // Ensure we have a valid row index
      if (rowIndex < 0 || rowIndex >= rowData.length) return;

      const updatedData = [...rowData];

      // Handle nested fields (like dimension.length)
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [parentField]: {
            ...updatedData[rowIndex][parentField],
            [childField]: value,
          },
        };
      } else {
        // Update the specified field
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [field]: value,
        };
      }

      // Update both local state and context
      setRowData(updatedData);
      updateData(dataKey, updatedData);
    },
    [rowData, updateData, dataKey]
  );

  return {
    rowData,
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
