import styles from './ColumnLayout.module.css';

const ColumnLayout = ({ children, className = '' }) => {
  return <div className={`${styles.root} ${className}`.trim()}>{children}</div>;
};

export default ColumnLayout;
