import { useProductDataRowContext } from '../../store/ProductDataRowContext';
import { useProductDatasContext } from '../../store/ProductDatasContext';
import Icon from '../common/Icon';
import WindowPop from '../Media/WindowPop';
import styles from './PriceUpdate.module.css';

const PriceUpdate = (props) => {
  let { productData_prices, setPopWindow } = props;

  const { dispatchProductDatas } = useProductDatasContext();

  const { product_id } = useProductDataRowContext();

  // update row function
  const updatePriceRow = (price_id, name, value) => {
    let new_row_data = {};
    new_row_data[name] = value;
    dispatchProductDatas({
      product_id,
      type: 'updatePriceRow',
      payload: {
        id: price_id,
        new_row_data,
      },
    });
  };

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
      {productData_prices.map((row) => (
        <div key={row.price_id} className={styles.row}>
          <Icon src={row.img} width={'60px'} />
          <input
            type="text"
            defaultValue={row.varient_rows
              .sort((a, b) => a.level - b.level)
              .map((v) => v.value)
              .join(' / ')}
            disabled
          />
          <input
            type="text"
            name="currency"
            defaultValue={row.currency}
            onChange={(event) =>
              updatePriceRow(
                row.price_id,
                event.target.name,
                event.target.value
              )
            }
          />
          <input
            type="number"
            name="price"
            defaultValue={row.price}
            onChange={(event) =>
              updatePriceRow(
                row.price_id,
                event.target.name,
                event.target.value
              )
            }
          />
          <input
            type="number"
            name="stock"
            defaultValue={row.stock}
            onChange={(event) =>
              updatePriceRow(
                row.price_id,
                event.target.name,
                event.target.value
              )
            }
          />
          <input
            type="text"
            name="supplier"
            defaultValue={row.supplier}
            onChange={(event) =>
              updatePriceRow(
                row.price_id,
                event.target.name,
                event.target.value
              )
            }
          />
          <input
            type="text"
            name="link"
            defaultValue={row.link}
            onChange={(event) =>
              updatePriceRow(
                row.price_id,
                event.target.name,
                event.target.value
              )
            }
          />
        </div>
      ))}
    </WindowPop>
  );
};

export default PriceUpdate;
