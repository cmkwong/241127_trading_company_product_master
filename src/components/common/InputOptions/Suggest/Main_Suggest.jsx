import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_Suggest.module.css';
import Sub_SuggestTextField from './Sub_SuggestTextField.jsx';

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
    // Controlled props
    suggestions: controlledSuggestions,
    value: controlledValue,
    updateSuggestions, // controlled handler for suggestions array only

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

  const makeId = (prefix = 'suggest-input') =>
    `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(
      36
    )}`;

  // Determine controlled/uncontrolled mode correctly
  const { isSuggestionsControlled, isValueControlled } = useMemo(
    () => ({
      isSuggestionsControlled: controlledSuggestions !== undefined,
      isValueControlled: controlledValue !== undefined,
    }),
    [controlledSuggestions, controlledValue]
  );

  // Internal state for uncontrolled mode
  const [innerSuggestions, setInnerSuggestions] = useState(defaultSuggestions);
  const [innerValue, setInnerValue] = useState(defaultValue);

  // Resolve current state
  const currentSuggestions = isSuggestionsControlled
    ? controlledSuggestions
    : innerSuggestions;
  const inputValue = isValueControlled ? controlledValue : innerValue;

  // Update suggestions array (both modes)
  const setSuggestions = useCallback(
    (newSuggestions) => {
      if (isSuggestionsControlled) {
        // Let parent handle suggestions changes if controlled
        updateSuggestions?.(newSuggestions);
      } else {
        setInnerSuggestions(newSuggestions);
      }
      onChange({ value: inputValue, suggestions: newSuggestions });
    },
    [isSuggestionsControlled, updateSuggestions, inputValue, onChange]
  );

  // Update input value (both modes)
  const setValue = useCallback(
    (newValue) => {
      if (isValueControlled) {
        // Parent manages value in controlled mode
        onChange({ value: newValue, suggestions: currentSuggestions });
      } else {
        setInnerValue(newValue);
        onChange({ value: newValue, suggestions: currentSuggestions });
      }
    },
    [isValueControlled, currentSuggestions, onChange]
  );

  // when user typed in input, filter the required suggestions
  const filterSuggestions = useMemo(() => {
    if (!inputValue) return currentSuggestions || [];
    const v = inputValue.toLowerCase();
    return (currentSuggestions || []).filter((el) => {
      return el.toLowerCase().includes(v);
    });
  }, [inputValue, currentSuggestions]);

  // Input field props
  const inputProps = useMemo(
    () => ({
      id: inputId || makeId('suggest-input'),
      suggestions: filterSuggestions,
      value: inputValue,
      onInputChange: setValue,
      onSuggestionClick: setValue,
      placeholder,
    }),
    [inputId, filterSuggestions, inputValue, setValue, placeholder]
  );

  return (
    <div className={styles.suggestContainer} data-testid="suggest-container">
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <Sub_SuggestTextField {...inputProps} />
      </div>
    </div>
  );
};

Main_Suggest.propTypes = {
  // Controlled API
  suggestions: PropTypes.array,
  value: PropTypes.string,
  updateSuggestions: PropTypes.func,

  // Events
  onChange: PropTypes.func, // onChange({ value, suggestions })
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
