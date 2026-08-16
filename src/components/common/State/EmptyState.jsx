import Notice from '../Texts/Notice';
import styles from './EmptyState.module.css';

const EmptyState = ({ message }) => {
  return (
    <Notice
      variant="neutral"
      icon={false}
      text={message}
      className={styles.emptyState}
    />
  );
};

export default EmptyState;
