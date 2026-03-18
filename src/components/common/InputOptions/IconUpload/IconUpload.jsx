import { useMemo } from 'react';
import styles from './IconUpload.module.css';

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

const IconUpload = ({
  inputId,
  imageUrl,
  imageName,
  onSelectFile,
  accept = 'image/*',
  title = 'Select image',
  size = 'M',
  sizePx,
}) => {
  const selectedSize = normalizeSize(size);

  const buttonSize = useMemo(
    () =>
      Number(sizePx) > 0
        ? Number(sizePx)
        : (SIZE_PRESETS[selectedSize] || SIZE_PRESETS.M),
    [selectedSize, sizePx],
  );

  return (
    <div className={styles.wrapper}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className={styles.hiddenFileInput}
        onChange={(event) => {
          const file = event.target.files?.[0];
          onSelectFile?.(file);
          event.target.value = '';
        }}
      />

      <label
        htmlFor={inputId}
        className={styles.thumbBtn}
        title={title}
        style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
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
    </div>
  );
};

export default IconUpload;
