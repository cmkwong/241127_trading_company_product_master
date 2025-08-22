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
  const getVarientStack = useCallback((varient_level) => {
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
  }, []);

  // storing the varient key
  const [varientStack, setVarientStack] = useState(
    getVarientStack(varient_level)
  );

  // useEffect(() => {
  //   console.log('use Effect running!!!!');
  //   setVarientStack(getVarientStack(varient_level));
  // }, [varient_level]);
  // console.log('new new varientStack: ', varientStack);

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

  // handle the click the Add button
  const handleAddClick = useCallback(() => {
    // random generated key
    const key = makeComplexId(8);
    setVarientStack((prv) => [
      ...prv,
      {
        id: key,
        varientName: '',
        level: varientStack.length + 1,
        selectedVarientValue: [],
      },
    ]);
    // update the context
    addVarient(key, '', calculateLevel() + 1);
    console.log('added varient!!!!!');
  }, []);

  const addVarient = useCallback((key, inputVarientName, level) => {
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
  }, []);

  const removeStack = useCallback((key) => {
    setVarientStack(varientStack.filter((el) => el.id !== key));
  }, []);

  // calculate the current level
  const calculateLevel = () => {
    let maxLevel = 0;
    varientStack.map((el) => {
      if (maxLevel < el.level) {
        maxLevel = el.level;
      }
      return maxLevel;
    });
    return maxLevel;
  };

  return (
    <>
      <div className={styles.container}>
        {getVarientStack(varient_level).map((el) => {
          // random generated key
          const key = makeComplexId(8);
          return (
            <Varient
              key={key}
              id={el.id}
              level={el.level}
              varientName={el.varientName}
              selectedVarientValue={el.selectedVarientValue}
              removeStack={removeStack}
              product_id={product_id}
              varientValues={varientValues}
              dispatchProductDatas={dispatchProductDatas}
            />
          );
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
