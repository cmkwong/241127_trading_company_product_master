import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_Pack.module.css';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';
import ControlRowBtn from '../ControlRowBtn';

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

  const handleAddClick = () => {
    setPackRows((prevRows) => [
      ...prevRows,
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
  };

  const handleRemoveRow = (rowId) => {
    // Don't remove the last row
    setPackRows((prevRows) => {
      if (prevRows.length <= 1) {
        return prevRows;
      }
      return prevRows.filter((row) => row.id !== rowId);
    });
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Packing</label>

      {packRows.map((row) => (
        <ControlRowBtn
          key={row.id}
          onAdd={handleAddClick}
          onRemove={() => handleRemoveRow(row.id)}
        >
          <div className={styles.inputsContainer}>
            <input
              className={styles.inputField}
              type="text"
              placeholder="L"
              value={row.length}
              onChange={(e) =>
                handleInputChange(row.id, 'length', e.target.value)
              }
            />
            <input
              className={styles.inputField}
              type="text"
              placeholder="W"
              value={row.width}
              onChange={(e) =>
                handleInputChange(row.id, 'width', e.target.value)
              }
            />
            <input
              className={styles.inputField}
              type="text"
              placeholder="H"
              value={row.height}
              onChange={(e) =>
                handleInputChange(row.id, 'height', e.target.value)
              }
            />
            <input
              className={styles.inputField}
              type="text"
              placeholder="Qty"
              value={row.quantity}
              onChange={(e) =>
                handleInputChange(row.id, 'quantity', e.target.value)
              }
            />
            <input
              className={styles.inputField}
              type="text"
              placeholder="kg"
              value={row.weight}
              onChange={(e) =>
                handleInputChange(row.id, 'weight', e.target.value)
              }
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
    </div>
  );
};

Main_Pack.propTypes = {
  dropdownOptions: PropTypes.arrayOf(PropTypes.string).isRequired, // Dropdown options
  onAdd: PropTypes.func, // Callback for adding pack data
};

export default Main_Pack;
