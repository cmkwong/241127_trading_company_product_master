import styles from './Varients.module.css';
import drag_icon from '../../assets/dragIndicator.svg';
import close_icon from '../../assets/close.svg';
import InputOption from '../InputOptions/InputOption';
import { useState } from 'react';
// import { useProductDatasContext } from '../store/ProductDatasContext';
// import { useProductDataRowContext } from '../store/ProductDataRowContext';

const Varient = (props) => {
  const {
    id,
    level,
    varientName,
    selectedVarientValue,
    product_id,
    removeStack,
    varientValues,
    dispatchProductDatas,
  } = props;

  const [inputVarientName, setInputVarientName] = useState('');

  const updateVarientValue_checked = (varient_value_id, checked) => {
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

  // varient value being added
  const addVarientValue = (varientValue) => {
    dispatchProductDatas({
      product_id,
      type: 'addProductVarientValue',
      payload: { varient_id: id, varientValue },
    });
  };

  // Varient name input-field being changed
  const changeInputVarient = (event) => {
    setInputVarientName(event.target.value);
    dispatchProductDatas({
      product_id,
      type: 'updateProductVarientName',
      payload: { varient_id: id, new_name: inputVarientName },
    });
  };

  return (
    <div className={styles.upperSide}>
      <img className={styles.drag} src={drag_icon} alt="drag" />
      <div className={styles.edit}>
        <input
          className={styles.inputvarient}
          defaultValue={varientName}
          onChange={changeInputVarient}
        />
        <InputOption
          options={varientValues}
          selectedOptions={selectedVarientValue}
          updateOptionData={updateVarientValue_checked}
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
