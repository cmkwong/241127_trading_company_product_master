import styles from './AddStackBtn.module.css';
import add_icon from '../../assets/roundedAdd.svg';

const AddStackBtn = (props) => {
  let { txt, handleClick } = props;
  return (
    <div className={styles.addVarientBtn} onClick={handleClick}>
      <img src={add_icon} alt="add" />
      <p>{txt}</p>
    </div>
  );
};

export default AddStackBtn;
