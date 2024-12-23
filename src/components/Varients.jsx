import styles from './Varients.module.css';
import drag_icon from '../assets/dragIndicator.svg';
import close_icon from '../assets/close.svg';
import InputOption from './InputOption';

import { makeComplexId } from '../utils/string';

import { useEffect, useState } from 'react';
import AddStackBtn from './common/AddStackBtn';
import { useProductDataRowContext } from '../store/ProductDataRowContext';

const Varient = (props) => {
  const { varientValues } = useProductDataRowContext();
  let options = [
    { id: 1, label: 'pet brush' },
    { id: 2, label: 'pet mats' },
    { id: 3, label: 'clean up' },
    { id: 4, label: 'clipper' },
    { id: 5, label: 'shower' },
    { id: 6, label: 'headwears' },
    { id: 7, label: 'tops' },
    { id: 8, label: 'Pet Bowl' },
    { id: 9, label: 'Drinking Tools' },
    { id: 10, label: 'Feeding Tools' },
    { id: 11, label: 'Glasses' },
    { id: 12, label: 'collar' },
    { id: 13, label: 'leash' },
  ];
  let selectedOptions = [6, 1, 7, 12];

  let { id, removeStack } = props;

  return (
    <div className={styles.upperSide}>
      <img className={styles.drag} src={drag_icon} alt="drag" />
      <div className={styles.edit}>
        <input className={styles.inputvarient} />
        <InputOption
          selectedOptions={selectedOptions}
          options={varientValues}
        />
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
    <>
      <div className={styles.container}>
        {varientStack.map((el) => {
          return <Varient key={el} id={el} removeStack={removeStack} />;
        })}
      </div>
      {showAdd && (
        <AddStackBtn
          txt={'Add Another Varients'}
          handleClick={handleAddClick}
        />
      )}
    </>
  );
};

export default Varients;
