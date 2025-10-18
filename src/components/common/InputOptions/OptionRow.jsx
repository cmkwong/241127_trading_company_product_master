import { useRef } from 'react';
import styles from './OptionRow.module.css';

const OptionRow = (props) => {
  let { id, name, checked, updateOptionData } = props;

  const checkboxRef = useRef(null);

  const handleChange = (event) => {
    updateOptionData(id, event.target.checked);
  };

  const handleClick = (event) => {
    checkboxRef.current.checked = !checkboxRef.current.checked;
    updateOptionData(id, checkboxRef.current.checked);
  };

  return (
    <div id={id} className={styles['container']} onClick={handleClick}>
      <input
        className={styles['checkbox']}
        ref={checkboxRef}
        id={id}
        name={name}
        defaultChecked={checked}
        onChange={handleChange}
        type="checkbox"
      />
      <p id={id} className={styles.label}>
        {name}
      </p>
    </div>
  );
};

export default OptionRow;
