import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_Pack.module.css';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';

const Main_Pack = ({ dropdownOptions, onAdd }) => {
  const [packRows, setPackRows] = useState([
    {
      length: '',
      width: '',
      height: '',
      quantity: '',
      weight: '',
      oppType: '',
    },
  ]);

  const handleInputChange = (index, field, value) => {
    setPackRows((prevRows) =>
      prevRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const handleDropdownChange = (index, { selected }) => {
    setPackRows((prevRows) =>
      prevRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, oppType: selected } : row
      )
    );
  };

  const handleAddClick = () => {
    setPackRows((prevRows) => [
      ...prevRows,
      {
        length: '',
        width: '',
        height: '',
        quantity: '',
        weight: '',
        oppType: '',
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    setPackRows((prevRows) =>
      prevRows.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  return (
    <div className={styles.container}>
      <button className={styles.addButton} onClick={handleAddClick}>
        +
      </button>
      <label className={styles.label}>Packing</label>
      {packRows.map((row, index) => (
        <div key={index} className={styles.row}>
          <input
            className={styles.inputField}
            type="text"
            placeholder="L"
            value={row.length}
            onChange={(e) => handleInputChange(index, 'length', e.target.value)}
          />
          <input
            className={styles.inputField}
            type="text"
            placeholder="W"
            value={row.width}
            onChange={(e) => handleInputChange(index, 'width', e.target.value)}
          />
          <input
            className={styles.inputField}
            type="text"
            placeholder="H"
            value={row.height}
            onChange={(e) => handleInputChange(index, 'height', e.target.value)}
          />
          <input
            className={styles.inputField}
            type="text"
            placeholder="Qty"
            value={row.quantity}
            onChange={(e) =>
              handleInputChange(index, 'quantity', e.target.value)
            }
          />
          <input
            className={styles.inputField}
            type="text"
            placeholder="kg"
            value={row.weight}
            onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
          />
          <Main_Dropdown
            options={dropdownOptions}
            selectedOptions={row.oppType}
            onChange={(selected) => handleDropdownChange(index, selected)}
            label="Package Type"
          />
          <button
            className={styles.removeButton}
            onClick={() => handleRemoveRow(index)}
          >
            -
          </button>
        </div>
      ))}
    </div>
  );
};

Main_Pack.propTypes = {
  dropdownOptions: PropTypes.arrayOf(PropTypes.string).isRequired, // Dropdown options
  onAdd: PropTypes.func, // Callback for adding pack data
};

export default Main_Pack;
