import { useState } from 'react';
import styles from './InputSelection.module.css';
import { useRef } from 'react';
import OptionRow from './OptionRow';

const InputSelection = () => {
  let options = [
    { id: 1, label: 'pet brush', checked: true },
    { id: 2, label: 'pet mats', checked: false },
    { id: 3, label: 'clean up', checked: false },
  ];

  let inputWidth = '100%';

  const inputReference = useRef(null);
  const [inputFocus, setInputFocus] = useState(false);
  const [selectionMouseIn, setSelectionMouseIn] = useState(false);

  const handleFocus = (event) => {
    setInputFocus(true);
  };
  const handleFocusOut = (event) => {
    if (!selectionMouseIn) {
      setInputFocus(false);
    }
  };

  const handleSelectionMouseEnter = (event) => {
    setSelectionMouseIn(true);
  };
  const handleSelectionMouseOut = (event) => {
    setSelectionMouseIn(false);
  };
  const handleClickSelection = (event) => {
    event.preventDefault();
    inputReference.current.focus();
  };

  return (
    <div className={styles['inputSelection']}>
      <div style={{ width: inputWidth }} className={styles['textContainer']}>
        <input
          type="text"
          ref={inputReference}
          onFocus={handleFocus}
          onBlur={handleFocusOut}
        />
        {inputFocus && (
          <div
            className={styles['selection']}
            style={{ width: inputWidth }}
            onMouseEnter={handleSelectionMouseEnter}
            onMouseOut={handleSelectionMouseOut}
            onClick={handleClickSelection}
          >
            {options.map((el) => (
              <OptionRow key={el.id} id={el.id} label={el.label}></OptionRow>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSelection;
