import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import styles from './Main_CertificateData.module.css';
import Sub_CertificateData from './Sub_CertificateData';
import { useProductContext } from '../../../../store/ProductContext';

const Main_CertificateData = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    type: 1,
    files: [],
    remark: '',
  };

  // Process certificates from page data
  const processedCertificates = useMemo(() => {
    if (!pageData.certificates || pageData.certificates.length === 0) {
      return [{ id: `certificate-${Date.now()}-0`, ...template_data }];
    } else {
      // Ensure all items have an ID
      return pageData.certificates.map((item, index) => ({
        ...item,
        id: item.id || `certificate-${Date.now()}-${index}`,
      }));
    }
  }, [pageData.certificates]);

  // Initialize state with processed certificates
  const [certificates, setCertificates] = useState(processedCertificates);
  const rowRef = useRef({});

  // Extract just the IDs for the ControlRowBtn
  const rowIds = useMemo(
    () => certificates.map((item) => item.id),
    [certificates]
  );

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update state when page data changes
  useEffect(() => {
    setCertificates(processedCertificates);
  }, [processedCertificates]);

  // Handle row IDs changes
  const handleRowIdsChange = useCallback(
    (newRowIds) => {
      // Filter certificates to keep only the rows with IDs in newRowIds
      const updatedCertificates = certificates.filter((item) =>
        newRowIds.includes(item.id)
      );

      // Update both local state and context
      setCertificates(updatedCertificates);
      updateData('certificates', updatedCertificates);
    },
    [certificates, updateData]
  );

  // Handle adding a new row
  const handleRowAdd = useCallback(
    (newRowId) => {
      const newRow = {
        id: newRowId,
        ...template_data,
      };

      const updatedCertificates = [...certificates, newRow];

      // Update both local state and context
      setCertificates(updatedCertificates);
      updateData('certificates', updatedCertificates);
    },
    [certificates, template_data, updateData]
  );

  // Handle removing a row
  const handleRowRemove = useCallback(
    (rowId) => {
      const updatedCertificates = certificates.filter(
        (item) => item.id !== rowId
      );

      // Update both local state and context
      setCertificates(updatedCertificates);
      updateData('certificates', updatedCertificates);
    },
    [certificates, updateData]
  );

  // Handle field changes
  const handleCertificateChange = useCallback(
    (rowIndex, field, value) => {
      // Ensure we have a valid row index
      if (rowIndex < 0 || rowIndex >= certificates.length) return;

      const updatedCertificates = [...certificates];

      // Update the specified field
      updatedCertificates[rowIndex] = {
        ...updatedCertificates[rowIndex],
        [field]: value,
      };

      // Update both local state and context
      setCertificates(updatedCertificates);
      updateData('certificates', updatedCertificates);
    },
    [certificates, updateData]
  );

  return (
    <Main_InputContainer label="Certificates">
      <ControlRowBtn
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_CertificateData
          template_data={template_data}
          certificates={certificates}
          onChange={handleCertificateChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_CertificateData;
