import { useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import Main_ImageUpload from '../../../common/InputOptions/ImageUploads/Main_ImageUpload';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import styles from './Sub_ProductLinkRow.module.css';

const Sub_ProductLinkRow = forwardRef(
  ({ template_data, productLinks, onChange, setRowRef, rowindex }, ref) => {
    // The rowindex prop is passed from ControlRowBtn and indicates which row to render
    // We only need to render a single row at a time, not map through all productLinks

    const productLink = productLinks[rowindex] || { ...template_data };

    const handleLinkChange = useCallback(
      ({ value }) => {
        onChange(rowindex, 'link', value);
      },
      [onChange, rowindex]
    );

    const handleRemarkChange = useCallback(
      ({ value }) => {
        onChange(rowindex, 'remark', value);
      },
      [onChange, rowindex]
    );

    const handleDateChange = useCallback(
      ({ value }) => {
        onChange(rowindex, 'date', value);
      },
      [onChange, rowindex]
    );

    const handleImageChange = useCallback(
      (updatedImages) => {
        // Extract image URLs from the updatedImages object
        const imageUrls =
          updatedImages && Array.isArray(updatedImages)
            ? updatedImages.map((img) =>
                typeof img === 'string' ? img : img.url || ''
              )
            : [];
        onChange(rowindex, 'images', imageUrls);
      },
      [onChange, rowindex]
    );

    // Handle image upload errors
    const handleImageError = useCallback((error) => {
      console.error('Image upload error:', error);
    }, []);

    return (
      <div
        className={styles.rowContainer}
        ref={(el) => setRowRef(rowindex, el)}
      >
        <Main_TextField
          placeholder={'Link'}
          value={productLink.link || ''}
          onChange={handleLinkChange}
        />
        <div className={styles.contentRow}>
          <div className={styles.inputsColumn}>
            <Main_ImageUpload
              onError={handleImageError}
              onChange={handleImageChange}
              defaultImages={productLink.images || []}
            />
            <Main_TextArea
              label={'Remark'}
              value={productLink.remark || ''}
              onChange={handleRemarkChange}
            />
            <Main_DateSelector
              value={productLink.date || ''}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>
    );
  }
);

Sub_ProductLinkRow.propTypes = {
  template_data: PropTypes.object.isRequired,
  productLinks: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  setRowRef: PropTypes.func.isRequired,
  rowindex: PropTypes.number,
};

Sub_ProductLinkRow.displayName = 'Sub_ProductLinkRow';

export default Sub_ProductLinkRow;
