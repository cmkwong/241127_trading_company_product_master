import styles from './Sub_TagPlate.module.css';
import close_icon from '../../../../assets/close.svg';
import { useState } from 'react';

const Sub_TagPlate = (props) => {
  let { id, name, updateOptionData } = props;

  const [hover, setHover] = useState(false);

  return (
    <div className={styles.tagBlock}>
      <div key={id} className={styles.container}>
        <p className={styles.label}>{name}</p>
        <img
          className={`${styles.cancel} ${hover ? styles.hover : ''}`}
          onClick={() => updateOptionData(id, false)}
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          src={close_icon}
          alt="X"
        />
      </div>
    </div>
  );
};

export default Sub_TagPlate;
