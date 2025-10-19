import InputList from '../common/InputOptions/Main_Dropdown';
import InputOptionContainer from '../common/InputOptions/OptionContainer/Main_OptionContainer';
import InputTags from '../common/InputOptions/Main_SuggestField';
import { useState } from 'react';
import styles from './ProductMaster.module.css';

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
const ProductMaster = () => {
  const [options, setOptions] = useState(initialOptions);
  const [selectedId, setSelectedId] = useState('2');

  const handleChange = ({ options: nextOptions, selected: nextSelected }) => {
    setOptions(nextOptions);
    setSelectedId(nextSelected);
  };
  return (
    <>
      <InputOptionContainer label={'Suggest Field'}>
        <InputTags defaultOptions={initialOptions} />
      </InputOptionContainer>
      <InputOptionContainer label={'List'}>
        <InputList
          defaultOptions={options}
          defaultSelectedOption={'2'}
          updateOptionData={setOptions} // control options array
          onChange={handleChange}
        />
      </InputOptionContainer>
    </>
  );
};

export default ProductMaster;
