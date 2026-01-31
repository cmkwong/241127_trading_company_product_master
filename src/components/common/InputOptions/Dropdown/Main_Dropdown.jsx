import { useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_Dropdown.module.css';
import Sub_SelectField from './Sub_SelectField';
// import TextField from './TextField'; // optional

/**
 * Main_Dropdown Component
 * Manages a list of options with selection state (supports controlled/uncontrolled)
 *
 * onChange signature:
 *   onChange({ options, selected })
 *
 * Options can be strings or { id, name } objects.
 * Selected is either a string/id (depending on options type).
 */
const Main_Dropdown = (props) => {
  const {
    // Controlled props
    options: controlledOptions,
    selectedOptions: controlledSelected, // naming retained from your code

    // Callbacks
    onChange = () => {},

    // Uncontrolled defaults
    defaultOptions = [],
    defaultSelectedOption = '',

    // Utility
    generateId,

    // UI
    label,
    dropdownId,
  } = props;

  // Simple helper keeps ids unique per render without relying on external state
  const makeId = (prefix = 'input-list') =>
    `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(
      36,
    )}`;

  // Stable per-mount auto id
  const autoIdRef = useRef(dropdownId || makeId('input-list'));
  const resolvedId = dropdownId || autoIdRef.current;

  // Decide once per render whether consumer is controlling options/selection
  const { isOptionsControlled, isSelectedControlled } = useMemo(
    () => ({
      isOptionsControlled: controlledOptions !== undefined,
      isSelectedControlled: controlledSelected !== undefined,
    }),
    [controlledOptions, controlledSelected],
  );

  // Internal state for uncontrolled mode
  const [innerOptions, setInnerOptions] = useState(defaultOptions);
  const [innerSelected, setInnerSelected] = useState(defaultSelectedOption);

  // Resolve current state
  const currentOptions = isOptionsControlled ? controlledOptions : innerOptions;
  const currentSelected = isSelectedControlled
    ? controlledSelected
    : innerSelected;

  // Bridge controlled and uncontrolled usage while always notifying parent
  const setSelected = useCallback(
    (newSelected) => {
      if (isSelectedControlled) {
        // Parent manages selection in controlled mode
        onChange({ options: currentOptions, selected: newSelected });
      } else {
        setInnerSelected(newSelected);
        onChange({ options: currentOptions, selected: newSelected });
      }
    },
    [isSelectedControlled, currentOptions, onChange],
  );

  // Dropdown props
  const dropdownProps = useMemo(
    () => ({
      id: resolvedId,
      options: currentOptions,
      selectedValue: currentSelected,
      onOptionClick: setSelected,
      buttonAltText: 'Select an option',
      placeholder: 'Select an option',
    }),
    [resolvedId, currentOptions, currentSelected, setSelected],
  );

  return (
    <div className={styles.inputList} data-testid="input-list-container">
      {label && (
        <label htmlFor={dropdownId} className={styles.label}>
          {label}
        </label>
      )}
      <Sub_SelectField {...dropdownProps} />
    </div>
  );
};

Main_Dropdown.propTypes = {
  // Controlled API
  options: PropTypes.array,
  selectedOptions: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  // Events
  onChange: PropTypes.func, // onChange({ options, selected })

  // Uncontrolled defaults
  defaultOptions: PropTypes.array,
  defaultSelectedOption: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),

  // Utils
  generateId: PropTypes.func,

  // UI
  label: PropTypes.string,
  dropdownId: PropTypes.string,
};

export default Main_Dropdown;
