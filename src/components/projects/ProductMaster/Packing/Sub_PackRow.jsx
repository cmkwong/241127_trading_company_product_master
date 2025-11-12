import { useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField.jsx';
import styles from './Sub_PackRow.module.css';
import { mockPackType } from '../../../../datas/Options/ProductOptions.js';

const Sub_PackRow = forwardRef(
  ({ template_data, packings, onChange, setRowRef, rowindex }, ref) => {
    // Get the current row data or use template data if it doesn't exist
    const packing = packings[rowindex] || { ...template_data };

    const handleFieldChange = useCallback(
      (field, value) => {
        // Convert numeric values
        if (['L', 'W', 'H', 'qty', 'kg'].includes(field)) {
          const numValue = parseFloat(value) || 0;
          onChange(rowindex, field, numValue);
        } else {
          onChange(rowindex, field, value);
        }
      },
      [onChange, rowindex]
    );

    const handleTypeChange = useCallback(
      ({ selected }) => {
        onChange(rowindex, 'type', selected);
      },
      [onChange, rowindex]
    );

    // Convert numeric values to strings for display in text fields
    const getStringValue = (value) => {
      if (value === 0) return '0';
      return value !== undefined && value !== null ? String(value) : '';
    };

    return (
      <div
        className={styles.inputsContainer}
        ref={(el) => setRowRef(rowindex, el)}
      >
        <Main_TextField
          placeholder="L"
          className={styles.packingField}
          value={getStringValue(packing.L)}
          onChange={({ value }) => handleFieldChange('L', value)}
        />
        <Main_TextField
          placeholder="W"
          className={styles.packingField}
          value={getStringValue(packing.W)}
          onChange={({ value }) => handleFieldChange('W', value)}
        />
        <Main_TextField
          placeholder="H"
          className={styles.packingField}
          value={getStringValue(packing.H)}
          onChange={({ value }) => handleFieldChange('H', value)}
        />
        <Main_TextField
          placeholder="Qty"
          className={styles.packingField}
          value={getStringValue(packing.qty)}
          onChange={({ value }) => handleFieldChange('qty', value)}
        />
        <Main_TextField
          placeholder="kg"
          className={styles.packingField}
          value={getStringValue(packing.kg)}
          onChange={({ value }) => handleFieldChange('kg', value)}
        />
        <Main_Dropdown
          defaultOptions={mockPackType}
          label="Package Type"
          defaultSelectedOption={packing.type || 1}
          onChange={handleTypeChange}
        />
      </div>
    );
  }
);

Sub_PackRow.propTypes = {
  template_data: PropTypes.object.isRequired,
  packings: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  setRowRef: PropTypes.func.isRequired,
  rowindex: PropTypes.number,
};

Sub_PackRow.displayName = 'Sub_PackRow';

export default Sub_PackRow;
