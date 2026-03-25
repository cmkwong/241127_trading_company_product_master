import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_ProductIcon.module.css';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import IconUpload from '../../../common/InputOptions/IconUpload/IconUpload';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';

/**
 * Main_ProductIcon Component
 * Allows selection and display of a single product image
 */
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_IMAGE_SIZE_MB = 5;

const Main_ProductIcon = ({ showMaxImagesNotice = false }) => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { productStatus } = useMasterContext();

  // product ID state setup
  const [id, setId] = useState(pageData.id || '');

  // Process the image URL from pageData
  useEffect(() => {
    setId(pageData.id || '');
  }, [pageData.id]);

  const handleIconSelectFile = (file) => {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      console.error(
        `Image upload error: unsupported image type (${file.type})`,
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      console.error(
        `Image upload error: file exceeds maximum size of ${MAX_IMAGE_SIZE_MB}MB`,
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    upsertProductPageData({
      icon_url: objectUrl,
      icon_name: file.name || '',
      _base64_changed: true,
    });
  };

  const handleRemoveIcon = () => {
    upsertProductPageData({
      icon_url: '',
      icon_name: '',
      _base64_changed: true,
    });
  };

  return (
    <Main_InputContainer label="Product Icon">
      <div className={styles.productIconContainer}>
        <div className={styles.iconUploadContainer}>
          <div className={styles.iconUploadRow}>
            <IconUpload
              inputId={`product-icon-${id || 'new'}`}
              imageUrl={pageData.icon_url || ''}
              imageName={pageData.icon_name || 'product-icon'}
              onSelectFile={handleIconSelectFile}
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              size="XL"
              title={
                showMaxImagesNotice
                  ? 'Select product icon (max 1)'
                  : 'Select product icon'
              }
            />

            {!!pageData.icon_url && (
              <button
                type="button"
                className={styles.removeIconBtn}
                onClick={handleRemoveIcon}
                title="Remove icon"
                aria-label="Remove icon"
              >
                X
              </button>
            )}
          </div>
        </div>
        <Main_TextField
          label={'HS Code'}
          defaultValue={pageData.hs_code || ''}
          onChange={(ov, nv) => {
            upsertProductPageData({
              hs_code: nv,
            });
          }}
          disabled={false} // Set to false to allow editing of HS Code
        />
        <Main_TextField
          label={'Product Index'}
          defaultValue={pageData.product_index || ''}
          onChange={(ov, nv) => {
            upsertProductPageData({
              product_index: nv,
            });
          }}
          disabled={false} // Set to false to allow editing of Product Index
        />
        <Main_Dropdown
          label="Product Status"
          defaultOptions={(productStatus || []).map((item) => ({
            id: item.id,
            name: item.name || item.label || '',
          }))}
          defaultSelectedOption={
            pageData.product_status_id || pageData.status_id || ''
          }
          onChange={(ov, nv) => {
            upsertProductPageData({
              product_status_id: nv,
            });
          }}
        />
        <Main_TextField
          label={'Product ID'}
          defaultValue={id}
          onChange={() => {}}
          disabled={true} // Product ID is typically not editable, set to true to disable
        />
      </div>
    </Main_InputContainer>
  );
};

Main_ProductIcon.propTypes = {
  onChange: PropTypes.func, // Callback when image changes
  showMaxImagesNotice: PropTypes.bool, // Whether to show "Maximum 1 images reached" notice
};

export default Main_ProductIcon;
