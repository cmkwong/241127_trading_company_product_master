import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import {
  upsertEntityData,
  useEntityField,
} from '../../../../store/GeneralContext';
import Label from '../../../common/Texts/Label';
import SellingUnitDropdown from './SellingUnitDropdown';
import PricingModeSwitch from './PricingModeSwitch';
import PriceByQtyTable from './PriceByQtyTable';
import PriceByVariantsTable from './PriceByVariantsTable';
import SinglePriceRange from './SinglePriceRange';
import styles from './Main_SellingPrice.module.css';

const Main_SellingPrice = () => {
  const sellingByMode =
    useEntityField('products', 'selling_by_mode') || 'by_qty';
  const minOrderQty = useEntityField('products', 'min_order_qty');
  const showMinOrderQty =
    sellingByMode === 'by_variants' || sellingByMode === 'by_single_price';

  return (
    <Main_InputContainer label="Selling Price">
      <div className={styles.container}>
        <div className={styles.controls}>
          <SellingUnitDropdown />
          <PricingModeSwitch />
        </div>
        <div className={styles.modeBody}>
          {sellingByMode === 'by_qty' && <PriceByQtyTable />}
          {sellingByMode === 'by_single_price' && <SinglePriceRange />}
          {sellingByMode === 'by_variants' && <PriceByVariantsTable />}
        </div>
        {showMinOrderQty && (
          <Label className={styles.moqField}>
            <span className={styles.moqLabel}>Min Order Qty</span>
            <input
              className={styles.moqInput}
              type="number"
              value={minOrderQty ?? ''}
              onChange={(e) =>
                upsertEntityData('products', {
                  min_order_qty: Number(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </Label>
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_SellingPrice;
