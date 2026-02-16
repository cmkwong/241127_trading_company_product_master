import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
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
    // Callbacks
    onChange = () => {},

    // Uncontrolled defaults
    defaultOptions = [],
    defaultSelectedOption = '',

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

  // Internal state
  const [options, setOptions] = useState(defaultOptions);
  const [selected, setSelectedValue] = useState(defaultSelectedOption);

  // Handle selection change
  const setSelected = useCallback(
    (newSelected) => {
      const ov = selected;
      setSelectedValue(newSelected);
      onChange(ov, newSelected);
    },
    [onChange, selected],
  );

  // Sync internal state with defaultSelectedOption when it changes
  useEffect(() => {
    setSelectedValue(defaultSelectedOption);
    console.log('drop down props change: ', { defaultSelectedOption });
    // if (defaultSelectedOption !== selected) {
    //   console.log('re-set again: ', { defaultSelectedOption, selected });
    // }
  }, [defaultSelectedOption]);

  // Dropdown props
  const dropdownProps = useMemo(
    () => ({
      id: resolvedId,
      options: options,
      selectedValue: selected,
      onOptionClick: setSelected,
      buttonAltText: 'Select an option',
      placeholder: 'Select an option',
    }),
    [resolvedId, options, selected, setSelected],
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
  // Events
  onChange: PropTypes.func,

  // Uncontrolled defaults
  defaultOptions: PropTypes.array,
  defaultSelectedOption: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),

  // UI
  label: PropTypes.string,
  dropdownId: PropTypes.string,
};

export default Main_Dropdown;
