import Main_DateSelector from '../../common/InputOptions/Date/Main_DateSelector';
import Main_ImageUpload from '../../common/InputOptions/ImageUploads/Main_ImageUpload';
import Main_InputContainer from '../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextArea from '../../common/InputOptions/Textarea/Main_TextArea';
import Main_TextField from '../../common/InputOptions/TextField/Main_TextField';
import ControlRowBtn from '../ControlRowBtn';
import styles from './Main_ProductLink.module.css';

const Main_ProductLink = () => {
  return (
    <>
      <Main_InputContainer label="Product Links">
        <ControlRowBtn>
          <div className={styles.rowContainer}>
            <Main_TextField label="link" />
            <ControlRowBtn>
              <Main_ImageUpload />
              <Main_TextArea label={'Remark'} />
              <Main_DateSelector />
            </ControlRowBtn>
          </div>
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};

export default Main_ProductLink;
