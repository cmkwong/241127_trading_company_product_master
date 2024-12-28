import styles from './Varients.module.css';
import drag_icon from '../assets/dragIndicator.svg';
import close_icon from '../assets/close.svg';
import InputOption from './InputOption';
import { useState } from 'react';
import { useProductDatasContext } from '../store/ProductDatasContext';
import { useProductDataRowContext } from '../store/ProductDataRowContext';

const Varient = (props) => {
  const {
    id,
    level,
    varientName,
    selectedVarientValue,
    product_id,
    removeStack,
  } = props;
  const { varientValues, dispatchProductDatas } = useProductDatasContext();

  const { varient_level, varient_value } = useProductDataRowContext();

  const [inputVarientName, setInputVarientName] = useState('');

  const addVarient = (value, level) => {
    console.log(inputVarientName, value, level);
    if (!inputVarientName) return;
    dispatchProductDatas({
      type: 'addVarient',
      product_id,
      payload: {
        value: inputVarientName,
        level,
      },
    });
  };

  const updateVarientValue = (varient_value_id, checked) => {
    console.log('updateVarientValue', varient_value_id, checked);
    if (checked) {
      dispatchProductDatas({
        product_id,
        type: 'checkProductVarientValue',
        payload: {
          varient_id: id,
          varient_value_id,
        },
      });
    } else {
      dispatchProductDatas({
        product_id,
        type: 'uncheckProductVarientValue',
        payload: {
          varient_id: id,
          varient_value_id,
        },
      });
    }
  };

  const addVarientValue = (varientValue) => {
    dispatchProductDatas({
      product_id,
      type: 'addProductVarientValue',
      payload: { varient_id: id, varientValue },
    });
  };

  return (
    <div className={styles.upperSide}>
      <img className={styles.drag} src={drag_icon} alt="drag" />
      <div className={styles.edit}>
        <input
          className={styles.inputvarient}
          defaultValue={varientName}
          onChange={(event) => setInputVarientName(event.target.value)}
        />
        {console.log('varientValues: ', varientValues)}
        {console.log('selectedVarientValue: ', selectedVarientValue)}
        <InputOption
          options={varientValues}
          selectedOptions={varient_value.map((el) => {
            if (el.varient_id === id) {
              return el.varient_value_id;
            }
          })}
          updateOptionData={updateVarientValue}
          addOptionData={addVarientValue}
        />
      </div>
      <div onClick={() => removeStack(id)}>
        <img className={styles.close} src={close_icon} alt="X" />
      </div>
    </div>
  );
};

export default Varient;
