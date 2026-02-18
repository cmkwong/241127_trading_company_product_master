import { useCallback, useEffect, useState } from 'react';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import styles from './Main_CertificateData.module.css';
import { v4 as uuidv4 } from 'uuid';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';

const processCertificateFiles = (files) => {
  if (!files) return [];
  return files.map((file, index) => ({
    id: file.id || uuidv4(),
    name: file.file_name || `file_${index}`,
    size: file.file_size || 0,
    type: file.file_type || 'application/octet-stream',
    url: file.file_url || '',
  }));
};

const Sub_CertificateData = ({ certificates, rowindex }) => {
  // Get the current row data or use template data if it doesn't exist
  const certificate = certificates[rowindex];
  const { pageData, upsertProductPageData } = useProductContext();
  const { certType } = useMasterContext();

  const [fileCertType, setFileCertType] = useState(
    certificate?.certificate_type_id,
  );
  const [remark, setRemark] = useState(certificate?.remark || '');
  const [files, setFiles] = useState(() =>
    processCertificateFiles(certificate?.product_certificate_files),
  );

  // Update local state when certificate data changes
  useEffect(() => {
    setFileCertType(certificate?.certificate_type_id);
    setRemark(certificate?.remark || '');
    setFiles(processCertificateFiles(certificate?.product_certificate_files));
  }, [certificate]);

  const handleTypeChange = useCallback(
    (ov, nv) => {
      upsertProductPageData({
        product_certificates: [
          {
            id: certificate?.id,
            product_id: pageData.id,
            certificate_type_id: nv,
          },
        ],
      });
    },
    [certificate?.id, pageData.id, upsertProductPageData],
  );

  const handleRemarkChange = useCallback(
    (ov, nv) => {
      upsertProductPageData({
        product_certificates: [
          {
            id: certificate?.id,
            product_id: pageData.id,
            remark: nv,
          },
        ],
      });
    },
    [certificate?.id, pageData.id, upsertProductPageData],
  );

  const handleFileChange = useCallback(
    (ov, nv) => {
      if (ov.length > nv.length) {
        // File removed
        const removedFile = ov.find(
          (file) => !nv.some((f) => f.id === file.id),
        );
        if (removedFile) {
          upsertProductPageData({
            product_certificates: [
              {
                id: certificate.id,
                product_id: pageData.id,
                product_certificate_files: [
                  {
                    id: removedFile.id,
                    _delete: true,
                  },
                ],
              },
            ],
          });
        }
      } else if (ov.length < nv.length) {
        // File added
        const addedFile = nv.find((file) => !ov.some((f) => f.id === file.id));
        if (addedFile) {
          upsertProductPageData({
            product_certificates: [
              {
                id: certificate?.id,
                product_id: pageData.id,
                product_certificate_files: [
                  {
                    id: addedFile.id,
                    file_name: addedFile.name,
                    file_size: addedFile.size,
                    file_type: addedFile.type,
                    file_url: addedFile.url,
                  },
                ],
              },
            ],
          });
        }
      }
    },
    [certificate?.id, pageData.id, upsertProductPageData],
  );

  const handleFileError = useCallback((errorMessage) => {
    console.error(`File upload error: ${errorMessage}`);
  }, []);

  return (
    <div className={styles.fileUploadContainer}>
      <Main_Dropdown
        label="Type"
        defaultOptions={certType}
        defaultSelectedOption={fileCertType || 1}
        onChange={handleTypeChange}
      />
      <Main_FileUploads
        label="Upload Certificates"
        onChange={handleFileChange}
        onError={handleFileError}
        maxFiles={5}
        maxSizeInMB={2}
        acceptedTypes={[
          // Document types
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          // Image types
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'image/bmp',
          'image/tiff',
        ]}
        defaultFiles={files}
        mode="file"
      />
      <Main_TextArea
        label="Remark"
        defaultValue={remark || ''}
        onChange={handleRemarkChange}
      />
    </div>
  );
};

Sub_CertificateData.displayName = 'Sub_CertificateData';

export default Sub_CertificateData;
