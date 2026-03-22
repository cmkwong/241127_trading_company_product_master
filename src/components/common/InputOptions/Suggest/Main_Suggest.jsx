import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
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
    onFocus,
    onBlur,
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
  const inputContainerRef = useRef(null);
  const [listStyle, setListStyle] = useState(null);

  const handleInputChange = useCallback(
    (ov, nv) => {
      console.log('Input changed:', nv);
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
    onFocus?.();
  }, [onFocus]);

  const handleBlur = () => {
    // Delay to allow click on suggestion items
    setTimeout(() => setIsFocused(false), 150);
    onBlur?.();
  };

  useEffect(() => {
    if (!isFocused || filterSuggestions.length === 0) {
      setListStyle(null);
      return;
    }

    const updateListPosition = () => {
      const container = inputContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const estimatedListHeight = 220;
      const spaceBelow = viewportHeight - rect.bottom;
      const openUpward =
        spaceBelow < estimatedListHeight && rect.top > spaceBelow;

      const top = openUpward
        ? Math.max(8, rect.top - estimatedListHeight - 4)
        : rect.bottom + 2;

      setListStyle({
        position: 'fixed',
        left: rect.left,
        top,
        width: rect.width,
        zIndex: 10020,
      });
    };

    updateListPosition();
    window.addEventListener('resize', updateListPosition);
    window.addEventListener('scroll', updateListPosition, true);

    return () => {
      window.removeEventListener('resize', updateListPosition);
      window.removeEventListener('scroll', updateListPosition, true);
    };
  }, [isFocused, filterSuggestions.length]);

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
        <div className={styles.inputContainer} ref={inputContainerRef}>
          <Main_TextField
            inputId={inputId || uuidv4()}
            defaultValue={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={styles.suggestInput}
          />
          {isFocused &&
            filterSuggestions.length > 0 &&
            listStyle &&
            createPortal(
              <ul className={styles.suggestionList} style={listStyle}>
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
              </ul>,
              document.body,
            )}
        </div>
      </div>
    </div>
  );
};

Main_Suggest.propTypes = {
  // Events
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
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
