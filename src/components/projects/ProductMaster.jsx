import InputList from '../common/InputOptions/Dropdown/Main_Dropdown';
import Main_InputContainer from '../common/InputOptions/InputContainer/Main_InputContainer';
import { useState, useEffect } from 'react';
import Main_DateSelector from '../common/InputOptions/Date/Main_DateSelector';
import Main_RemarkTextArea from '../common/InputOptions/Textarea/Main_TextArea';
import Main_Pack from './Packing/Main_Pack';
import styles from './ProductMaster.module.css';
import Main_Suggest from '../common/InputOptions/Suggest/Main_Suggest';
import Main_ProductName from './ProductName/Main_ProductName';
import Main_Category from './Categories/Main_Category';
import Main_Supplier from './Suppliers/Main_Supplier';
import Main_ProductLink from './ProductLink/Main_ProductLink';

const ProductMaster = () => {
  const [date, setDate] = useState('2025-10-19');

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

  // -- suggestion
  // State for suggest input
  const [inputSuggestValue, setInputSuggestValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const cities = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose',
    'Austin',
    'Jacksonville',
    'Fort Worth',
    'Columbus',
    'San Francisco',
  ];

  // Update suggestions based on input
  useEffect(() => {
    if (inputSuggestValue.trim() === '') {
      setSuggestions([]);
    } else {
      const filtered = cities.filter((city) =>
        city.toLowerCase().includes(inputSuggestValue.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [inputSuggestValue]);

  // Suggest input change handler
  const handleSuggestChange = ({ value }) => {
    setInputSuggestValue(value);
    console.log('Suggest input value:', value);
  };

  return (
    <>
      <Main_ProductName />
      <Main_Category />
      <Main_Supplier />
      <Main_ProductLink />
      <Main_InputContainer label="Select date">
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
      </Main_InputContainer>
      <Main_InputContainer label="Product Remarks">
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
      </Main_InputContainer>
      <Main_InputContainer label="Packing Details">
        <Main_Pack
          dropdownOptions={dropdownOptions}
          onAdd={handleAddPackData}
        />
      </Main_InputContainer>
      <Main_InputContainer label="Search for a city">
        <Main_Suggest
          label="Hello"
          inputId="suggest-city"
          value={inputSuggestValue}
          suggestions={suggestions}
          onChange={handleSuggestChange}
          placeholder="Type a city name..."
        />
      </Main_InputContainer>
    </>
  );
};

export default ProductMaster;
