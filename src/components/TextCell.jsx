import styles from './TextCell.module.css';

const TextCell = (props) => {
  let name = props.name ? props.name : 'text1';
  let cols = props.cols ? props.cols : 40;
  let rows = props.rows ? props.rows : 5;

  let {
    value,
    onChange,
    onMouseEnter,
    onMouseLeave,
    onMouseOver,
    onMouseMove,
  } = props;
  return (
    <div className={styles.container}>
      <textarea
        className={styles.ta}
        name={name}
        cols={cols}
        rows={rows}
        defaultValue={value}
        onChange={onChange}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseOver={onMouseOver}
        onMouseMove={onMouseMove}
      ></textarea>
    </div>
  );
};

export default TextCell;
