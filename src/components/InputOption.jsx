import { useEffect, useState } from 'react';
import styles from './InputOption.module.css';
import { useRef } from 'react';
import OptionRow from './OptionRow';
import TagPlate from './tagPlate';

const InputOption = (props) => {
  let { data } = props;

  const [options, setOptions] = useState(data);
  const [filterOptions, setFitlerOptions] = useState(data);

  let inputWidth = '100%';

  const inputReference = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [showOption, setShowOption] = useState(false);
  const [selectionMouseIn, setSelectionMouseIn] = useState(false);

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
    inputReference.current.focus();
  };

  // handle data
  const updateOptionData = (id, nv) => {
    setOptions(
      options.map((el) => {
        if (el.id === id) {
          el.checked = nv;
        }
        return el;
      })
    );
  };
  // add the value into option
  const handleEnterPress = (value) => {
    if (!value) return;
    // hide the option choice
    setShowOption(false);
    // clear the value after enter pressed
    inputReference.current.value = '';
    setInputValue('');

    // finding if it has the same element, then set it into checked and no need to add new
    let duplicatedOptions = options.filter(
      (el) => el.label.toLowerCase() === value.toLowerCase()
    );
    if (duplicatedOptions.length > 0) {
      duplicatedOptions.map((el) => {
        updateOptionData(el.id, true);
      });
      return;
    }
    // add data into option
    addOptionData(value);
  };

  // add option data
  const addOptionData = (value) => {
    // getting the new ID
    const max_option = options.reduce((acc, curr) => {
      return acc.id < curr.id ? curr : acc;
    });
    setOptions([
      { id: max_option.id + 1, label: value, checked: true },
      ...options,
    ]);
  };

  return (
    <div className={styles['inputOption']}>
      <div style={{ width: inputWidth }} className={styles['inputContainer']}>
        <input
          className={styles['inputField']}
          type="text"
          ref={inputReference}
          onClick={handleFocus}
          onBlur={handleFocusOut}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleEnterPress(event.target.value);
            }
          }}
          // sorting the key words
          onChange={() => setInputValue(inputReference.current.value)}
        />
        {showOption && (
          <div
            className={styles['optionList']}
            style={{ width: inputWidth }}
            onMouseEnter={handleSelectionMouseEnter}
            onMouseLeave={handleSelectionMouseOut}
            onClick={handleClickSelection}
          >
            {options.map((el) => {
              if (inputValue && !el.label.includes(inputValue)) return;
              return (
                <OptionRow
                  key={el.id}
                  id={el.id}
                  label={el.label}
                  checked={el.checked}
                  updateOptionData={updateOptionData}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className={styles.tagContainer}>
        {options.map((el) => {
          if (el.checked) {
            return (
              <TagPlate
                key={el.id}
                id={el.id}
                label={el.label}
                updateOptionData={updateOptionData}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default InputOption;
