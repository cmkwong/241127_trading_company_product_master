import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_Suggest.module.css';
import Sub_SuggestTextField from './Sub_SuggestTextField';

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

    // Utility
    generateId,

    // UI
    label,
    inputId,
    placeholder = 'Type to search...',
  } = props;

  const makeId = (prefix = 'suggest-input') =>
    `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(
      36
    )}`;

  // Stable per-mount auto id
  const autoIdRef = useState(inputId || makeId('suggest-input'))[0];
  const resolvedId = inputId || autoIdRef;

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
  const currentValue = isValueControlled ? controlledValue : innerValue;

  // ID generator
  const getNewId = useMemo(
    () =>
      generateId ||
      (() => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    [generateId]
  );

  // Update suggestions array (both modes)
  const setSuggestions = useCallback(
    (newSuggestions) => {
      if (isSuggestionsControlled) {
        // Let parent handle suggestions changes if controlled
        updateSuggestions?.(newSuggestions);
      } else {
        setInnerSuggestions(newSuggestions);
      }
      onChange({ value: currentValue, suggestions: newSuggestions });
    },
    [isSuggestionsControlled, updateSuggestions, currentValue, onChange]
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

  // Input field props
  const inputProps = useMemo(
    () => ({
      id: resolvedId,
      suggestions: currentSuggestions,
      value: currentValue,
      onInputChange: setValue,
      onSuggestionClick: setValue,
      placeholder,
    }),
    [resolvedId, currentSuggestions, currentValue, setValue, placeholder]
  );

  return (
    <div className={styles.suggestContainer} data-testid="suggest-container">
      {label && (
        <label htmlFor={resolvedId} className={styles.label}>
          {label}
        </label>
      )}

      <Sub_SuggestTextField {...inputProps} />
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
