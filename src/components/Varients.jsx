import styles from './Varients.module.css';
import drag_icon from '../assets/dragIndicator.svg';
import add_icon from '../assets/roundedAdd.svg';
import close_icon from '../assets/close.svg';
import InputOption from './InputOption';

import { makeComplexId } from '../utils/string';

import { useEffect, useState } from 'react';

const Varient = (props) => {
  let optionData = [
    { id: 1, label: 'pet brush', checked: true },
    { id: 2, label: 'pet mats', checked: false },
    { id: 3, label: 'clean up', checked: false },
    { id: 4, label: 'clipper', checked: false },
    { id: 5, label: 'shower', checked: false },
    { id: 6, label: 'headwears', checked: true },
    { id: 7, label: 'tops', checked: false },
    { id: 8, label: 'Pet Bowl', checked: false },
    { id: 9, label: 'Drinking Tools', checked: false },
    { id: 10, label: 'Feeding Tools', checked: false },
    { id: 11, label: 'Glasses', checked: false },
    { id: 12, label: 'collar', checked: false },
    { id: 13, label: 'leash', checked: false },
  ];

  let { id, removeStack } = props;

  return (
    <div className={styles.upperSide}>
      <img className={styles.drag} src={drag_icon} alt="drag" />
      <div className={styles.edit}>
        <input className={styles.inputvarient} />
        <InputOption data={optionData} />
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
