import InputList from '../common/InputOptions/Dropdown/Main_Dropdown';
import Main_OptionContainer from '../common/InputOptions/OptionContainer/Main_OptionContainer';
import InputTags from '../common/InputOptions/Suggest/Main_SuggestField';
import { useState } from 'react';
import styles from './ProductMaster.module.css';
import Main_DateSelector from '../common/InputOptions/Date/Main_DateSelector';
import Main_RemarkTextArea from '../common/InputOptions/Remark/Main_RemarkTextArea';
import Main_Pack from '../common/InputOptions/Packing/Main_Pack';

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

  const [date, setDate] = useState('2025-10-19');

  const handleChange = ({ options: nextOptions, selected: nextSelected }) => {
    setOptions(nextOptions);
    setSelectedId(nextSelected);
  };

  // State to manage the remarks
  const [remarks, setRemarks] = useState('');
  // Handler for remark changes
  const handleRemarksChange = ({ value, length }) => {
    setRemarks(value);
    console.log(`Remarks updated: ${value} (Length: ${length})`);
  };

  const dropdownOptions = ['OPP Type 1', 'OPP Type 2', 'OPP Type 3'];

  const handleAddPackData = (packData) => {
    console.log('Added Pack Data:', packData);
  };

  return (
    <>
      <Main_OptionContainer label={'Suggest Field'}>
        <InputTags defaultOptions={initialOptions} />
      </Main_OptionContainer>
      <Main_OptionContainer label={'List'}>
        <InputList
          defaultOptions={options}
          defaultSelectedOption={'2'}
          updateOptionData={setOptions} // control options array
          onChange={handleChange}
        />
      </Main_OptionContainer>
      <Main_OptionContainer label="Select date">
        <Main_DateSelector
          value={date}
          onChange={({ isoString }) => setDate(isoString)}
          // or use defaultValue for uncontrolled:
          // defaultValue={new Date()}
          minDate="2025-01-01"
          maxDate="2025-12-31"
          disableDate={(d) => d.getDay() === 0} // disable Sundays
          placeholder="Pick a date"
        />
      </Main_OptionContainer>
      <Main_OptionContainer label="Product Remarks">
        <Main_RemarkTextArea
          textareaId="product-remarks"
          value={remarks}
          onChange={handleRemarksChange}
          placeholder="Enter product remarks..."
          rows={5}
          maxLength={200}
          resize="vertical"
          ariaLabel="Product Remarks"
        />
      </Main_OptionContainer>
      <Main_OptionContainer label="Packing Details">
        <Main_Pack
          dropdownOptions={dropdownOptions}
          onAdd={handleAddPackData}
        />
      </Main_OptionContainer>
    </>
  );
};

export default ProductMaster;
