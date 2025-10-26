import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import ProductNameRow from './ProductNameRow';

const Main_ProductName = () => {
  return (
    <>
      <Main_InputContainer label={'Product Name'}>
        <ControlRowBtn>
          <ProductNameRow />
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};

export default Main_ProductName;
