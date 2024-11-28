import styles from './TagPlate.module.css';
import close_icon from '../assets/close.svg';

const TagPlate = (props) => {
  let { label } = props;
  return (
    <div className={styles['container']}>
      <h4>{label}</h4>
      <img src="close_icon" alt="X" />
    </div>
  );
};

export default TagPlate;
