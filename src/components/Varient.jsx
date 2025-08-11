import styles from './Varients.module.css';
import drag_icon from '../assets/dragIndicator.svg';
import close_icon from '../assets/close.svg';
import InputOption from './InputOptions/InputOption';
import { useState } from 'react';
// import { useProductDatasContext } from '../store/ProductDatasContext';
// import { useProductDataRowContext } from '../store/ProductDataRowContext';

const Varient = (props) => {
  const {
    id,
    level,
    varientName,
    selectedVarientValue,
    varient_value,
    product_id,
    removeStack,
    varientValues,
    dispatchProductDatas,
  } = props;
  // const { varientValues } = useProductDatasContext();

  // const { varient_level, varient_value } = useProductDataRowContext();

  const [inputVarientName, setInputVarientName] = useState('');

  const updateVarientValue = (varient_value_id, checked) => {
    // update the varient values
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
        <InputOption
          options={varientValues}
          selectedOptions={selectedVarientValue}
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
