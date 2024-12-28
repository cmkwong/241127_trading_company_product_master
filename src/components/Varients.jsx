import styles from './Varients.module.css';
import drag_icon from '../assets/dragIndicator.svg';
import close_icon from '../assets/close.svg';
import InputOption from './InputOption';
import Varient from './Varient';

import { makeComplexId } from '../utils/string';
import { useEffect, useState } from 'react';
import AddStackBtn from './common/AddStackBtn';
import { useProductDataRowContext } from '../store/ProductDataRowContext';
import { useProductDatasContext } from '../store/ProductDatasContext';

const Varients = () => {
  const { varientValues, dispatchProductDatas } = useProductDatasContext();
  const { product_id, varient_level, varient_value } =
    useProductDataRowContext();

  // template for varient stack
  const varientStackTemplate = (
    id,
    varientName,
    level,
    selectedVarientValue
  ) => {
    return { id, varientName, level, selectedVarientValue };
  };

  // get the varient stack
  const getVarientStack = (varient_level, varient_value) => {
    return varient_level
      .sort((a, b) => a.level - b.level) // sorting from 0 level
      .map((vl) => {
        // getting the varient values
        const selectedVarientValue = varient_value
          .filter((vv) => vv.varient_id === vl.varient_id)
          .map((el) => el.varient_value_id);
        return varientStackTemplate(
          vl.varient_id,
          vl.name,
          vl.level,
          selectedVarientValue
        );
      });
  };

  // storing the varient key
  const [varientStack, setVarientStack] = useState(
    getVarientStack(varient_level, varient_value)
  );

  useEffect(() => {
    setVarientStack(getVarientStack(varient_level, varient_value));
  }, [varient_level, varient_value]);

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
    setVarientStack((prv) => [
      ...prv,
      varientStackTemplate(key, '', varientStack.length + 1, []),
    ]);
  };

  const removeStack = (key) => {
    setVarientStack(varientStack.filter((el) => el.id !== key));
  };

  return (
    <>
      <div className={styles.container}>
        {varientStack.map((el) => (
          <Varient
            key={el.id}
            id={el.id}
            level={el.level}
            varientName={el.varientName}
            selectedVarientValue={el.selectedVarientValue}
            removeStack={removeStack}
            product_id={product_id}
            varient_value={varient_value}
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
