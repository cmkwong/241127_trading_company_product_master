import { useState, useRef, useEffect } from 'react';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';

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

// Independent ProductNameRow component with its own state
const ProductNameRow = ({ initialProductName = '', initialProductId = '' }) => {
  const { updateData } = useSavePageData();

  // Determine if this is the first row based on whether initial values were provided
  const isFirstRow = initialProductName !== '' || initialProductId !== '';

  // Use refs to track current values without causing re-renders
  const productNameRef = useRef(initialProductName);
  const productIdRef = useRef(initialProductId);

  // Debounce timer for updating global state
  const timerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleProductNameChange = ({ value }) => {
    const nameValue =
      typeof value === 'object' && value.value ? value.value : value;
    productNameRef.current = nameValue;

    // Update the global state if this is the first row, with debounce
    if (isFirstRow) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        updateData('productName', nameValue);
      }, 300); // 300ms debounce
    }
  };

  const handleProductIdChange = (value) => {
    productIdRef.current = value;

    // Update the global state if this is the first row, with debounce
    if (isFirstRow) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        updateData('productId', value);
      }, 300); // 300ms debounce
    }
  };

  return (
    <>
      <Main_Suggest
        defaultSuggestions={defaultProductName}
        defaultValue={initialProductName}
        onChange={handleProductNameChange}
      />
      <Main_TextField
        placeholder={'Product ID'}
        defaultValue={initialProductId}
        onChange={handleProductIdChange}
      />
    </>
  );
};

export default ProductNameRow;
