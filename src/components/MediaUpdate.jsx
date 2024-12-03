import WindowPop from './common/WindowPop';
import styles from './MediaUpdate.module.css';

const MediaUpdate = (props) => {
  let { setPopWindow, media } = props;

  return (
    <WindowPop setPopWindow={setPopWindow}>
      <div className={styles.preview}></div>
      <div className={styles.uploadContainer}>
        <input type="file" multiple />
      </div>
    </WindowPop>
  );
};

export default MediaUpdate;
