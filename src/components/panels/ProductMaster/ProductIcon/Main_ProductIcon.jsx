import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_ProductIcon.module.css';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import {
  upsertEntityData,
  useEntityField,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import IconUpload from '../../../common/InputOptions/IconUpload/IconUpload';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_IMAGE_SIZE_MB = 5;
const PRODUCT_IMAGES_BASE_PATH = 'E:\\Pet Product Images\\public\\products';

const Main_ProductIcon = ({ showMaxImagesNotice = false }) => {
  const { productStatus } = useMasterContext();

  const productId = useEntityField('products', 'id');
  const iconUrl = useEntityField('products', 'icon_url');
  const iconName = useEntityField('products', 'icon_name');
  const hsCode = useEntityField('products', 'hs_code');
  const productIndex = useEntityField('products', 'product_index');
  const productStatusId = useEntityField('products', 'product_status_id');
  const statusId = useEntityField('products', 'status_id');
  const createdAt = useEntityField('products', 'created_at');
  const updatedAt = useEntityField('products', 'updated_at');

  const formatDateTime = (value) => {
    if (!value) return '';
    return String(value)
      .replace('T', ' ')
      .replace(/\.\d{3}Z?$/, '');
  };

  // product ID state setup
  const [id, setId] = useState(productId || '');

  useEffect(() => {
    setId(productId || '');
  }, [productId]);

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

    upsertEntityData('products', {
      icon_url: objectUrl,
      icon_name: file.name || '',
      _base64_changed: true,
    });
  };

  const handleRemoveIcon = () => {
    upsertEntityData('products', {
      icon_url: '',
      icon_name: '',
      _base64_changed: true,
    });
  };

  const handleOpenProductFolder = async () => {
    if (!id) return;

    const windowsPath = `${PRODUCT_IMAGES_BASE_PATH}\\${id}`;
    const fileUrl = `file:///${windowsPath.replace(/\\/g, '/')}`;

    window.open(fileUrl, '_blank', 'noopener,noreferrer');

    try {
      await navigator.clipboard.writeText(windowsPath);
      alert('Folder path copied to clipboard.');
    } catch {
      // ignore clipboard failure
    }
  };

  return (
    <Main_InputContainer label="Product Icon">
      <div className={styles.productIconContainer}>
        <div className={styles.iconUploadContainer}>
          <div className={styles.iconUploadRow}>
            <IconUpload
              inputId={`product-icon-${id || 'new'}`}
              imageUrl={iconUrl || ''}
              imageName={iconName || 'product-icon'}
              onSelectFile={handleIconSelectFile}
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              size="XL"
              title={
                showMaxImagesNotice
                  ? 'Select product icon (max 1)'
                  : 'Select product icon'
              }
            />

            {!!iconUrl && (
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
          defaultValue={hsCode || ''}
          onChange={(ov, nv) => {
            upsertEntityData('products', {
              hs_code: nv,
            });
          }}
          disabled={false}
        />
        <Main_TextField
          label={'Product Index'}
          defaultValue={productIndex || ''}
          onChange={(ov, nv) => {
            upsertEntityData('products', {
              product_index: nv,
            });
          }}
          disabled={false}
        />
        <Main_Dropdown
          label="Product Status"
          defaultOptions={(productStatus || []).map((item) => ({
            id: item.id,
            name: item.name || item.label || '',
          }))}
          defaultSelectedOption={productStatusId || statusId || ''}
          onChange={(ov, nv) => {
            upsertEntityData('products', {
              product_status_id: nv,
            });
          }}
        />
        <Main_TextField
          label={'Product ID'}
          defaultValue={id}
          onChange={() => {}}
          disabled={true}
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
        <Main_TextField
          label={'Created Date Time'}
          defaultValue={formatDateTime(createdAt)}
          onChange={() => {}}
          disabled={true}
        />
        <Main_TextField
          label={'Updated Date Time'}
          defaultValue={formatDateTime(updatedAt)}
          onChange={() => {}}
          disabled={true}
        />
      </div>
    </Main_InputContainer>
  );
};

Main_ProductIcon.propTypes = {
  onChange: PropTypes.func,
  showMaxImagesNotice: PropTypes.bool,
};

export default Main_ProductIcon;
