import styles from './Main_AlibabaLink.module.css';
import Main_InputContainer from '../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../common/InputOptions/TextField/Main_TextField';
import ControlRowBtn from '../ControlRowBtn';

const Main_AlibabaLink = () => {
  return (
    <>
      <Main_InputContainer label={'Alibaba'}>
        <ControlRowBtn>
          <div className={styles.inputContainer}>
            <div className={styles.idField}>
              <Main_TextField placeholder={'Enter Alibaba ID ...'} />
            </div>
            <div className={styles.linkField}>
              <Main_TextField placeholder={'Enter Link ...'} />
            </div>
          </div>
        </ControlRowBtn>
      </Main_InputContainer>
    </>
  );
};

export default Main_AlibabaLink;
