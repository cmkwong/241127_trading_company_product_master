import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Sub_ProductNameRow from './Sub_ProductNameRow';
import { useSavePageData } from '../../../common/SavePage/Main_SavePage';

const Main_ProductName = () => {
  const { pageData } = useSavePageData();

  return (
    <>
      <Main_InputContainer label={'Product Name'}>
        <ControlRowBtn>
          <Sub_ProductNameRow />
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};
export default Main_ProductName;
