import PropTypes from 'prop-types';
import Main_ColorImagePicker from '../../../common/InputOptions/ColorImagePicker/Main_ColorImagePicker';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Sub_ColorSuggestionItem from '../../../common/InputOptions/ColorImagePicker/Sub_ColorSuggestionItem';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import { getVariantTypeId } from './productCostsUtils';
import styles from './ColorRowsSection.module.css';

const ColorRowsSection = ({
  variantColors,
  getColorImageRecord,
  colorOptions,
  colorDraftByVariantId,
  getColorDisplayName,
  setColorDraftByVariantId,
  commitColorDraft,
  handleColorSelect,
  handleColorImageChange,
  colorImagesDirectoryPath,
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

        <AddNewBtn
          onClick={handleAddColorRow}
          ariaLabel="Add new color"
          title="Add New"
        />
      </div>

      <div className={styles.colorRowsWrap}>
        {variantColors.map((row) => {
          const imageRecord = getColorImageRecord?.(row);
          const colorTypeId = getVariantTypeId(row, 'color');
          const colorName =
            colorDraftByVariantId[row.id] ?? getColorDisplayName(row);
          const hexColorCode =
            colorOptions.find((item) => item?.id === colorTypeId)
              ?.color_code_hex || '';

          return (
            <div key={row.id} className={styles.colorRow}>
              <div className={styles.colorSuggestWrap}>
                <Main_Suggest
                  defaultSuggestions={colorOptions}
                  defaultValue={colorName}
                  getSuggestionLabel={(item) => item?.name || ''}
                  getSuggestionSearchText={(item) => item?.name || ''}
                  renderSuggestion={(item) => (
                    <Sub_ColorSuggestionItem color={item} />
                  )}
                  onSelectSuggestion={(item) => {
                    if (item) handleColorSelect(row.id, item);
                  }}
                  onChange={(ov, nv) =>
                    setColorDraftByVariantId((prev) => ({
                      ...prev,
                      [row.id]: nv,
                    }))
                  }
                  onBlur={() => commitColorDraft(row.id)}
                  placeholder="Pick or type a color"
                />
              </div>

              <div className={styles.colorUploaderWrap}>
                <Main_ColorImagePicker
                  imageRecord={imageRecord}
                  hex_color_code={hexColorCode}
                  directoryPath={colorImagesDirectoryPath}
                  onImageChange={(nextRecord) =>
                    handleColorImageChange(row, nextRecord)
                  }
                />
              </div>

              {!!imageRecord && !colorTypeId && (
                <span
                  className={styles.warningChip}
                  role="alert"
                  title="A colour is required before this product can be saved."
                >
                  Color required
                </span>
              )}

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

ColorRowsSection.propTypes = {
  variantColors: PropTypes.array,
  getColorImageRecord: PropTypes.func,
  colorOptions: PropTypes.array,
  colorDraftByVariantId: PropTypes.object,
  getColorDisplayName: PropTypes.func,
  setColorDraftByVariantId: PropTypes.func,
  commitColorDraft: PropTypes.func,
  handleColorSelect: PropTypes.func,
  handleColorImageChange: PropTypes.func,
  colorImagesDirectoryPath: PropTypes.string,
  handleRemoveColorRow: PropTypes.func,
  handleAddColorRow: PropTypes.func,
};

export default ColorRowsSection;
