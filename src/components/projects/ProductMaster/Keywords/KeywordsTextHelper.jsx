import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import KeywordsPreview from './KeywordsPreview';
import styles from './Main_Keywords.module.css';

const MAX_CHARACTERS = 2000;

const KeywordsTextHelper = ({
  textAreaValue,
  onTextAreaChange,
  onConvert,
  onReset,
  parseKeywordsFromText,
}) => {
  return (
    <div className={styles.helperContainer}>
      <h4>Batch Convert Keywords</h4>
      <p className={styles.helperDescription}>
        Enter comma-separated keywords below. They will be split and
        synchronized with the product keywords above.
      </p>

      <div className={styles.textAreaWrapper}>
        <Main_TextArea
          defaultValue={textAreaValue}
          onChange={(ov, nv) => onTextAreaChange(nv.slice(0, MAX_CHARACTERS))}
          placeholder="e.g., soft pet bed, dog bed, cat bed, plush pet cushion, warm puppy nest..."
          rows={6}
          maxLength={MAX_CHARACTERS}
        />
      </div>

      <div className={styles.helperActions}>
        <button
          className={styles.convertButton}
          onClick={onConvert}
          disabled={!textAreaValue.trim()}
        >
          Convert & Sync
        </button>
        <button className={styles.resetButton} onClick={onReset}>
          Clear
        </button>
      </div>

      <KeywordsPreview
        textAreaValue={textAreaValue}
        parseKeywordsFromText={parseKeywordsFromText}
      />
    </div>
  );
};

export default KeywordsTextHelper;
