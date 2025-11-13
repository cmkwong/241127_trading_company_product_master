import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_CustomizationRow from './Sub_CustomizationRow';
import { useProductContext } from '../../../../store/ProductContext';

const Main_Customization = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    type: 1,
    description: '',
    minQuantity: '',
    files: [],
  };

  // Process customizations from page data
  const processedCustomizations = useMemo(() => {
    if (!pageData.customizations || pageData.customizations.length === 0) {
      // If there are no customizations, return just one empty row
      return [{ id: `customization-${Date.now()}-0`, ...template_data }];
    } else {
      // Otherwise, return the existing customizations with ID check
      return pageData.customizations.map((item, index) => ({
        ...item,
        id: item.id || `customization-${Date.now()}-${index}`,
      }));
    }
  }, [pageData.customizations]);

  // Initialize state with processed customizations
  const [customizations, setCustomizations] = useState(processedCustomizations);
  const rowRef = useRef({});

  // Extract just the IDs for the ControlRowBtn
  const rowIds = useMemo(
    () => customizations.map((item) => item.id),
    [customizations]
  );

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update the customizations state when pageData changes
  useEffect(() => {
    setCustomizations(processedCustomizations);
  }, [processedCustomizations]);

  // Handle row IDs changes
  const handleRowIdsChange = useCallback(
    (newRowIds) => {
      // Filter customizations to keep only the rows with IDs in newRowIds
      const updatedCustomizations = customizations.filter((item) =>
        newRowIds.includes(item.id)
      );

      // Update both local state and context
      setCustomizations(updatedCustomizations);
      updateData('customizations', updatedCustomizations);
    },
    [customizations, updateData]
  );

  // Handle adding a new row
  const handleRowAdd = useCallback(
    (newRowId) => {
      const newRow = {
        id: newRowId,
        ...template_data,
      };

      const updatedCustomizations = [...customizations, newRow];

      // Update both local state and context
      setCustomizations(updatedCustomizations);
      updateData('customizations', updatedCustomizations);
    },
    [customizations, template_data, updateData]
  );

  // Handle removing a row
  const handleRowRemove = useCallback(
    (rowId) => {
      const updatedCustomizations = customizations.filter(
        (item) => item.id !== rowId
      );

      // Update both local state and context
      setCustomizations(updatedCustomizations);
      updateData('customizations', updatedCustomizations);
    },
    [customizations, updateData]
  );

  // Handle field changes
  const handleCustomizationChange = useCallback(
    (rowIndex, field, value) => {
      // Ensure we have a valid row index
      if (rowIndex < 0 || rowIndex >= customizations.length) return;

      const updatedCustomizations = [...customizations];

      // Update the specified field
      updatedCustomizations[rowIndex] = {
        ...updatedCustomizations[rowIndex],
        [field]: value,
      };

      // Update both local state and context
      setCustomizations(updatedCustomizations);
      updateData('customizations', updatedCustomizations);
    },
    [customizations, updateData]
  );

  return (
    <Main_InputContainer label="Customization Options">
      <ControlRowBtn
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_CustomizationRow
          template_data={template_data}
          customizations={customizations}
          onChange={handleCustomizationChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Customization;
