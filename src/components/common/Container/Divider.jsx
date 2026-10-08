import styles from './Divider.module.css';

const Divider = ({
  orientation = 'horizontal',
  label,
  spacing = 'md',
  className = '',
}) => {
  const normalizedOrientation =
    orientation === 'vertical' ? 'vertical' : 'horizontal';

  const rootClass = [
    styles.divider,
    styles[normalizedOrientation],
    styles[`space_${spacing}`] || '',
    label ? styles.withLabel : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      role="separator"
      aria-orientation={normalizedOrientation}
    >
      <span className={styles.line} />
      {label ? <span className={styles.label}>{label}</span> : null}
      {label ? <span className={styles.line} /> : null}
    </div>
  );
};

export default Divider;
