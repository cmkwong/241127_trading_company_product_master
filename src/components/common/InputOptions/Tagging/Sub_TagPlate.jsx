import styles from './Sub_TagPlate.module.css';

const Sub_TagPlate = (props) => {
  const { id, name, updateOptionData } = props;

  return (
    <div className={styles.tagBlock}>
      <div key={id} className={styles.container}>
        <span className={styles.label}>{name}</span>
        <button
          type="button"
          className={styles.cancelButton}
          aria-label={`Remove ${name}`}
          onClick={() => updateOptionData(id, false)}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Sub_TagPlate;
