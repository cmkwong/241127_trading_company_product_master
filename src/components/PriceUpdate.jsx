import Icon from './common/Icon';
import WindowPop from './common/WindowPop';
import styles from './PriceUpdate.module.css';

const PriceUpdate = (props) => {
  let { varientData, setPopWindow } = props;

  return (
    <WindowPop setPopWindow={setPopWindow}>
      <div className={styles.header}>
        <p>Image</p>
        <p>Varient</p>
        <p>Currency</p>
        <p>Price</p>
        <p>Stock</p>
        <p>Supplier</p>
        <p>Link</p>
      </div>
      {varientData.prices.map((row, i) => (
        <div key={i} className={styles.row}>
          <Icon src={row.img} width={'60px'} />
          <input
            type="text"
            defaultValue={varientData.varient
              .map((name) => row.varientValue[name])
              .join(' / ')}
            disabled
          />
          <input type="text" defaultValue={row.currency} />
          <input type="number" defaultValue={row.price} />
          <input type="number" defaultValue={row.stock} />
          <input type="text" defaultValue={row.supplier} />
          <input type="text" defaultValue={row.link} />
        </div>
      ))}
    </WindowPop>
  );
};

export default PriceUpdate;
