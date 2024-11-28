import { useState } from 'react';
import styles from './InputOption.module.css';
import { useRef } from 'react';
import OptionRow from './OptionRow';

const InputOption = () => {
  let _options = [
    { id: 1, label: 'pet brush', checked: true },
    { id: 2, label: 'pet mats', checked: false },
    { id: 3, label: 'clean up', checked: false },
    { id: 4, label: 'clipper', checked: false },
    { id: 5, label: 'shower', checked: false },
    { id: 6, label: 'headwears', checked: true },
    { id: 7, label: 'tops', checked: false },
  ];

  const [options, setOptions] = useState(_options);

  let inputWidth = '100%';

  const inputReference = useRef(null);
  const [inputFocus, setInputFocus] = useState(false);
  const [selectionMouseIn, setSelectionMouseIn] = useState(false);

  // handle layout
  const handleFocus = (event) => {
    setInputFocus(true);
  };
  const handleFocusOut = (event) => {
    if (!selectionMouseIn) {
      setInputFocus(false);
    }
  };

  const handleSelectionMouseEnter = (event) => {
    console.log('enter');
    setSelectionMouseIn(true);
  };
  const handleSelectionMouseOut = (event) => {
    console.log('out');
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

  return (
    <div className={styles['inputOption']}>
      <div style={{ width: inputWidth }} className={styles['inputContainer']}>
        <input
          className={styles['inputField']}
          type="text"
          ref={inputReference}
          onFocus={handleFocus}
          onBlur={handleFocusOut}
        />
        {inputFocus && (
          <div
            className={styles['optionList']}
            style={{ width: inputWidth }}
            onMouseEnter={handleSelectionMouseEnter}
            onMouseLeave={handleSelectionMouseOut}
            onClick={handleClickSelection}
          >
            {options.map((el) => (
              <OptionRow
                key={el.id}
                id={el.id}
                label={el.label}
                checked={el.checked}
                updateOptionData={updateOptionData}
              ></OptionRow>
            ))}
          </div>
        )}
      </div>
      <div>hello</div>
    </div>
  );
};

export default InputOption;
