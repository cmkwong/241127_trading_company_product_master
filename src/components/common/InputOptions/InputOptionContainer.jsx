import { useState, useRef, useMemo, useCallback } from 'react';
import styles from './InputOptionContainer.module.css';
import InputTags from './InputTags';

const InputOptionContainer = ({ label, children }) => {
  return (
    <div className={styles.inputOptionBox}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputContainer}>{children}</div>
    </div>
  );
};

export default InputOptionContainer;
