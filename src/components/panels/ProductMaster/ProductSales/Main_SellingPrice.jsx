import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useProductContext } from '../../../../store/ProductContext';
import SellingUnitDropdown from './SellingUnitDropdown';
import PricingModeSwitch from './PricingModeSwitch';
import PriceByQtyTable from './PriceByQtyTable';
import PriceByVariantsTable from './PriceByVariantsTable';
import SinglePriceRange from './SinglePriceRange';
import styles from './Main_SellingPrice.module.css';

const Main_SellingPrice = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const sellingByMode = pageData?.selling_by_mode || 'by_qty';
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
          <label className={styles.moqField}>
            <span className={styles.moqLabel}>Min Order Qty</span>
            <input
              className={styles.moqInput}
              type="number"
              value={pageData?.min_order_qty ?? ''}
              onChange={(e) =>
                upsertProductPageData({
                  min_order_qty: Number(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </label>
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_SellingPrice;
