import InputList from '../common/InputOptions/Dropdown/Main_Dropdown';
import Main_InputContainer from '../common/InputOptions/InputContainer/Main_InputContainer';
import { useState, useEffect } from 'react';
import Main_DateSelector from '../common/InputOptions/Date/Main_DateSelector';

import Main_Pack from './Packing/Main_Pack';
import styles from './ProductMaster.module.css';
import Main_Suggest from '../common/InputOptions/Suggest/Main_Suggest';
import Main_ProductName from './ProductName/Main_ProductName';
import Main_Category from './Categories/Main_Category';
import Main_Supplier from './Suppliers/Main_Supplier';
import Main_ProductLink from './ProductLink/Main_ProductLink';
import Main_AlibabaLink from './AlibabaLink/Main_AlibabaLink';
import Main_Remark from './Remarks/Main_Remark';
import Main_ProductIcon from './ProductIcon/Main_ProductIcon';

const ProductMaster = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.inputSide}>
          <Main_ProductName />
          <Main_Category />
          <Main_Supplier />
          <Main_ProductLink />
          <Main_AlibabaLink />
          <Main_Pack />
          <Main_Remark />
        </div>
        <div className={styles.icon}>
          <Main_ProductIcon />
        </div>
      </div>
    </>
  );
};

export default ProductMaster;
