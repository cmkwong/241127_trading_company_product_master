import PropTypes from 'prop-types';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_PackRow from './Sub_PackRow';

const Main_Pack = () => {
  return (
    <Main_InputContainer label={'Packing'}>
      <ControlRowBtn>
        <Sub_PackRow />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_Pack;
