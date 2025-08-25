import Varient from './Varient';
import styles from './Varients.module.css';
// import drag_icon from '../assets/dragIndicator.svg';
// import close_icon from '../assets/close.svg';
// import InputOption from './InputOption/InputOption';

import { useCallback, useEffect, useState } from 'react';
import { makeComplexId } from '../utils/string';
import AddStackBtn from './common/AddStackBtn';
import { useProductDataRowContext } from '../store/ProductDataRowContext';
import { useProductDatasContext } from '../store/ProductDatasContext';

const Varients = () => {
  const { varientValues, dispatchProductDatas } = useProductDatasContext();
  const { product_id, varient_level } = useProductDataRowContext();

  // get the varient stack
  const getVarientStack = useCallback(
    (varient_level) => {
      return Object.values(varient_level)
        .sort((a, b) => a.level - b.level) // sorting from 0 level
        .map((vl) => {
          // getting the varient values
          // const selectedVarientValue = vl.values;
          return {
            id: vl.varient_id,
            varientName: vl.name,
            level: vl.level,
            selectedVarientValue: vl.values,
          };
        });
    },
    [varient_level]
  );

  // storing the varient key
  const [varientStack, setVarientStack] = useState(
    getVarientStack(varient_level)
  );

  // hide the add new varient option
  const [showAdd, setShowAdd] = useState(true);

  console.log('varient_level----: ', varient_level);
  console.log(
    'getVarientStack(varient_level).length----: ',
    getVarientStack(varient_level).length
  );

  // calculate the current level
  const calculateLevel = useCallback(() => {
    let maxLevel = 0;
    varientStack.forEach((el) => {
      if (maxLevel < el.level) {
        maxLevel = el.level;
      }
    });
    return maxLevel;
  }, [varientStack]);

  // useEffect(() => {
  //   console.log('use Effect running!!!!');
  //   setVarientStack(getVarientStack(varient_level));
  // }, [varient_level]);
  // console.log('new new varientStack: ', varientStack);

  // check the max length, if reach max, then hide the add button
  useEffect(() => {
    console.log(
      'getVarientStack(varient_level)************: ',
      getVarientStack(varient_level)
    );
    if (getVarientStack(varient_level).length >= 3) {
      setShowAdd(false);
    } else {
      setShowAdd(true);
    }
  }, [varient_level]);

  const addVarient = useCallback(
    (key, inputVarientName, level) => {
      // add the varient
      dispatchProductDatas({
        product_id,
        type: 'addProductVarient',
        payload: {
          key,
          name: inputVarientName,
          level: level,
        },
      });
      // check if need to add button
      // checkIfShowAddVarient();
    },
    [dispatchProductDatas, product_id]
  );

  // handle the click the Add button
  const handleAddClick = useCallback(() => {
    // random generated key
    const key = makeComplexId(8);
    const newLevel = calculateLevel() + 1;
    setVarientStack((prv) => [
      ...prv,
      {
        id: key,
        varientName: '',
        level: newLevel,
        selectedVarientValue: [],
      },
    ]);
    // update the context
    addVarient(key, '', newLevel);
  }, [calculateLevel, addVarient]);

  const removeStack = (id) => {
    // setVarientStack(varientStack.filter((el) => el.id !== id));
    // add the varient
    dispatchProductDatas({
      product_id,
      type: 'removeProductVarient',
      payload: {
        id,
      },
    });
    // // check if need to add button
    // checkIfShowAddVarient();
  };

  return (
    <>
      <div className={styles.container}>
        {getVarientStack(varient_level).map((el) => (
          <Varient
            key={el.id}
            id={el.id}
            level={el.level}
            varientName={el.varientName}
            selectedVarientValue={el.selectedVarientValue}
            removeStack={removeStack}
            product_id={product_id}
            varientValues={varientValues}
            dispatchProductDatas={dispatchProductDatas}
          />
        ))}
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
