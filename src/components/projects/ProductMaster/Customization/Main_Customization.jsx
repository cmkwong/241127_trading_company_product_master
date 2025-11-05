import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import styles from './Main_Customization.module.css';
import Sub_CustomizationRow from './Sub_CustomizationRow';
import ControlRowBtn from '../../../common/ControlRowBtn';
import { useProductContext } from '../../../../store/ProductContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRowsHandler } from '../../../../utils/formHandlers';

const Main_Customization = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    name: '',
    code: '',
    remark: '',
    images: [],
  };

  const processedCustomizations = useMemo(() => {
    if (!pageData.customizations || pageData.customizations.length === 0) {
      return [{ id: 1, ...template_data }];
    } else {
      return pageData.customizations;
    }
  }, [pageData.customizations]);

  const [rowCount, setRowCount] = useState(processedCustomizations.length);
  const [customizations, setCustomizations] = useState(processedCustomizations);
  const rowRef = useRef({});
  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  });

  // Update the customizations if pageData changed
  useEffect(() => {
    setCustomizations(processedCustomizations);
    // dependency must use Memo object, instead of pure object {}. As {} is always different in Javascript.
  }, [processedCustomizations]);

  // Update rowCount when productNames changes
  useEffect(() => {
    setRowCount(Math.max(1, customizations.length));
  }, [customizations]);

  // Handle row count changes from ControlRowBtn
  const handleRowsChange = useRowsHandler(
    customizations,
    updateData,
    'customizations',
    template_data,
    rowRef
  );

  const handleCustomizationChange = useCallback(
    (rowindex, field, value) => {
      const updatedCustomization = [...customizations];
      // Ensure the row exists in our array
      if (!customizations[rowindex]) {
        customizations[rowindex] = { id: rowindex + 1, ...template_data };
      }

      // Update the specified field
      updatedCustomization[rowindex] = {
        ...updatedCustomization[rowindex],
        [field]: value,
      };
      updateData('customizations', updatedCustomization);
    },
    [updateData, customizations]
  );

  return (
    <Main_InputContainer label={'Customization'}>
      <ControlRowBtn
        initialRowCount={rowCount}
        setRowCount={setRowCount}
        onRowsChange={handleRowsChange}
      >
        <Sub_CustomizationRow
          template_data={template_data}
          customizations={customizations}
          onChange={handleCustomizationChange}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Customization;
