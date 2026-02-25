import styles from './Sub_TagPlate.module.css';
import close_icon from '../../../../assets/close.svg';

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
          <img className={styles.cancelIcon} src={close_icon} alt="" />
        </button>
      </div>
    </div>
  );
};

export default Sub_TagPlate;
