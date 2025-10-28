import { useCallback, useState } from 'react';
import styles from './Sub_CustomizationRow.module.css';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_ImageUpload from '../../../common/InputOptions/ImageUploads/Main_ImageUpload';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';

const Sub_CustomizationRow = () => {
  const defaultSuppliers = ['Supplier A', 'Supplier B', 'Supplier C'];

  // Each row has its own images state
  const [images, setImages] = useState([]);

  // handler for image uploads
  const handleImageChange = useCallback((updatedImages) => {
    setImages(updatedImages);
  }, []);

  // Handle image upload errors
  const handleImageError = (error) => {
    console.error('Image upload error:', error);
    // You could add a toast notification here
  };

  return (
    <>
      <div className={styles.textInput}>
        <Main_TextField placeholder={'Customization provided'} />
        <Main_Suggest
          defaultSuggestions={defaultSuppliers}
          placeholder={'Suppliers'}
        />
        <Main_TextArea />
      </div>
      <Main_ImageUpload
        onError={handleImageError}
        onChange={handleImageChange}
        defaultImages={images}
        maxFiles={10}
        maxSizeInMB={5}
      />
    </>
  );
};

export default Sub_CustomizationRow;
