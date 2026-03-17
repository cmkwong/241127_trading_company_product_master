import styles from './SplitLayout.module.css';

const SplitLayout = ({ children, className = '' }) => {
  return <div className={`${styles.root} ${className}`.trim()}>{children}</div>;
};

export default SplitLayout;
