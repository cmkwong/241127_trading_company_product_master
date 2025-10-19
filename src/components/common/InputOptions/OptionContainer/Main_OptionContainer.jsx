import styles from './Main_OptionContainer.module.css';

const Main_OptionContainer = ({ label, children }) => {
  return (
    <div className={styles.inputOptionBox}>
      <div className={styles.labelContainer}>
        <label className={styles.label}>{label}</label>
      </div>
      <div className={styles.inputContainer}>{children}</div>
    </div>
  );
};

export default Main_OptionContainer;
