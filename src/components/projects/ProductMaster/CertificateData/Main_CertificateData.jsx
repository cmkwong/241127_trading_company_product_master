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
      return [{ id: 1, ...template_data }];
    } else {
      return pageData.certificates;
    }
  }, [pageData.certificates]);

  // Initialize state
  const [rowCount, setRowCount] = useState(processedCertificates.length);
  const [certificates, setCertificates] = useState(processedCertificates);
  const rowRef = useRef({});

  const setRowRef = useCallback((index, ref) => {
    rowRef.current[index] = ref;
  }, []);

  // Update state when page data changes
  useEffect(() => {
    setCertificates(processedCertificates);
    setRowCount(processedCertificates.length);
  }, [processedCertificates]);

  // Handle row count changes
  const handleRowsChange = useCallback(
    (newRowCount) => {
      // Create a copy of the current certificates
      let updatedCertificates = [...certificates];

      // If we need more rows, add them
      if (newRowCount > updatedCertificates.length) {
        for (let i = updatedCertificates.length; i < newRowCount; i++) {
          updatedCertificates.push({
            id: `certificate-${Date.now()}-${i}`,
            ...template_data,
          });
        }
      }
      // If we need fewer rows, remove from the end
      else if (newRowCount < updatedCertificates.length) {
        updatedCertificates = updatedCertificates.slice(0, newRowCount);
      }

      // Update both local state and context
      setCertificates(updatedCertificates);
      updateData('certificates', updatedCertificates);
      setRowCount(newRowCount);
    },
    [certificates, template_data, updateData]
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
        initialRowCount={rowCount}
        setRowCount={setRowCount}
        onRowsChange={handleRowsChange}
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
