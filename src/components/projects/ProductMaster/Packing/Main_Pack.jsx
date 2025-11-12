import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_PackRow from './Sub_PackRow';
import { useProductContext } from '../../../../store/ProductContext';

const Main_Pack = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    L: 0,
    W: 0,
    H: 0,
    qty: 1,
    kg: 0,
    type: 1,
  };

  // Process packings from page data
  const processedPackings = useMemo(() => {
    if (!pageData.packings || pageData.packings.length === 0) {
      return [{ id: 1, ...template_data }];
    } else {
      return pageData.packings;
    }
  }, [pageData.packings]);

  // Initialize state
  const [rowCount, setRowCount] = useState(processedPackings.length);
  const [packings, setPackings] = useState(processedPackings);
  const rowRef = useRef({});

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update state when page data changes
  useEffect(() => {
    setPackings(processedPackings);
    setRowCount(processedPackings.length);
  }, [processedPackings]);

  // Handle row count changes
  const handleRowsChange = useCallback(
    (newRowCount) => {
      // Create a copy of the current packings
      let updatedPackings = [...packings];

      // If we need more rows, add them
      if (newRowCount > updatedPackings.length) {
        for (let i = updatedPackings.length; i < newRowCount; i++) {
          updatedPackings.push({
            id: `packing-${Date.now()}-${i}`,
            ...template_data,
          });
        }
      }
      // If we need fewer rows, remove from the end
      else if (newRowCount < updatedPackings.length) {
        updatedPackings = updatedPackings.slice(0, newRowCount);
      }

      // Update both local state and context
      setPackings(updatedPackings);
      updateData('packings', updatedPackings);
      setRowCount(newRowCount);
    },
    [packings, template_data, updateData]
  );

  // Handle field changes
  const handlePackingChange = useCallback(
    (rowIndex, field, value) => {
      // Ensure we have a valid row index
      if (rowIndex < 0 || rowIndex >= packings.length) return;

      const updatedPackings = [...packings];

      // Update the specified field
      updatedPackings[rowIndex] = {
        ...updatedPackings[rowIndex],
        [field]: value,
      };

      // Update both local state and context
      setPackings(updatedPackings);
      updateData('packings', updatedPackings);
    },
    [packings, updateData]
  );

  return (
    <Main_InputContainer label={'Packing'}>
      <ControlRowBtn
        initialRowCount={rowCount}
        setRowCount={setRowCount}
        onRowsChange={handleRowsChange}
      >
        <Sub_PackRow
          template_data={template_data}
          packings={packings}
          onChange={handlePackingChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Pack;
