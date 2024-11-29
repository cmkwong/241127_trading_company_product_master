import { useRef } from 'react';
import styles from './OptionRow.module.css';

const OptionRow = (props) => {
  let { id, label, checked, updateOptionData } = props;

  const checkboxRef = useRef(null);

  const handleChange = (event) => {
    updateOptionData(parseInt(event.target.id), event.target.checked);
  };

  const handleClick = (event) => {
    checkboxRef.current.checked = !checkboxRef.current.checked;
    updateOptionData(parseInt(id), checkboxRef.current.checked);
  };

  return (
    <div id={id} className={styles['container']} onClick={handleClick}>
      <input
        className={styles['checkbox']}
        ref={checkboxRef}
        id={id}
        name={label}
        defaultChecked={checked}
        onChange={handleChange}
        type="checkbox"
      />
      <h4 id={id} className={styles['label']}>
        {label}
      </h4>
    </div>
  );
};

export default OptionRow;
