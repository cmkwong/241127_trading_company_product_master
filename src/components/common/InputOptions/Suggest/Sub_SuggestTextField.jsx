import { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_SuggestTextField.module.css';
import Main_TextField from '../TextField/Main_TextField';

/**
 * Sub_SuggestTextField Component
 * Handles the rendering of the input field and the suggestion list.
 * Uses Main_TextField for consistent input styling across the application.
 */
const Sub_SuggestTextField = forwardRef(
  (
    {
      id,
      suggestions = [],
      value = '',
      onInputChange,
      onSuggestionItemClick,
      placeholder = 'Type to search...',
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleInputChange = ({ value }) => {
      onInputChange({ value });
    };

    const handleSuggestionItemClick = (suggestion) => {
      onSuggestionItemClick({ value: suggestion });
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
          ref={ref}
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
                key={index}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionItemClick(suggestion)}
                tabIndex={0}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

Sub_SuggestTextField.propTypes = {
  id: PropTypes.string.isRequired,
  suggestions: PropTypes.array,
  value: PropTypes.string,
  onInputChange: PropTypes.func.isRequired,
  onSuggestionItemClick: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

// Add displayName for better debugging
Sub_SuggestTextField.displayName = 'Sub_SuggestTextField';

export default Sub_SuggestTextField;
