import { useCallback, forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import styles from './Main_CertificateData.module.css';
import { mockCertType } from '../../../../datas/Options/ProductOptions';

const Sub_CertificateData = forwardRef(
  ({ template_data, certificates, onChange, setRowRef, rowindex }, ref) => {
    // Get the current row data or use template data if it doesn't exist
    const certificate = certificates[rowindex] || { ...template_data };

    // Process files to ensure each has a unique ID
    const processedFiles = useMemo(() => {
      // Check if files exist
      if (
        !certificate.files ||
        !Array.isArray(certificate.files) ||
        certificate.files.length === 0
      ) {
        return [];
      }

      return certificate.files.map((file, index) => {
        // If file is already properly formatted with an ID, return it as is
        if (
          file &&
          typeof file === 'object' &&
          file.id &&
          file.name &&
          file.size
        ) {
          return file;
        }

        // If file is a string (URL) or doesn't have required properties, create a proper file object
        const fileName =
          typeof file === 'string'
            ? file.split('/').pop()
            : (file && file.name) || 'unknown';

        const fileSize = (file && file.size) || 100000; // Default size if unknown
        const fileType = (file && file.type) || 'application/octet-stream'; // Default type if unknown
        const fileUrl =
          typeof file === 'string' ? file : (file && file.url) || '';

        const processedFile = {
          name: fileName,
          size: fileSize,
          type: fileType,
          url: fileUrl,
          id: `file-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}-${index}`,
          originalFile: file,
        };

        return processedFile;
      });
    }, [certificate.files, rowindex]);

    const handleTypeChange = useCallback(
      ({ selected }) => {
        onChange(rowindex, 'type', selected);
      },
      [onChange, rowindex]
    );

    const handleRemarkChange = useCallback(
      ({ value }) => {
        onChange(rowindex, 'remark', value);
      },
      [onChange, rowindex]
    );

    const handleFileChange = useCallback(
      (updatedFiles) => {
        // Extract original files or URLs to maintain data structure
        const processedUpdatedFiles = updatedFiles.map((file) => {
          return file.originalFile || file.url || file;
        });

        onChange(rowindex, 'files', processedUpdatedFiles);
      },
      [onChange, rowindex]
    );

    const handleFileError = useCallback((errorMessage) => {
      console.error(`File upload error: ${errorMessage}`);
    }, []);

    return (
      <div
        className={styles.fileUploadContainer}
        ref={(el) => setRowRef(rowindex, el)}
      >
        <Main_Dropdown
          key={`dropdown-${rowindex}-${certificate.type || 1}`}
          label="Type"
          defaultOptions={mockCertType}
          // Use controlled mode instead of defaultSelectedOption
          options={mockCertType}
          selectedOptions={certificate.type || 1}
          onChange={handleTypeChange}
        />
        <Main_FileUploads
          key={`file-upload-${rowindex}-${processedFiles.length}`}
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
          defaultFiles={processedFiles}
        />
        <Main_TextArea
          label="Remark"
          value={certificate.remark || ''}
          onChange={handleRemarkChange}
        />
      </div>
    );
  }
);

Sub_CertificateData.propTypes = {
  template_data: PropTypes.object.isRequired,
  certificates: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  setRowRef: PropTypes.func.isRequired,
  rowindex: PropTypes.number,
};

Sub_CertificateData.displayName = 'Sub_CertificateData';

export default Sub_CertificateData;
