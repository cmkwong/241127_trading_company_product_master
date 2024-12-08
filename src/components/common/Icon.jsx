import styles from './Icon.module.css';

const Icon = (props) => {
  let { width, src } = props;

  return (
    <div style={{ width: width }} className={styles.imgContainer}>
      <img className={styles.img} src={src} alt="img" />
    </div>
  );
};

export default Icon;
