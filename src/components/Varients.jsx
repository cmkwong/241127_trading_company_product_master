import styles from './Varients.module.css';
import drag_icon from '../assets/dragIndicator.svg';
import add_icon from '../assets/roundedAdd.svg';
import close_icon from '../assets/close.svg';
import InputOption from './InputOption';

import { makeComplexId } from '../utils/string';

import { useEffect, useState } from 'react';

const Varient = (props) => {
  let { id, removeStack } = props;

  return (
    <div className={styles.upperSide}>
      <img className={styles.drag} src={drag_icon} alt="drag" />
      <div className={styles.edit}>
        <input className={styles.inputvarient} />
        <InputOption />
      </div>
      <div onClick={() => removeStack(id)}>
        <img className={styles.close} src={close_icon} alt="X" />
      </div>
    </div>
  );
};

const Varients = () => {
  // storing the varient key
  const [varientStack, setVarientStack] = useState([]);

  // hide the add new varient option
  const [showAdd, setShowAdd] = useState(true);

  // check the max length, if reach max, then hide the add button
  useEffect(() => {
    if (varientStack.length >= 3) {
      setShowAdd(false);
    } else {
      setShowAdd(true);
    }
  }, [varientStack]);

  const handleAddClick = () => {
    const key = makeComplexId(8);
    setVarientStack((prv) => [...prv, key]);
  };

  const removeStack = (key) => {
    setVarientStack(varientStack.filter((el) => el !== key));
  };

  return (
    <div className={styles.container}>
      {varientStack.map((el) => {
        return <Varient key={el} id={el} removeStack={removeStack} />;
      })}
      {showAdd && (
        <div className={styles.addVarient} onClick={handleAddClick}>
          <img src={add_icon} alt="add" />
          <p>Add another option</p>
        </div>
      )}
    </div>
  );
};

export default Varients;
