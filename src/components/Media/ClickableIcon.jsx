import styles from './ClickableIcon.module.css';

const ClickableIcon = ({ image_icon, setPopWindow }) => {
  return (
    <img
      className={styles.clickable}
      onClick={() => {
        setPopWindow(true);
      }}
      src={image_icon}
      alt="Media Upload"
    />
  );
};

export default ClickableIcon;
