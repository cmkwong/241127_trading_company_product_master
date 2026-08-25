import {
  upsertEntityData,
  useEntityField,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './SinglePriceRange.module.css';

const SinglePriceRange = () => {
  const { currencies } = useMasterContext();

  const currencyId =
    useEntityField('products', 'sale_single_price_currency_id') || '';
  const min = useEntityField('products', 'sale_single_price_min') ?? '';
  const max = useEntityField('products', 'sale_single_price_max') ?? '';

  return (
    <div className={styles.row}>
      <select
        className={styles.currencySelect}
        value={currencyId}
        onChange={(e) =>
          upsertEntityData('products', {
            sale_single_price_currency_id: e.target.value,
          })
        }
      >
        <option value="">Select currency</option>
        {(currencies || []).map((currency) => (
          <option key={currency.id} value={currency.id}>
            {currency?.code || currency?.name || currency?.id}
          </option>
        ))}
      </select>
      <input
        className={styles.priceInput}
        type="number"
        value={min}
        placeholder="Enter minimum price"
        onChange={(e) =>
          upsertEntityData('products', {
            sale_single_price_min: e.target.value,
          })
        }
      />
      <span className={styles.separator}>—</span>
      <input
        className={styles.priceInput}
        type="number"
        value={max}
        placeholder="Enter maximum price"
        onChange={(e) =>
          upsertEntityData('products', {
            sale_single_price_max: e.target.value,
          })
        }
      />
    </div>
  );
};

export default SinglePriceRange;
