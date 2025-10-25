import { useState } from 'react';
import Main_DateSelector from '../../common/InputOptions/Date/Main_DateSelector';
import Main_ImageUpload from '../../common/InputOptions/ImageUploads/Main_ImageUpload';
import Main_InputContainer from '../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextArea from '../../common/InputOptions/Textarea/Main_TextArea';
import Main_TextField from '../../common/InputOptions/TextField/Main_TextField';
import Sub_ImagePreview from '../../common/InputOptions/ImageUploads/Sub_ImagePreview';
import ControlRowBtn from '../ControlRowBtn';
import styles from './Main_ProductLink.module.css';

const Main_ProductLink = () => {
  // State to store uploaded images
  const [images, setImages] = useState([]);

  // Handler for image uploads
  const handleImageChange = (updatedImages) => {
    setImages(updatedImages);
  };

  // Handler for image removal
  const handleRemoveImage = (id) => {
    const updatedImages = images.filter((image) => image.id !== id);
    setImages(updatedImages);
  };

  return (
    <>
      <Main_InputContainer label="Product Links">
        <ControlRowBtn>
          <div className={styles.rowContainer}>
            <Main_TextField label="link" />
            <div className={styles.contentRow}>
              <div className={styles.inputsColumn}>
                <Main_ImageUpload
                  onChange={handleImageChange}
                  showPreview={false}
                  defaultImages={images}
                />
                <Main_TextArea label={'Remark'} />
                <Main_DateSelector />
              </div>
              {images.length > 0 && (
                <div className={styles.previewContainer}>
                  <div className={styles.previewGrid}>
                    {images.map((image) => (
                      <Sub_ImagePreview
                        key={image.id}
                        image={image}
                        onRemove={handleRemoveImage}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};

export default Main_ProductLink;
