import { useState } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import styles from './Main_Supplier.module.css';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_ImageUpload from '../../../common/InputOptions/ImageUploads/Main_ImageUpload';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';

const Main_Supplier = () => {
  const defaultSupplier = ['Supplier A', 'Supplier B', 'Supplier C'];
  const { updateData, formData } = useSavePageData();
  const [supplierImages, setSupplierImages] = useState([]);

  // Handle image upload changes
  const handleImageChange = (images) => {
    setSupplierImages(images);
    updateData('supplierImages', images);
  };

  // Handle image upload errors
  const handleImageError = (error) => {
    console.error('Image upload error:', error);
    // You could add a toast notification here
  };

  return (
    <Main_InputContainer label={'Supplier'}>
      <ControlRowBtn>
        <div className={styles.textInput}>
          <Main_Suggest
            defaultSuggestions={defaultSupplier}
            onChange={(value) => updateData('supplier.name', value)}
            defaultValue={formData?.supplier?.name || ''}
          />
          <Main_TextArea
            onChange={(value) => updateData('supplier.notes', value)}
            defaultValue={formData?.supplier?.notes || ''}
          />
        </div>
        <Main_ImageUpload
          onChange={handleImageChange}
          onError={handleImageError}
          defaultImages={supplierImages}
          maxFiles={10}
          maxSizeInMB={5}
          showPreview={true}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Supplier;
