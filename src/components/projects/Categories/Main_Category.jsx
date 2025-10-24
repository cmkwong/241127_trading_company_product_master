import { useState, useEffect } from 'react';
import Main_InputContainer from '../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TagInputField from '../../common/InputOptions/Tagging/Main_TagInputField';
import styles from './Main_Category.module.css';

const Main_Category = () => {
  const initialOptions = [
    {
      id: 1,
      name: 'Cat Toy',
    },
    {
      id: 2,
      name: 'Dog Toy',
    },
  ];
  const [options, setOptions] = useState(initialOptions);

  return (
    <Main_InputContainer label={'Category'}>
      <Main_TagInputField
        defaultOptions={initialOptions}
        // defaultSelectedOption={'2'}
      />
    </Main_InputContainer>
  );
};

export default Main_Category;
