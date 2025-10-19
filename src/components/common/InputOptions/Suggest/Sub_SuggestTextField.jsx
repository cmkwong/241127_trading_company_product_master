import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_SuggestTextField.module.css';

/**
 * Sub_SuggestTextField Component
 * Handles the rendering of the input field and the suggestion list.
 */
const Sub_SuggestTextField = ({
  id,
  suggestions = [],
  value = '',
  onInputChange,
  onSuggestionClick,
  placeholder = 'Type to search...',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e) => {
    onInputChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick(suggestion.name || suggestion);
    setIsFocused(false); // Close suggestion list after selection
  };

  return (
    <div className={styles.inputContainer}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow click
        placeholder={placeholder}
        className={styles.inputField}
      />
      {isFocused && suggestions.length > 0 && (
        <ul className={styles.suggestionList}>
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id || index}
              className={styles.suggestionItem}
              onClick={() => handleSuggestionClick(suggestion)}
              tabIndex={0}
            >
              {suggestion.name || suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

Sub_SuggestTextField.propTypes = {
  id: PropTypes.string.isRequired,
  suggestions: PropTypes.array,
  value: PropTypes.string,
  onInputChange: PropTypes.func.isRequired,
  onSuggestionClick: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default Sub_SuggestTextField;
