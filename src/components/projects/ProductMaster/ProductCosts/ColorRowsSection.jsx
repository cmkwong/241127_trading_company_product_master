import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import IconUpload from '../../../common/InputOptions/IconUpload/IconUpload';
import styles from './ColorRowsSection.module.css';

const ColorRowsSection = ({
  variantColors,
  getColorImageRecord,
  colorSuggestionNames,
  colorDraftByVariantId,
  getColorDisplayName,
  setColorDraftByVariantId,
  commitColorDraft,
  handleColorImageFileChange,
  handleRemoveColorRow,
  handleAddColorRow,
}) => {
  return (
    <div className={styles.controlBlock}>
      <div className={styles.groupHeader}>
        <div className={styles.titleWrap}>
          <div className={styles.groupTitle}>Color</div>
          <div className={styles.countBadge}>{variantColors.length}</div>
        </div>

        <button
          type="button"
          className={styles.addNewBtn}
          onClick={handleAddColorRow}
          aria-label="Add new color"
          title="Add New"
        >
          <svg
            className={styles.addNewIcon}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 4.5V15.5M4.5 10H15.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Add New
        </button>
      </div>

      <div className={styles.colorRowsWrap}>
        {variantColors.map((row) => {
          const imageRecord = getColorImageRecord?.(row);

          return (
            <div key={row.id} className={styles.colorRow}>
              <div className={styles.colorSuggestWrap}>
                <Main_Suggest
                  defaultSuggestions={colorSuggestionNames}
                  defaultValue={
                    colorDraftByVariantId[row.id] ?? getColorDisplayName(row)
                  }
                  onChange={(ov, nv) => {
                    setColorDraftByVariantId((prev) => ({
                      ...prev,
                      [row.id]: nv,
                    }));
                  }}
                  placeholder="Type or select"
                  onBlur={() => commitColorDraft(row.id)}
                />
              </div>

              <div className={styles.colorUploaderWrap}>
                <IconUpload
                  inputId={`color-image-${row.id}`}
                  imageUrl={imageRecord?.image_url || row.image_url}
                  imageName={
                    imageRecord?.image_name || row.image_name || 'color'
                  }
                  onSelectFile={(file) => handleColorImageFileChange(row, file)}
                  title="Select color image"
                  sizePx={42}
                  placeholder="+"
                />
                <button
                  type="button"
                  className={styles.deleteIconBtn}
                  onClick={() => handleRemoveColorRow(row.id)}
                  title="Delete color"
                  aria-label="Delete color"
                >
                  <svg
                    className={styles.deleteIcon}
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
              </div>
            </div>
          );
        })}

        {variantColors.length === 0 && (
          <div className={styles.emptyHint}>
            Click Add New to add a color row.
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorRowsSection;
