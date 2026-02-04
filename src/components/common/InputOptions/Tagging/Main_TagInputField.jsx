import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Sub_TagPlate from './Sub_TagPlate';
import Sub_TagTextField from './Sub_TagTextField';
import Sub_TagList from './Sub_TagList';
import styles from './Main_TagInputField.module.css';
import { v4 as uuidv4 } from 'uuid';

const Main_TagInputField = (props) => {
  const {
    onChange = () => {},
    onAdd = () => {},
    // Uncontrolled defaults
    defaultOptions = [],
    defaultSelectedOptions = [],
    // Control options
    canAddNewOptions = true,
  } = props;

  // Internal state
  const [options, setOptions] = useState(defaultOptions);
  const [selectedOptions, setSelectedOptions] = useState(
    defaultSelectedOptions,
  );

  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);

  useEffect(() => {
    setSelectedOptions(defaultSelectedOptions);
  }, [defaultSelectedOptions]);

  // UI controls
  const inputReference = useRef(null);
  const containerRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [showOption, setShowOption] = useState(false);
  const [selectionMouseIn, setSelectionMouseIn] = useState(false);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowOption(false);
      }
    };

    if (showOption) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOption]);

  // Update selection for one option
  const updateOptionData = useCallback(
    (id, checked) => {
      const oldSelected = selectedOptions || [];
      const nextSelected = checked
        ? Array.from(new Set([...(selectedOptions || []), id]))
        : (selectedOptions || []).filter((x) => x !== id);

      setSelectedOptions(nextSelected);
      onChange?.(oldSelected, nextSelected);
    },
    [selectedOptions, onChange],
  );
  // Internal addOptionData
  const addOptionData = useCallback(
    (name) => {
      const oldSelected = selectedOptions || [];
      const trimmed = (name || '').trim();
      if (!trimmed) return;

      // Check duplicates (case-insensitive)
      const dup = (options || []).filter(
        (el) => el.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (dup.length > 0) {
        dup.forEach((el) => updateOptionData(el.id, true));
        return;
      }

      // Check if adding new options is allowed
      if (!canAddNewOptions) return;

      // Add new option
      const newId = uuidv4();
      const newOption = { id: newId, name: trimmed };
      const nextOptions = [...(options || []), newOption];
      const nextSelected = Array.from(
        new Set([...(selectedOptions || []), newId]),
      );

      setOptions(nextOptions);
      setSelectedOptions(nextSelected);
      onChange?.(oldSelected, nextSelected);
      onAdd?.(newOption);
    },
    [selectedOptions, onChange, updateOptionData, options, canAddNewOptions],
  );

  // add the value into option
  const handleEnterPress = (value) => {
    if (!value) return;
    // hide the option choice
    setShowOption(false);
    // clear the value after enter pressed
    if (inputReference.current) inputReference.current.value = '';
    setInputValue('');
    // add data into option
    addOptionData(value);
  };

  // handle layout
  const handleFocus = (event) => {
    setShowOption(true);
  };
  const handleFocusOut = (event) => {
    if (!selectionMouseIn) {
      setShowOption(false);
    }
  };

  const handleSelectionMouseEnter = (event) => {
    setSelectionMouseIn(true);
  };
  const handleSelectionMouseOut = (event) => {
    setSelectionMouseIn(false);
  };
  const handleClickSelection = (event) => {
    // inputReference.current.focus();
  };

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options || [];
    const v = inputValue.toLowerCase();
    return (options || []).filter((el) => {
      return el.name.toLowerCase().includes(v);
    });
  }, [options, inputValue]);

  return (
    <>
      <div ref={containerRef} className={styles.inputOption}>
        <Sub_TagTextField
          reference={inputReference}
          onClick={handleFocus}
          onBlur={handleFocusOut}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleEnterPress(event.target.value);
            }
            if (event.key === 'Escape') {
              setShowOption(false);
            }
          }}
          // sorting the key words
          onChange={(ov, nv) => setInputValue(nv)}
        />
        {showOption && (
          <Sub_TagList
            handleSelectionMouseEnter={handleSelectionMouseEnter}
            handleSelectionMouseOut={handleSelectionMouseOut}
            handleClickSelection={handleClickSelection}
            filteredOptions={filteredOptions}
            selectedOptions={selectedOptions}
            updateOptionData={updateOptionData}
          />
        )}
      </div>
      <div className={styles.tagContainer}>
        {(options || []).map((el) =>
          // Showing the tag plate
          selectedOptions && selectedOptions.includes(el.id) ? (
            <Sub_TagPlate
              key={el.id}
              id={el.id}
              name={el.name}
              updateOptionData={updateOptionData}
            />
          ) : null,
        )}
      </div>
    </>
  );
};

export default Main_TagInputField;
