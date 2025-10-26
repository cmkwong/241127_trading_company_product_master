import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_SuggestTextField.module.css';
import Main_TextField from '../TextField/Main_TextField';

/**
 * Sub_SuggestTextField Component
 * Handles the rendering of the input field and the suggestion list.
 * Uses Main_TextField for consistent input styling across the application.
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

  const handleInputChange = (newValue) => {
    onInputChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick(suggestion.name || suggestion);
    setIsFocused(false); // Close suggestion list after selection
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion items
    setTimeout(() => setIsFocused(false), 150);
  };

  return (
    <div className={styles.inputContainer}>
      <Main_TextField
        inputId={id}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={styles.suggestInput}
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
