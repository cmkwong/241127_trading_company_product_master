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
      return [{ id: `alibaba-id-${Date.now()}-0`, ...template_data }];
    } else {
      // Ensure all items have an ID
      return pageData.alibabaIds.map((item, index) => ({
        ...item,
        id: item.id || `alibaba-id-${Date.now()}-${index}`,
      }));
    }
  }, [pageData.alibabaIds]);

  // Initialize state
  const [alibabaIds, setAlibabaIds] = useState(processedAlibabaIds);
  const rowRef = useRef({});

  // Extract just the IDs for the ControlRowBtn
  const rowIds = useMemo(() => alibabaIds.map((item) => item.id), [alibabaIds]);

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update state when page data changes
  useEffect(() => {
    setAlibabaIds(processedAlibabaIds);
  }, [processedAlibabaIds]);

  // Handle row IDs changes
  const handleRowIdsChange = useCallback(
    (newRowIds) => {
      // Filter alibabaIds to keep only the rows with IDs in newRowIds
      const updatedAlibabaIds = alibabaIds.filter((item) =>
        newRowIds.includes(item.id)
      );

      // Update both local state and context
      setAlibabaIds(updatedAlibabaIds);
      updateData('alibabaIds', updatedAlibabaIds);
    },
    [alibabaIds, updateData]
  );

  // Handle adding a new row
  const handleRowAdd = useCallback(
    (newRowId) => {
      const newRow = {
        id: newRowId,
        ...template_data,
      };

      const updatedAlibabaIds = [...alibabaIds, newRow];

      // Update both local state and context
      setAlibabaIds(updatedAlibabaIds);
      updateData('alibabaIds', updatedAlibabaIds);
    },
    [alibabaIds, template_data, updateData]
  );

  // Handle removing a row
  const handleRowRemove = useCallback(
    (rowId) => {
      const updatedAlibabaIds = alibabaIds.filter((item) => item.id !== rowId);

      // Update both local state and context
      setAlibabaIds(updatedAlibabaIds);
      updateData('alibabaIds', updatedAlibabaIds);
    },
    [alibabaIds, updateData]
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
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
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
