import { useCallback, useState } from 'react';
import styles from './SupplierRow.module.css';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_ImageUpload from '../../../common/InputOptions/ImageUploads/Main_ImageUpload';
import ControlRowBtn from '../../../common/ControlRowBtn';

const SupplierRow = () => {
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
        <Main_Suggest defaultSuggestions={defaultSuppliers} />
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

export default SupplierRow;
