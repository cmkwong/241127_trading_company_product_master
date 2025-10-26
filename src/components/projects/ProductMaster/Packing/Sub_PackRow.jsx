import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField.jsx';
import styles from './Sub_PackRow.module.css';

const Sub_PackRow = () => {
  return (
    <div className={styles.inputsContainer}>
      <Main_TextField placeholder="L" className={styles.packingField} />
      <Main_TextField placeholder="W" className={styles.packingField} />
      <Main_TextField placeholder="H" className={styles.packingField} />
      <Main_TextField placeholder="Qty" className={styles.packingField} />
      <Main_TextField placeholder="kg" className={styles.packingField} />
      <Main_Dropdown label="Package Type" />
    </div>
  );
};

export default Sub_PackRow;
