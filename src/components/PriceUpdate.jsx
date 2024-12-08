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
      {varientData.datas.map((data, i) => (
        <div key={i} className={styles.row}>
          <Icon src={data.img} width={'60px'} />
          <input
            type="text"
            defaultValue={varientData.varient_sequence.join(' / ')}
            disabled
          />
          <input type="text" defaultValue={data.currency} />
          <input type="number" defaultValue={data.price} />
          <input type="number" defaultValue={data.stock} />
          <input type="text" defaultValue={data.supplier} />
          <input type="text" defaultValue={data.link} />
        </div>
      ))}
    </WindowPop>
  );
};

export default PriceUpdate;
