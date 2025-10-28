import { useState } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import styles from './Main_Customization.module.css';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';
import SupplierRow from './Sub_CustomizationRow';
import ControlRowBtn from '../../../common/ControlRowBtn';

const Main_Customization = () => {
  return (
    <Main_InputContainer label={'Customization'}>
      <ControlRowBtn>
        <SupplierRow />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Customization;
