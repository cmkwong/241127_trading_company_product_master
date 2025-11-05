import { useRef, useEffect, useState } from 'react';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import { mockProductNameType } from '../../../../datas/Options/ProductOptions';
import styles from './Sub_ProductNameRow.module.css';

const defaultProductName = [
  'Elizabeth Collar Pet Grooming Shield Anti Bite Collar Dog Necklace Cat Neck Shame Collar',
  'High Quality Wholesale Pet Dog Toys Pet Plush Toys Dog Chew Toys with Rope for dog animals',
  'Waterproof Foldable Seat Protector Hammock Pets Dog Car Seat Cover Pet/dog Back Cover for Car Rear Back Seat',
  'Pet Water Dispenser Automatic Pet Drinking Feeder Cat Water Fountain LED Water Level Display Cat Products',
  'Hot sale and high quality Pet plush toy simulation sounding duck dog toy large molar tooth cleaning toy',
  'Durable Plush Eggplant Cat Chew Toy with Funny Expression and Squeaker Sound Long-Lasting Teething Toy',
  'Hot Selling High Quality USB Interactive Cat Toys Classic Style Laser Pen Cat Teaser Exerciser Training Toy Wholesale Price',
  'Durable Convenient Stainless Steel Blade Free Nail Clipper No More Over Cutting Nail Trimmers',
];

// The Sub_ProductNameRow component that receives props including rowindex from ControlRowBtn
const Sub_ProductNameRow = (props) => {
  // Extract the props we need and ignore the rest to prevent passing them to DOM elements
  const { productNames = [], onChange, rowindex = 0, setRowRef } = props;
  const inputRef = useRef(null);

  // Get the current product name data for this row, or use default values
  const currentProduct = productNames[rowindex] || { name: '', type: 1 };

  // Register this row's ref with the parent component
  useEffect(() => {
    if (setRowRef && inputRef.current) {
      setRowRef(rowindex, {
        focus: () => {
          if (inputRef.current) {
            // Use the underlying input element's focus method
            const inputElement = inputRef.current.querySelector('input');
            if (inputElement) {
              inputElement.focus();
            }
          }
        },
      });
    }
  }, [rowindex, setRowRef]);

  const handleProductNameChange = ({ value }) => {
    onChange(rowindex, 'name', value);
  };

  const handleTypeChange = ({ selected }) => {
    onChange(rowindex, 'type', selected);
  };

  return (
    <>
      <div ref={inputRef} className={styles.inputWrapper}>
        <Main_Suggest
          defaultSuggestions={defaultProductName}
          onChange={handleProductNameChange}
          value={currentProduct.name}
        />
      </div>
      <div className={styles.dropdownWrapper}>
        <Main_Dropdown
          defaultOptions={mockProductNameType}
          selectedOptions={currentProduct.type}
          onChange={handleTypeChange}
        />
      </div>
    </>
  );
};

export default Sub_ProductNameRow;
