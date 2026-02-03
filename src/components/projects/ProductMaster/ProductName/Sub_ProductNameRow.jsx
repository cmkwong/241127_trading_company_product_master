import { useRef, useEffect, useState } from 'react';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import styles from './Sub_ProductNameRow.module.css';
import { useMasterContext } from '../../../../store/MasterContext';
import { useProductContext } from '../../../../store/ProductContext';

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
  const {
    product_names = [],
    onChange,
    rowindex = 0,
    // setRowRef,
    // rowRef,
  } = props;
  const inputRef = useRef(null);

  const { productNameType } = useMasterContext();
  const { upsertProductPageData } = useProductContext();

  // Get the current product name data for this row, or use default values
  const currentProduct = product_names[rowindex] || { name: '', type: 1 };

  const handleProductNameChange = (ov, nv) => {
    upsertProductPageData('product_names', {
      id: currentProduct.id,
      name: nv,
    });
    // onChange(rowindex, 'name', value);
  };

  const handleTypeChange = (ov, nv) => {
    upsertProductPageData('product_names', {
      id: currentProduct.id,
      name_type_id: nv,
    });
  };

  return (
    <>
      <div ref={inputRef} className={styles.inputWrapper}>
        <Main_Suggest
          defaultSuggestions={defaultProductName}
          onChange={handleProductNameChange}
          defaultValue={currentProduct.name}
        />
      </div>
      <div className={styles.dropdownWrapper}>
        <Main_Dropdown
          defaultOptions={productNameType}
          defaultSelectedOption={currentProduct.name_type_id}
          onChange={handleTypeChange}
        />
      </div>
    </>
  );
};

export default Sub_ProductNameRow;
