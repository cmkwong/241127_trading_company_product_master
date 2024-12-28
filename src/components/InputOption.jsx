import { useState } from 'react';
import styles from './InputOption.module.css';
import { useRef } from 'react';
import OptionRow from './OptionRow';
import TagPlate from './tagPlate';
import InputField from './common/InputField';

const InputOption = (props) => {
  // options: [ { id, name } ]
  // selectedOptions: [1, 2, 3, ...]
  const { options, selectedOptions, updateOptionData, addOptionData } = props;

  // controls
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
  // const updateOptionData = (id, checked) => {
  //   if (checked) {
  //     dispatch({
  //       type: 'checkSelectedLabels',
  //       product_id: productDataRow.product_id,
  //       payload: { id },
  //     });
  //   } else {
  //     dispatch({
  //       type: 'uncheckSelectedLabels',
  //       product_id: productDataRow.product_id,
  //       payload: { id },
  //     });
  //   }
  // };

  // add option data
  // const addOptionData = (value) => {
  //   dispatch({
  //     type: 'addSelectedLabels',
  //     product_id: productDataRow.product_id,
  //     payload: { label_type: label_type, name: value },
  //   });
  // };

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
      (el) => el.name.toLowerCase() === value.toLowerCase()
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

  const inputWidth = '100%';
  return (
    <div className={styles.inputOption}>
      <div style={{ width: inputWidth }} className={styles.inputContainer}>
        <InputField
          reference={inputReference}
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
            className={styles.optionList}
            style={{ width: inputWidth }}
            onMouseEnter={handleSelectionMouseEnter}
            onMouseLeave={handleSelectionMouseOut}
            onClick={handleClickSelection}
          >
            {options.map((el) => {
              // Showing the option item in a list
              if (inputValue && !el.name.includes(inputValue)) return;
              return (
                <OptionRow
                  key={el.id}
                  id={el.id}
                  name={el.name}
                  checked={selectedOptions.includes(el.id)}
                  updateOptionData={updateOptionData}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className={styles.tagContainer}>
        {options.map((el) => {
          // Showing the tag plate
          if (selectedOptions.includes(el.id)) {
            return (
              <TagPlate
                key={el.id}
                id={el.id}
                name={el.name}
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
