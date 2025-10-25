import Main_TextArea from '../../common/InputOptions/Textarea/Main_TextArea';
import Main_InputContainer from '../../common/InputOptions/InputContainer/Main_InputContainer';
import { useState } from 'react';

const Main_Remark = () => {
  // State to manage the remarks
  const [remarks, setRemarks] = useState('');
  // Handler for remark changes
  const handleRemarksChange = ({ value, length }) => {
    setRemarks(value);
    console.log(`Remarks updated: ${value} (Length: ${length})`);
  };

  return (
    <Main_InputContainer label="Product Remarks">
      <Main_TextArea
        textareaId="product-remarks"
        value={remarks}
        onChange={handleRemarksChange}
        placeholder="Enter product remarks..."
        rows={5}
        maxLength={200}
        resize="vertical"
        ariaLabel="Product Remarks"
      />
    </Main_InputContainer>
  );
};

export default Main_Remark;
