import { useEffect, useState } from 'react';
import styles from './ControlRowBtn.module.css';

const ControlRowBtn = (props) => {
  const { onAdd, onRemove, children } = props;

  return (
    <div className={styles.controlRowContainer}>
      <div className={styles.buttonsContainer}>
        <button className={styles.addButton} onClick={onAdd}>
          +
        </button>
        <button className={styles.removeButton} onClick={onRemove}>
          -
        </button>
      </div>
      <div className={styles.childrenContainer}>{children}</div>
    </div>
  );
};

export default ControlRowBtn;
