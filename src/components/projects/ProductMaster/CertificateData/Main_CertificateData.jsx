import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import styles from './Main_CertificateData.module.css';

const Main_CertificateData = () => {
  const options = ['MSDS', 'RoHS'];

  const handleFileChange = (files) => {
    console.log('Files changed:', files);
    // Process files as needed
  };

  const handleFileError = (errorMessage) => {
    console.error('File upload error:', errorMessage);
    // Display error to user
  };
  return (
    <Main_InputContainer label="Certificates">
      <ControlRowBtn>
        <div className={styles.fileUploadContainer}>
          <Main_Dropdown label="Certificate Type" defaultOptions={options} />
          <Main_FileUploads
            label="Upload Certificates"
            onChange={handleFileChange}
            onError={handleFileError}
            maxFiles={5}
            maxSizeInMB={2}
            acceptedTypes={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]}
          />
          <Main_TextArea label="Remark" />
        </div>
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_CertificateData;
