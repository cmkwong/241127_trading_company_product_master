import styles from './Varients.module.css';
import drag_icon from '../assets/dragIndicator.svg';
import add_icon from '../assets/roundedAdd.svg';
import close_icon from '../assets/close.svg';
import InputOption from './InputOption';

import { makeComplexId } from '../utils/string';

import { useCallback, useState } from 'react';

const Varient = (props) => {
  let { id, removeStack } = props;

  return (
    <div className={styles.upperSide}>
      <img className={styles.drag} src={drag_icon} alt="drag" />
      <div className={styles.edit}>
        <input className={styles.inputvarient} />
        <InputOption />
      </div>
      <div id={id} onClick={(event) => removeStack('ghjk')}>
        <img className={styles.close} src={close_icon} alt="X" />
      </div>
    </div>
  );
};

const Varients = () => {
  const [varientStack, setVarientStack] = useState([]);

  const handleAddClick = () => {
    let key = makeComplexId(8);
    setVarientStack((prv) => {
      return [...prv, <Varient key={key} id={key} removeStack={removeStack} />];
    });
  };

  const removeStack = (key) => {
    console.log(key);
    console.log(varientStack.filter((el) => el.key !== key));
    console.log(
      varientStack.map((el) => {
        console.log('Is Same? ', el.key, key);
        if (el.key !== key) {
          return el;
        }
      })
    );
    // setVarientStack(varientStack.filter((el) => el.key !== key));
  };

  return (
    <div className={styles.container}>
      {varientStack}
      <div className={styles.addVarient} onClick={handleAddClick}>
        <img src={add_icon} alt="add" />
        <p>Add another option</p>
      </div>
    </div>
  );
};

export default Varients;
