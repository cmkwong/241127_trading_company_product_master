import { Children } from 'react';
import styles from './RowLayout.module.css';

const isUsableRatio = (ratio, count) =>
  Array.isArray(ratio) &&
  ratio.length === count &&
  ratio.every((value) => Number.isFinite(Number(value)) && Number(value) > 0);

const RowLayout = ({ children, ratio }) => {
  const items = Children.toArray(children);
  const count = items.length || 1;

  const fractions = isUsableRatio(ratio, count)
    ? ratio.map(Number)
    : Array(count).fill(1);

  const columns = fractions.map((f) => `minmax(0, ${f}fr)`).join(' ');

  return (
    <div className={styles.root} style={{ '--row-columns': columns }}>
      {children}
    </div>
  );
};

export default RowLayout;
