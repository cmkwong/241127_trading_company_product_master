import styles from './Button.module.css';

const Button = ({ text }) => {
  return <div className={styles['button']}>{text}</div>;
};

export default Button;
