import AddNewBtn from '../Buttons/AddNewBtn';
import Header from '../Texts/Header';
import styles from './Main_InputContainer.module.css';

const Main_InputContainer = ({
  label: title,
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
        {typeof title === 'string' ? (
          <Header as="h2" size="L" text={title} />
        ) : (
          title
        )}
        {onAddNew && <AddNewBtn onClick={onAddNew} text={addNewText} />}
      </div>
      <div className={styles.inputContainer}>{children}</div>
    </div>
  );
};

export default Main_InputContainer;
