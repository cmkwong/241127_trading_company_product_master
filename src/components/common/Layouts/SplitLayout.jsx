import styles from './SplitLayout.module.css';

const SplitLayout = ({ children, position = 'M' }) => {
  const normalized = String(position || 'M').toUpperCase();

  const layoutClass =
    normalized === 'L'
      ? styles.positionL
      : normalized === 'R'
        ? styles.positionR
        : styles.positionM;

  return <div className={`${styles.root} ${layoutClass}`}>{children}</div>;
};

export default SplitLayout;
