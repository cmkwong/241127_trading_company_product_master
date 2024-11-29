import styles from './MediaUpload.module.css';

const MediaUpload = (props) => {
  let { media } = props;

  return (
    <div className={styles.container}>
      <div className={styles.preview}></div>
      <div className={styles.uploadContainer}>
        <input type="file" multiple />
      </div>
    </div>
  );
};

export default MediaUpload;
