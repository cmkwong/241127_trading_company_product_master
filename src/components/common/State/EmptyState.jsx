import styles from './EmptyState.module.css';

const EmptyState = ({ message }) => {
  return <div className={styles.emptyState}>{message}</div>;
};

export default EmptyState;
