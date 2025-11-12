import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Main_AlibabaLink.module.css';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Sub_AlibabaLink from './Sub_AlibabaLink';
import { useProductContext } from '../../../../store/ProductContext';

const Main_AlibabaLink = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    value: '',
    link: '',
  };

  // Process alibaba IDs from page data
  const processedAlibabaIds = useMemo(() => {
    if (!pageData.alibabaIds || pageData.alibabaIds.length === 0) {
      return [{ id: 1, ...template_data }];
    } else {
      return pageData.alibabaIds;
    }
  }, [pageData.alibabaIds]);

  // Initialize state
  const [rowCount, setRowCount] = useState(processedAlibabaIds.length);
  const [alibabaIds, setAlibabaIds] = useState(processedAlibabaIds);
  const rowRef = useRef({});

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update state when page data changes
  useEffect(() => {
    setAlibabaIds(processedAlibabaIds);
    setRowCount(processedAlibabaIds.length);
  }, [processedAlibabaIds]);

  // Handle row count changes
  const handleRowsChange = useCallback(
    (newRowCount) => {
      // Create a copy of the current alibaba IDs
      let updatedAlibabaIds = [...alibabaIds];

      // If we need more rows, add them
      if (newRowCount > updatedAlibabaIds.length) {
        for (let i = updatedAlibabaIds.length; i < newRowCount; i++) {
          updatedAlibabaIds.push({
            id: `alibaba-id-${Date.now()}-${i}`,
            ...template_data,
          });
        }
      }
      // If we need fewer rows, remove from the end
      else if (newRowCount < updatedAlibabaIds.length) {
        updatedAlibabaIds = updatedAlibabaIds.slice(0, newRowCount);
      }

      // Update both local state and context
      setAlibabaIds(updatedAlibabaIds);
      updateData('alibabaIds', updatedAlibabaIds);
      setRowCount(newRowCount);
    },
    [alibabaIds, template_data, updateData]
  );

  // Handle field changes
  const handleAlibabaIdChange = useCallback(
    (rowIndex, field, value) => {
      // Ensure we have a valid row index
      if (rowIndex < 0 || rowIndex >= alibabaIds.length) return;

      const updatedAlibabaIds = [...alibabaIds];

      // Update the specified field
      updatedAlibabaIds[rowIndex] = {
        ...updatedAlibabaIds[rowIndex],
        [field]: value,
      };

      // Update both local state and context
      setAlibabaIds(updatedAlibabaIds);
      updateData('alibabaIds', updatedAlibabaIds);
    },
    [alibabaIds, updateData]
  );

  return (
    <Main_InputContainer label={'Alibaba'}>
      <ControlRowBtn
        initialRowCount={rowCount}
        setRowCount={setRowCount}
        onRowsChange={handleRowsChange}
      >
        <Sub_AlibabaLink
          template_data={template_data}
          alibabaIds={alibabaIds}
          onChange={handleAlibabaIdChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_AlibabaLink;
