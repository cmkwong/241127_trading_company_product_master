import { useState } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import styles from './Main_Supplier.module.css';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';
import SupplierRow from './SupplierRow';
import ControlRowBtn from '../../../common/ControlRowBtn';

const Main_Supplier = () => {
  return (
    <Main_InputContainer label={'Supplier'}>
      <ControlRowBtn>
        <SupplierRow />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Supplier;
