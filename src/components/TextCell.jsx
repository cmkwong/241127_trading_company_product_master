import styles from './TextCell.module.css';

const TextCell = (props) => {
  let name = props.name ? props.name : 'text1';
  let cols = props.cols ? props.cols : 40;
  let rows = props.rows ? props.rows : 5;
  return (
    <div className={styles.container}>
      <textarea
        className={styles.ta}
        name={name}
        cols={cols}
        rows={rows}
      ></textarea>
    </div>
  );
};

export default TextCell;
