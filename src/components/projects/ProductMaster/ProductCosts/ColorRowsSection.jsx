import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import AddStackBtn from '../../../common/AddStackBtn';
import IconUpload from '../../../common/InputOptions/IconUpload/IconUpload';
import styles from './ColorRowsSection.module.css';

const ColorRowsSection = ({
  variantColors,
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
        <div className={styles.groupTitle}>Color</div>
        <AddStackBtn txt="Add New" handleClick={handleAddColorRow} />
      </div>

      <div className={styles.colorRowsWrap}>
        {variantColors.map((row) => (
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
                imageUrl={row.image_url}
                imageName={row.image_name || 'color'}
                onSelectFile={(file) => handleColorImageFileChange(row, file)}
                title="Select color image"
                placeholder="+"
              />
            </div>

            <button
              type="button"
              className={styles.deleteIconBtn}
              onClick={() => handleRemoveColorRow(row.id)}
              title="Delete color"
              aria-label="Delete color"
            >
              X
            </button>
          </div>
        ))}

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
