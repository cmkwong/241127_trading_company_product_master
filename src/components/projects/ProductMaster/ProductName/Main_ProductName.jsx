import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import ControlRowBtn from '../../../common/ControlRowBtn';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';

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

const Main_ProductName = () => {
  const { pageData, updateData } = useSavePageData();

  const handleProductNameChange = (value) => {
    updateData('productName', value);
  };

  return (
    <>
      <Main_InputContainer label={'Product Name'}>
        <ControlRowBtn>
          <Main_Suggest
            defaultSuggestions={defaultProductName}
            defaultValue={pageData.productName || ''}
            onChange={handleProductNameChange}
          />
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};

export default Main_ProductName;
