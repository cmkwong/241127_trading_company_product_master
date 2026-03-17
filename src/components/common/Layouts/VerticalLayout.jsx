import styles from './VerticalLayout.module.css';

const VerticalLayout = ({ children, className = '' }) => {
  return <div className={`${styles.root} ${className}`.trim()}>{children}</div>;
};

export default VerticalLayout;
