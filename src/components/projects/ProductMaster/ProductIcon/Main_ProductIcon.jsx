import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_ProductIcon.module.css';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import IconUpload from '../../../common/InputOptions/IconUpload/IconUpload';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';

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
const PRODUCT_IMAGES_BASE_PATH = 'E:\\Pet Product Images\\public\\products';

const Main_ProductIcon = ({ showMaxImagesNotice = false }) => {
  const { pageData, upsertProductPageData, deleteProductById } =
    useProductContext();
  const { productStatus } = useMasterContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDateTime = (value) => {
    if (!value) return '';
    return String(value)
      .replace('T', ' ')
      .replace(/\.\d{3}Z?$/, '');
  };

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

  const handleOpenProductFolder = async () => {
    if (!id) return;

    const windowsPath = `${PRODUCT_IMAGES_BASE_PATH}\\${id}`;
    const fileUrl = `file:///${windowsPath.replace(/\\/g, '/')}`;

    // Browsers may block opening local folders directly.
    window.open(fileUrl, '_blank', 'noopener,noreferrer');

    try {
      await navigator.clipboard.writeText(windowsPath);
      alert('Folder path copied to clipboard.');
    } catch {
      // ignore clipboard failure
    }
  };

  const handleDeleteProduct = async () => {
    if (!id || isDeleting) return;

    const confirmed = window.confirm(
      'Delete this product? This action cannot be undone.',
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteProductById(id);
      alert('Product deleted successfully.');
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(error?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
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
        <button
          type="button"
          className={styles.openFolderBtn}
          onClick={handleOpenProductFolder}
          disabled={!id}
          title="Open product images folder"
          aria-label="Open product images folder"
        >
          Open Product Images Folder
        </button>
        <DeleteBtn
          text={isDeleting ? 'Deleting...' : 'Delete Product'}
          onClick={handleDeleteProduct}
          disabled={!id || isDeleting}
          title="Delete product"
          ariaLabel="Delete product"
          className={styles.deleteProductBtn}
        />
        <Main_TextField
          label={'Created Date Time'}
          defaultValue={formatDateTime(pageData.created_at)}
          onChange={() => {}}
          disabled={true}
        />
        <Main_TextField
          label={'Updated Date Time'}
          defaultValue={formatDateTime(pageData.updated_at)}
          onChange={() => {}}
          disabled={true}
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
