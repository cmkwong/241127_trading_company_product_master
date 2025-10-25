import styles from './Main_ProductLink.module.css';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductLinkRow from './Sub_ProductLinkRow';

const Main_ProductLink = () => {
  return (
    <>
      <Main_InputContainer label="Product Links">
        <ControlRowBtn>
          <Sub_ProductLinkRow />
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};

export default Main_ProductLink;
