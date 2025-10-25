import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import styles from './Main_CertificateData.module.css';

const Main_CertificateData = () => {
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
        <Main_FileUploads
          label="Upload Documents"
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
        <Main_TextField label="Remark" />
        <Main_Dropdown label="File Type" />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_CertificateData;
