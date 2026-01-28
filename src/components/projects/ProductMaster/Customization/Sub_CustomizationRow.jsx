import { useCallback, useState } from 'react';
import styles from './Sub_CustomizationRow.module.css';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { mockSuppliers } from '../../../../datas/Suppliers/mockSuppliers';

const Sub_CustomizationRow = (props) => {
  const { template_data, customizations, onChange, rowindex = 0 } = props;

  const customization = customizations[rowindex] || template_data;

  const handleNameChange = ({ value }) => {
    onChange(rowindex, 'name', value);
  };

  const handleCodeChange = ({ value }) => {
    onChange(rowindex, 'code', value);
  };

  const handleRemarkChange = ({ value }) => {
    onChange(rowindex, 'remark', value);
  };

  // --- FIXED: Removed destructuring ---
  // Main_FileUploads passes the array directly, not an object.
  const handleImageChange = (updatedImages) => {
    console.log('updatedImages: ', updatedImages);
    onChange(rowindex, 'images', updatedImages);
  };

  // Handle image upload errors
  const handleImageError = (error) => {
    console.error('Image upload error:', error);
    // You could add a toast notification here
  };

  return (
    <>
      <div className={styles.textInput}>
        <Main_TextField
          placeholder={'What Customization?'}
          onChange={handleNameChange}
          value={customization.name}
        />
        <Main_Suggest
          defaultSuggestions={mockSuppliers.map((supplier) => supplier.code)}
          placeholder={'Suppliers'}
          onChange={handleCodeChange}
          value={customization.code}
        />
        <Main_TextArea
          onChange={handleRemarkChange}
          placeholder={'Customization remarks ... '}
          value={customization.remark}
        />
      </div>
      <Main_FileUploads
        mode="image"
        onError={handleImageError}
        onChange={handleImageChange}
        maxFiles={10}
        maxSizeInMB={5}
        defaultImages={customization.images}
      />
    </>
  );
};

export default Sub_CustomizationRow;
