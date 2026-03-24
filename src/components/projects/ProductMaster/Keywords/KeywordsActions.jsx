import { useCallback } from 'react';
import styles from './Main_Keywords.module.css';

const KeywordsActions = ({
  keywords,
  showTextAreaHelper,
  onToggleHelper,
  onConvertToText,
}) => {
  return (
    <>
      <button
        className={styles.helperButton}
        onClick={() => onToggleHelper(!showTextAreaHelper)}
      >
        {showTextAreaHelper ? 'Hide' : 'Show'} Text Helper
      </button>

      {keywords.length > 0 && (
        <button
          className={styles.convertToTextButton}
          onClick={onConvertToText}
          title="Load current keywords as comma-separated text"
        >
          → Load Keywords as Text
        </button>
      )}
    </>
  );
};

export default KeywordsActions;
