import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_Suggest.module.css';
import Sub_SuggestTextField from './Sub_SuggestTextField.jsx';
import ControlRowBtn from '../../../projects/ControlRowBtn.jsx';

/**
 * Main_Suggest Component
 * Provides an input field with a suggestion list based on user input.
 *
 * onChange signature:
 *   onChange({ value, suggestions, rowValues })
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

  // State to manage multiple rows of input fields
  const [rows, setRows] = useState([
    {
      id: Math.random().toString(36).slice(2, 8),
      value: defaultValue,
      suggestions: defaultSuggestions,
    },
  ]);

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

  // Input field props
  const getInputProps = useCallback(
    (rowValue, rowId) => ({
      id: inputId || makeId(`suggest-input-${rowId}`),
      // when user typed in input, filter the required suggestions
      suggestions: rowValue
        ? (currentSuggestions || []).filter((el) =>
            el.toLowerCase().includes(rowValue.toLowerCase())
          )
        : currentSuggestions || [],
      value: rowValue,
      onInputChange: (newValue) => handleRowValueChange(rowId, newValue),
      onSuggestionClick: (newValue) => handleRowValueChange(rowId, newValue),
      placeholder,
    }),
    [inputId, currentSuggestions, placeholder]
  );

  // Handle adding a new row
  const handleAddClick = useCallback(() => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: Math.random().toString(36).slice(2, 8),
        value: '',
        suggestions: currentSuggestions,
      },
    ]);
  }, [currentSuggestions]);

  // Handle removing a row
  const handleRemoveClick = useCallback((rowId) => {
    // Don't remove the last row
    setRows((prevRows) => {
      if (prevRows.length <= 1) {
        return prevRows;
      }
      return prevRows.filter((row) => row.id !== rowId);
    });
  }, []);

  // Handle value change for a specific row
  const handleRowValueChange = useCallback(
    (rowId, newValue) => {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId ? { ...row, value: newValue } : row
        )
      );

      // Notify parent component about all values
      const allValues = rows
        .map((row) => (row.id === rowId ? newValue : row.value))
        .filter(Boolean);

      onChange({
        value: allValues.join(', '),
        suggestions: currentSuggestions,
        rowValues: allValues,
      });
    },
    [rows, onChange, currentSuggestions]
  );

  return (
    <div className={styles.suggestContainer} data-testid="suggest-container">
      {label && <label className={styles.label}>{label}</label>}

      {rows.map((row) => (
        <ControlRowBtn
          key={row.id}
          onAdd={handleAddClick}
          onRemove={() => handleRemoveClick(row.id)}
        >
          <Sub_SuggestTextField {...getInputProps(row.value, row.id)} />
        </ControlRowBtn>
      ))}
    </div>
  );
};

Main_Suggest.propTypes = {
  // Controlled API
  suggestions: PropTypes.array,
  value: PropTypes.string,
  updateSuggestions: PropTypes.func,

  // Events
  onChange: PropTypes.func, // onChange({ value, suggestions, rowValues })

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
