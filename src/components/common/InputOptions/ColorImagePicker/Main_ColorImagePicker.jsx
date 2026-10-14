import { useRef } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import styles from './Main_ColorImagePicker.module.css';
import IconUpload from '../IconUpload/IconUpload';
import { getEntryDisplayName } from '../../FileSelector/fileSelectorUtils';

// Mirrors the image MIME types recognised by the server's file-bank directory
// listing (MIME_BY_EXT) so zero-copy bank picks are never rejected.
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/x-icon',
  'image/avif',
  'image/tiff',
  'image/svg+xml',
];

/**
 * Per-colour-row thumbnail control (icon-uploader style): shows the uploaded
 * image, or the pure colour from `hex_color_code` when no image exists.
 *
 * Reuses `IconUpload` for native upload + file-bank browse (no header toolbar)
 * and emits a shaped record so the parent can write the child image row:
 * - native upload  -> { image_url: blob:..., image_name, _base64_changed: true }
 * - file-bank pick -> { image_url: /public/..., image_name, reuse_existing_file: true, _base64_changed: false }
 * - remove         -> null
 */
const Main_ColorImagePicker = ({
  imageRecord = null,
  hex_color_code = '',
  directoryPath = '',
  disabled = false,
  inputId,
  onImageChange = () => {},
}) => {
  const inputIdRef = useRef(inputId || `color-image-${uuidv4()}`);

  const imageUrl = imageRecord?.image_url || '';
  const imageName = imageRecord?.image_name || '';

  const handleSelectFile = (file) => {
    if (!file) return;
    onImageChange({
      image_url: URL.createObjectURL(file),
      image_name: file.name || '',
      _base64_changed: true,
    });
  };

  const handleSelectExisting = (entry) => {
    if (!entry?.path) return;
    onImageChange({
      image_url: entry.path,
      image_name: getEntryDisplayName(entry),
      reuse_existing_file: true,
      _base64_changed: false,
    });
  };

  const handleRemove = () => {
    onImageChange(null);
  };

  return (
    <div
      className={`${styles.wrapper} ${disabled ? styles.disabled : ''}`}
      title={imageName || ''}
    >
      <IconUpload
        inputId={inputIdRef.current}
        imageUrl={imageUrl}
        imageName={imageName || 'color-image'}
        fallbackColor={hex_color_code}
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        title="Select color image"
        sizePx={44}
        directoryPath={directoryPath}
        onSelectFile={handleSelectFile}
        onSelectExisting={handleSelectExisting}
      />

      {imageUrl && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={handleRemove}
          title="Remove color image"
          aria-label="Remove color image"
        >
          <svg
            className={styles.removeIcon}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 6L14 14M14 6L6 14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

Main_ColorImagePicker.propTypes = {
  imageRecord: PropTypes.shape({
    id: PropTypes.string,
    image_url: PropTypes.string,
    image_name: PropTypes.string,
  }),
  hex_color_code: PropTypes.string,
  directoryPath: PropTypes.string,
  disabled: PropTypes.bool,
  inputId: PropTypes.string,
  onImageChange: PropTypes.func,
};

export default Main_ColorImagePicker;
