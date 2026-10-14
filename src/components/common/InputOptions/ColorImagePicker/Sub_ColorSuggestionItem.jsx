import PropTypes from 'prop-types';
import styles from './Main_ColorImagePicker.module.css';

/**
 * Suggestion row for the colour picker: hex swatch + name + optional
 * description. Rendered inside `Main_Suggest` via `renderSuggestion`.
 */
const Sub_ColorSuggestionItem = ({ color }) => {
  const name = color?.name || '';
  const hex = color?.color_code_hex || '';
  const description = color?.description || '';

  return (
    <div className={styles.suggestionItem}>
      <span
        className={styles.suggestionSwatch}
        style={{ backgroundColor: hex || 'transparent' }}
        aria-hidden="true"
      />
      <span className={styles.suggestionName}>{name}</span>
      {description ? (
        <span className={styles.suggestionDescription}>{description}</span>
      ) : null}
    </div>
  );
};

Sub_ColorSuggestionItem.propTypes = {
  color: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    color_code_hex: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default Sub_ColorSuggestionItem;
