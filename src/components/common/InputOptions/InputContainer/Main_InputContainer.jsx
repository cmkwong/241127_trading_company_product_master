import styles from './Main_InputContainer.module.css';

const Main_InputContainer = ({ label, children, layout = 'column' }) => {
  return (
    <div
      className={
        layout === 'row' ? styles.inputOptionBoxRow : styles.inputOptionBox
      }
    >
      <div className={styles.labelContainer}>
        <label className={styles.label}>{label}</label>
      </div>
      <div className={styles.inputContainer}>{children}</div>
    </div>
  );
};

export default Main_InputContainer;
