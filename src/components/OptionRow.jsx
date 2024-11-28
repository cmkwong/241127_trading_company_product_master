import styles from './OptionRow.module.css';

const OptionRow = (props) => {
  let { id, label } = props;
  return (
    <div className={styles['container']}>
      <input type="checkbox" name={label} id={id} />
      <h4>{label}</h4>
    </div>
  );
};

export default OptionRow;
