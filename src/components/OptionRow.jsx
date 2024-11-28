import styles from './OptionRow.module.css';

const OptionRow = (props) => {
  let { id, label, checked, updateOptionData } = props;

  const handleChange = (event) => {
    updateOptionData(parseInt(event.target.id), event.target.checked);
  };

  return (
    <div className={styles['container']}>
      <input
        className={styles['checkbox']}
        id={id}
        name={label}
        defaultChecked={checked}
        onChange={handleChange}
        type="checkbox"
      />
      <h4 className={styles['label']}>{label}</h4>
    </div>
  );
};

export default OptionRow;
