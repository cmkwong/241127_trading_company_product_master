import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_Pack from './Sub_Pack';
import { useProductContext } from '../../../../store/ProductContext';

const Main_Pack = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    type: 1,
    quantity: '',
    unit: 1,
    weight: '',
    weightUnit: 1,
    dimension: {
      length: '',
      width: '',
      height: '',
    },
    dimensionUnit: 1,
  };

  // Process packs from page data
  const processedPacks = useMemo(() => {
    if (!pageData.packs || pageData.packs.length === 0) {
      // If there are no packs, return just one empty row
      return [{ id: `pack-${Date.now()}-0`, ...template_data }];
    } else {
      // Otherwise, return the existing packs with ID check
      return pageData.packs.map((item, index) => ({
        ...item,
        id: item.id || `pack-${Date.now()}-${index}`,
      }));
    }
  }, [pageData.packs]);

  // Initialize state with processed packs
  const [packs, setPacks] = useState(processedPacks);
  const rowRef = useRef({});

  // Extract just the IDs for the ControlRowBtn
  const rowIds = useMemo(() => packs.map((item) => item.id), [packs]);

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update the packs state when pageData changes
  useEffect(() => {
    setPacks(processedPacks);
  }, [processedPacks]);

  // Handle row IDs changes
  const handleRowIdsChange = useCallback(
    (newRowIds) => {
      // Filter packs to keep only the rows with IDs in newRowIds
      const updatedPacks = packs.filter((item) => newRowIds.includes(item.id));

      // Update both local state and context
      setPacks(updatedPacks);
      updateData('packs', updatedPacks);
    },
    [packs, updateData]
  );

  // Handle adding a new row
  const handleRowAdd = useCallback(
    (newRowId) => {
      const newRow = {
        id: newRowId,
        ...template_data,
      };

      const updatedPacks = [...packs, newRow];

      // Update both local state and context
      setPacks(updatedPacks);
      updateData('packs', updatedPacks);
    },
    [packs, template_data, updateData]
  );

  // Handle removing a row
  const handleRowRemove = useCallback(
    (rowId) => {
      const updatedPacks = packs.filter((item) => item.id !== rowId);

      // Update both local state and context
      setPacks(updatedPacks);
      updateData('packs', updatedPacks);
    },
    [packs, updateData]
  );

  // Handle field changes
  const handlePackChange = useCallback(
    (rowIndex, field, value) => {
      // Ensure we have a valid row index
      if (rowIndex < 0 || rowIndex >= packs.length) return;

      const updatedPacks = [...packs];

      // Handle nested fields (like dimension.length)
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        updatedPacks[rowIndex] = {
          ...updatedPacks[rowIndex],
          [parentField]: {
            ...updatedPacks[rowIndex][parentField],
            [childField]: value,
          },
        };
      } else {
        // Update the specified field
        updatedPacks[rowIndex] = {
          ...updatedPacks[rowIndex],
          [field]: value,
        };
      }

      // Update both local state and context
      setPacks(updatedPacks);
      updateData('packs', updatedPacks);
    },
    [packs, updateData]
  );

  return (
    <Main_InputContainer label="Packing Information">
      <ControlRowBtn
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_Pack
          template_data={template_data}
          packs={packs}
          onChange={handlePackChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Pack;
