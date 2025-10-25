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

const ProductMaster = () => {
  const [date, setDate] = useState('2025-10-19');

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
      <Main_AlibabaLink />
      <Main_Pack />
      <Main_Remark />
    </>
  );
};

export default ProductMaster;
