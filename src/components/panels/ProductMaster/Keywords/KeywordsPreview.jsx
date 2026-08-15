import styles from './Main_Keywords.module.css';

const KeywordsPreview = ({ textAreaValue, parseKeywordsFromText }) => {
  return (
    <div className={styles.previewSection}>
      <h5>Preview:</h5>
      <div className={styles.previewList}>
        {parseKeywordsFromText(textAreaValue).map((kw, idx) => (
          <span key={idx} className={styles.previewTag}>
            {kw}
          </span>
        ))}
        {parseKeywordsFromText(textAreaValue).length === 0 && (
          <span className={styles.previewPlaceholder}>
            No keywords to display
          </span>
        )}
      </div>
    </div>
  );
};

export default KeywordsPreview;
