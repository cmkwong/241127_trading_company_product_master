import { useEffect, useState } from 'react';
import styles from './ControlRowBtn.module.css';

const ControlRowBtn = (props) => {
  const { btnType, onClick } = props;

  const [btnSign, setBtnSign] = useState('');

  useEffect(() => {
    if (btnType === 'add') {
      setBtnSign('+');
    } else if (btnType === 'remove') {
      setBtnSign('-');
    }
  }, [btnType]);

  return (
    <>
      <button
        className={`${styles.addButton} ${
          btnType === 'add' ? styles.addButton : styles.removeButton
        }`}
        onClick={onClick}
      >
        {btnSign}
      </button>
    </>
  );
};

export default ControlRowBtn;
