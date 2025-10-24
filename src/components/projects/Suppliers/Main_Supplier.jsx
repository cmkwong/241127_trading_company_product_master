import { useState } from 'react';
import Main_InputContainer from '../../common/InputOptions/InputContainer/Main_InputContainer';
import styles from './Main_Supplier.module.css';
import Main_Suggest from '../../common/InputOptions/Suggest/Main_Suggest';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';
import ControlRowBtn from '../ControlRowBtn';

const Main_Supplier = () => {
  const defaultSupplier = ['Supplier A', 'Supplier B', 'Supplier C'];
  const dropdownOptions = ['Option 1', 'Option 2', 'Option 3'];

  return (
    <Main_InputContainer label={'Supplier'}>
      <ControlRowBtn>
        <Main_Suggest defaultSuggestions={defaultSupplier} />
        <Main_Dropdown options={dropdownOptions} />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Supplier;
