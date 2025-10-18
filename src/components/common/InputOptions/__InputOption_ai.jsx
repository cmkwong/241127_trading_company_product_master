import { useState, useRef, useMemo, useCallback } from 'react';
import styles from './InputOption.module.css';
import OptionRow from './OptionRow';
import TagPlate from './TagPlate';
import InputField from './InputField';

// options: Array<{ id: string | number, name: string }>
// selectedOptions: Array<string | number>

const InputOption = (props) => {
  const {
    // Controlled props (optional)
    options: propsOptions,
    selectedOptions: propsSelectedOptions,
    // Backward compatibility: if provided, delegate selection changes to parent
    updateOptionData: propsUpdateOptionData,
    // Universal change callback
    onChange, // (nextOptions, nextSelectedOptions) => void
    // Uncontrolled defaults
    defaultOptions = [],
    defaultSelectedOptions = [],
    // Optional ID generator for new items
    generateId,
  } = props;

  // Controlled flags
  const isOptionsControlled = propsOptions !== undefined;
  const isSelectedControlled = propsSelectedOptions !== undefined;

  // Internal state when uncontrolled
  const [innerOptions, setInnerOptions] = useState(defaultOptions);
  const [innerSelected, setInnerSelected] = useState(defaultSelectedOptions);

  // Resolved state
  const options = isOptionsControlled ? propsOptions : innerOptions;
  const selectedOptions = isSelectedControlled
    ? propsSelectedOptions
    : innerSelected;

  // UI controls
  const inputReference = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [showOption, setShowOption] = useState(false);
  const [selectionMouseIn, setSelectionMouseIn] = useState(false);

  // Update selection for one option
  const updateOptionData = useCallback(
    (id, checked) => {
      if (propsUpdateOptionData) {
        // Fully controlled by parent
        propsUpdateOptionData(id, checked);
        return;
      }
      const nextSelected = checked
        ? Array.from(new Set([...(selectedOptions || []), id]))
        : (selectedOptions || []).filter((x) => x !== id);

      if (!isSelectedControlled) setInnerSelected(nextSelected);
      onChange?.(options, nextSelected);
    },
    [
      propsUpdateOptionData,
      selectedOptions,
      isSelectedControlled,
      onChange,
      options,
    ]
  );

  // Internal addOptionData
  const addOptionData = useCallback(
    (name) => {
      const trimmed = (name || '').trim();
      if (!trimmed) return;

      // Check duplicates (case-insensitive)
      const dup = (options || []).filter(
        (el) => el.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (dup.length > 0) {
        dup.forEach((el) => updateOptionData(el.id, true));
        return;
      }

      const newId = generateId
        ? generateId(trimmed)
        : `opt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const newOption = { id: newId, name: trimmed };
      const nextOptions = [...(options || []), newOption];
      const nextSelected = Array.from(
        new Set([...(selectedOptions || []), newId])
      );

      if (!isOptionsControlled) setInnerOptions(nextOptions);
      if (!isSelectedControlled) setInnerSelected(nextSelected);

      onChange?.(nextOptions, nextSelected);
    },
    [
      options,
      selectedOptions,
      isOptionsControlled,
      isSelectedControlled,
      onChange,
      updateOptionData,
      generateId,
    ]
  );

  // UI handlers
  const handleFocus = () => setShowOption(true);
  const handleFocusOut = () => {
    if (!selectionMouseIn) setShowOption(false);
  };
  const handleSelectionMouseEnter = () => setSelectionMouseIn(true);
  const handleSelectionMouseOut = () => setSelectionMouseIn(false);
  const handleClickSelection = () => inputReference.current?.focus();

  const handleEnterPress = (value) => {
    if (!value) return;
    setShowOption(false);
    if (inputReference.current) inputReference.current.value = '';
    setInputValue('');
    addOptionData(value);
  };

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options || [];
    const v = inputValue.toLowerCase();
    return (options || []).filter((el) => el.name.toLowerCase().includes(v));
  }, [options, inputValue]);

  return (
    <div className={styles.inputOption}>
      <div className={styles.inputContainer}>
        <InputField
          reference={inputReference}
          onClick={handleFocus}
          onBlur={handleFocusOut}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleEnterPress(event.target.value);
            }
          }}
          onChange={() => setInputValue(inputReference.current?.value || '')}
        />
        {showOption && (
          <div
            className={styles.optionList}
            onMouseEnter={handleSelectionMouseEnter}
            onMouseLeave={handleSelectionMouseOut}
            onClick={handleClickSelection}
          >
            {filteredOptions.map((el) => (
              <OptionRow
                key={el.id}
                id={el.id}
                name={el.name}
                checked={!!(selectedOptions && selectedOptions.includes(el.id))}
                updateOptionData={updateOptionData}
              />
            ))}
          </div>
        )}
      </div>
      <div className={styles.tagContainer}>
        {(options || []).map((el) =>
          selectedOptions && selectedOptions.includes(el.id) ? (
            <TagPlate
              key={el.id}
              id={el.id}
              name={el.name}
              updateOptionData={updateOptionData}
            />
          ) : null
        )}
      </div>
    </div>
  );
};

export default InputOption;
