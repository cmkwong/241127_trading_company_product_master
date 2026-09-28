import { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './IconUpload.module.css';
import Main_FileSelector from '../../FileSelector/Main_FileSelector';
import { resolveDisplayFileUrl } from '../../../../utils/filePickerUtils';

const SIZE_PRESETS = {
  S: 28,
  M: 56,
  L: 112,
  XL: 224,
};

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL'];

const normalizeSize = (value) => {
  if (!value || typeof value !== 'string') return 'M';
  const normalized = value.toUpperCase();
  return SIZE_OPTIONS.includes(normalized) ? normalized : 'M';
};

/**
 * Thumbnail upload control with an optional "file bank" browse button.
 *
 * - Clicking the thumbnail opens the native file picker (`onSelectFile`).
 * - When a `directoryPath` is provided, a small browse button appears in the
 *   bottom-right corner and opens the in-app File Banks window. Selecting a file
 *   there calls `onSelectExisting(entry)` with the existing `/public/...` path
 *   so the caller can store it verbatim (zero-copy).
 */
const IconUpload = ({
  inputId,
  imageUrl,
  imageName,
  onSelectFile,
  onSelectExisting,
  accept = 'image/*',
  title = 'Select image',
  size = 'M',
  sizePx,
  directoryPath = '',
}) => {
  const selectedSize = normalizeSize(size);
  const fileInputRef = useRef(null);
  const [browserOpen, setBrowserOpen] = useState(false);

  const buttonSize = useMemo(
    () =>
      Number(sizePx) > 0
        ? Number(sizePx)
        : SIZE_PRESETS[selectedSize] || SIZE_PRESETS.M,
    [selectedSize, sizePx],
  );

  // Stored `/public/...` paths are served only by the backend origin, so resolve
  // them (and leave blob:/data:/absolute URLs untouched) before rendering.
  const previewUrl = useMemo(() => resolveDisplayFileUrl(imageUrl), [imageUrl]);

  const handleBrowseClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setBrowserOpen(true);
  };

  const handleSelectExisting = (entry) => {
    setBrowserOpen(false);
    onSelectExisting?.(entry);
  };

  return (
    <div className={styles.wrapper}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        ref={fileInputRef}
        className={styles.hiddenFileInput}
        onChange={(event) => {
          const file = event.target.files?.[0];
          onSelectFile?.(file);
          event.target.value = '';
        }}
      />

      <div className={styles.thumbWrap}>
        <label
          htmlFor={inputId}
          className={styles.thumbBtn}
          title={title}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
        >
          {imageUrl ? (
            <img
              src={previewUrl}
              alt={imageName || 'preview'}
              className={styles.thumb}
            />
          ) : (
            <span className={styles.placeholder} aria-hidden="true">
              <svg
                className={styles.plusIcon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          )}
        </label>

        {directoryPath && (
          <button
            type="button"
            className={styles.browseBtn}
            onClick={handleBrowseClick}
            title="Browse file bank"
            aria-label="Browse file bank"
          >
            <svg
              className={styles.browseIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <Main_FileSelector
        isOpen={browserOpen}
        onClose={() => setBrowserOpen(false)}
        startPath={directoryPath}
        mode="image"
        onSelect={handleSelectExisting}
      />
    </div>
  );
};

IconUpload.propTypes = {
  inputId: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  imageName: PropTypes.string,
  onSelectFile: PropTypes.func,
  onSelectExisting: PropTypes.func,
  accept: PropTypes.string,
  title: PropTypes.string,
  size: PropTypes.string,
  sizePx: PropTypes.number,
  directoryPath: PropTypes.string,
};

export default IconUpload;
