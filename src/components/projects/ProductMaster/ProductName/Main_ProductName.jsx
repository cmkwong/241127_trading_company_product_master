import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import ProductNameRow from './ProductNameRow';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';

const Main_ProductName = () => {
  const { pageData } = useSavePageData();

  // Create a component that will be cloned by ControlRowBtn
  // It will receive rowIndex as a prop from ControlRowBtn
  const ProductNameRowWrapper = ({ rowIndex = -1 }) => {
    // Only pass initial values to the first row
    if (rowIndex === 0) {
      return (
        <ProductNameRow
          initialProductName={pageData.productName || ''}
          initialProductId={pageData.productId || ''}
        />
      );
    }
    // For other rows, don't pass initial values
    return <ProductNameRow />;
  };

  return (
    <>
      <Main_InputContainer label={'Product Name'}>
        <ControlRowBtn>
          <ProductNameRowWrapper />
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};
export default Main_ProductName;
