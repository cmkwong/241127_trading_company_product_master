import { useCallback } from 'react';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_ImageUpload from '../../../common/InputOptions/ImageUploads/Main_ImageUpload';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import styles from './Main_ProductImages.module.css';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';

const Main_ProductImages = (props) => {
  // Handle image upload errors
  const handleImageError = useCallback((error) => {
    console.error('Image upload error:', error);
  }, []);

  const handleImageChange = () => {};
  return (
    <Main_InputContainer label="Product Images">
      <ControlRowBtn>
        <Main_ImageUpload
          onError={handleImageError}
          onChange={handleImageChange}
          defaultImages={[]}
        />
        <Main_Dropdown
          defaultOptions={['']}
          label="Package Type"
          // defaultSelectedOption={packing.type || 1}
          onChange={() => {}}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_ProductImages;
