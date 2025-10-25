import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_Pack.module.css';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../common/InputOptions/TextField/Main_TextField';
import ControlRowBtn from '../ControlRowBtn';
import Main_InputContainer from '../../common/InputOptions/InputContainer/Main_InputContainer';

const Main_Pack = ({ dropdownOptions, onAdd }) => {
  const [packRows, setPackRows] = useState([
    {
      id: Math.random().toString(36).slice(2, 8),
      length: '',
      width: '',
      height: '',
      quantity: '',
      weight: '',
      oppType: '',
    },
  ]);

  const handleInputChange = (rowId, field, value) => {
    setPackRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleDropdownChange = (rowId, { selected }) => {
    setPackRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId ? { ...row, oppType: selected } : row
      )
    );
  };

  return (
    <Main_InputContainer label={'Packing'}>
      {packRows.map((row) => (
        <ControlRowBtn key={row.id}>
          <div className={styles.inputsContainer}>
            <Main_TextField
              placeholder="L"
              value={row.length}
              onChange={(value) => handleInputChange(row.id, 'length', value)}
              className={styles.packingField}
            />
            <Main_TextField
              placeholder="W"
              value={row.width}
              onChange={(value) => handleInputChange(row.id, 'width', value)}
              className={styles.packingField}
            />
            <Main_TextField
              placeholder="H"
              value={row.height}
              onChange={(value) => handleInputChange(row.id, 'height', value)}
              className={styles.packingField}
            />
            <Main_TextField
              placeholder="Qty"
              value={row.quantity}
              onChange={(value) => handleInputChange(row.id, 'quantity', value)}
              className={styles.packingField}
            />
            <Main_TextField
              placeholder="kg"
              value={row.weight}
              onChange={(value) => handleInputChange(row.id, 'weight', value)}
              className={styles.packingField}
            />
            <Main_Dropdown
              options={dropdownOptions}
              selectedOptions={row.oppType}
              onChange={(selected) => handleDropdownChange(row.id, selected)}
              label="Package Type"
            />
          </div>
        </ControlRowBtn>
      ))}
    </Main_InputContainer>
  );
};

Main_Pack.propTypes = {
  dropdownOptions: PropTypes.arrayOf(PropTypes.string).isRequired, // Dropdown options
  onAdd: PropTypes.func, // Callback for adding pack data
};

export default Main_Pack;
