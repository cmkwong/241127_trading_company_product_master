import AddNewBtn from '../../Buttons/AddNewBtn';
import styles from './Main_InputContainer.module.css';

const Main_InputContainer = ({
  label,
  children,
  layout = 'column',
  onAddNew,
  addNewText = 'Add New',
}) => {
  return (
    <div
      className={
        layout === 'row' ? styles.inputOptionBoxRow : styles.inputOptionBox
      }
    >
      <div className={styles.headerRow}>
        <label className={styles.label}>{label}</label>
        {onAddNew && <AddNewBtn onClick={onAddNew} text={addNewText} />}
      </div>
      <div className={styles.inputContainer}>{children}</div>
    </div>
  );
};

export default Main_InputContainer;
