import styles from './Main_Keywords.module.css';

const KeywordsActions = ({
  keywords,
  showTextAreaHelper,
  onToggleHelper,
  onConvertToText,
  splitter,
  onSplitterChange,
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
        <div className={styles.loadTextRow}>
          <button
            className={styles.convertToTextButton}
            onClick={onConvertToText}
            title="Load current keywords as text using the selected splitter"
          >
            → Load Keywords as Text
          </button>

          <label className={styles.splitterLabel}>Splitter</label>
          <input
            className={styles.splitterInput}
            type="text"
            value={splitter}
            onChange={(e) => onSplitterChange(e.target.value)}
            placeholder=","
            maxLength={1}
            title="Allowed: comma (,), slash (/), semicolon (;) or empty"
          />
        </div>
      )}
    </>
  );
};

export default KeywordsActions;
