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

      <div className={styles.loadTextRow}>
        <button
          className={styles.convertToTextButton}
          onClick={onConvertToText}
          disabled={keywords.length === 0}
          title={
            keywords.length > 0
              ? 'Load current keywords as text using the selected splitter'
              : 'No keywords available to load as text'
          }
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
    </>
  );
};

export default KeywordsActions;
