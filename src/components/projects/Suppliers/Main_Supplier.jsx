import { useState, useEffect } from 'react';
import Main_InputContainer from '../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TagInputField from '../../common/InputOptions/Tagging/Main_TagInputField';
import styles from './Main_Supplier.module.css';
import Main_Suggest from '../../common/InputOptions/Suggest/Main_Suggest';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';

const Main_Supplier = () => {
  const defaultSupplier = ['Supplier A', 'Supplier B', 'Supplier C'];

  return (
    <Main_InputContainer label={'Supplier'}>
      <div className={styles.supplierInput}>
        <Main_Suggest defaultSuggestions={defaultSupplier} />
        <Main_Dropdown />
      </div>
    </Main_InputContainer>
  );
};

export default Main_Supplier;
