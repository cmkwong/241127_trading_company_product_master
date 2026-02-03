import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_Suggest.module.css';
import Main_TextField from '../TextField/Main_TextField';
import { v4 as uuidv4 } from 'uuid';
/**
 * Main_Suggest Component
 * Provides an input field with a suggestion list based on user input.
 *
 * onChange signature:
 *   onChange({ value, suggestions })
 *
 * Suggestions can be strings or { id, name } objects.
 */
const Main_Suggest = (props) => {
  const {
    // Callbacks
    onChange = () => {},
    // Uncontrolled defaults
    defaultSuggestions = [],
    defaultValue = '',

    // UI
    label,
    inputId,
    placeholder = 'Type to search...',
  } = props;

  // Internal state
  const [inputValue, setInputValue] = useState(defaultValue);

  // when user typed in input, filter the required suggestions to show on list
  const filterSuggestions = useMemo(() => {
    if (!inputValue) return defaultSuggestions || [];
    const v = String(inputValue).toLowerCase();
    return (defaultSuggestions || []).filter((el) => {
      // Make sure el is a string before calling toLowerCase
      return typeof el === 'string'
        ? el.toLowerCase().includes(v)
        : String(el).toLowerCase().includes(v);
    });
  }, [inputValue, defaultSuggestions]);

  // Internal state for suggestion UI
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = useCallback(
    (ov, nv) => {
      setInputValue(nv);
      onChange(ov, nv);
    },
    [onChange],
  );

  const handleSuggestionItemClick = useCallback(
    (suggestion) => {
      const ov = inputValue;
      const nv = suggestion;
      setInputValue(nv);
      onChange(ov, nv);
      setIsFocused(false); // Close suggestion list after selection
    },
    [inputValue, onChange],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = () => {
    // Delay to allow click on suggestion items
    setTimeout(() => setIsFocused(false), 150);
  };

  // Input field props
  // const inputProps = useMemo(
  //   () => ({
  //     inputId: inputId || uuidv4(),
  //     value: inputValue,
  //     onChange: handleInputChange,
  //     placeholder,
  //     onFocus: handleFocus,
  //     onBlur: handleBlur,
  //     className: styles.suggestInput,
  //   }),
  //   [inputId, inputValue, placeholder],
  // );

  return (
    <div className={styles.suggestContainer} data-testid="suggest-container">
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <div className={styles.inputContainer}>
          <Main_TextField
            inputId={inputId || uuidv4()}
            defaultValue={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={styles.suggestInput}
          />
          {isFocused && filterSuggestions.length > 0 && (
            <ul className={styles.suggestionList}>
              {filterSuggestions.map((suggestion, index) => (
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
      </div>
    </div>
  );
};

Main_Suggest.propTypes = {
  // Events
  onChange: PropTypes.func,
  // Uncontrolled defaults
  defaultSuggestions: PropTypes.array,
  defaultValue: PropTypes.string,

  // Utils
  generateId: PropTypes.func,

  // UI
  label: PropTypes.string,
  inputId: PropTypes.string,
  placeholder: PropTypes.string,
};

export default Main_Suggest;
