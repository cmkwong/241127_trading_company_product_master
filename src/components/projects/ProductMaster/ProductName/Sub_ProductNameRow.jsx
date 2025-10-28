import { useRef, useEffect } from 'react';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';

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

// Independent Sub_ProductNameRow component with its own state
const Sub_ProductNameRow = () => {
  const { updateData } = useSavePageData();

  const handleProductNameChange = ({ value }) => {
    updateData('productName', value);
  };

  return (
    <>
      <Main_Suggest
        defaultSuggestions={defaultProductName}
        onChange={handleProductNameChange}
      />
      <Main_Dropdown defaultOptions={['Option A', 'Option B']} />
    </>
  );
};

export default Sub_ProductNameRow;
