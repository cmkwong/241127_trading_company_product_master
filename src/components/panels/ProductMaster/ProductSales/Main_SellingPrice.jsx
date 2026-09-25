import { useEffect, useMemo } from 'react';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
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
  const qtyTiersAll = useEntityRows('products', 'product_sale_prices_by_qty');

  const qtyTiers = useMemo(
    () => (qtyTiersAll || []).filter((r) => !r?._delete),
    [qtyTiersAll],
  );

  const isByQty = sellingByMode === 'by_qty';

  // Keep products.min_order_qty in sync with the active pricing mode.
  useEffect(() => {
    if (sellingByMode === 'by_qty') {
      // The lowest price tier is the product's minimum order quantity.
      const quantities = qtyTiers
        .map((tier) => Number(tier?.min_order_qty))
        .filter((value) => Number.isFinite(value) && value > 0);
      if (quantities.length === 0) return;

      const derived = Math.min(...quantities);
      if (Number(minOrderQty) !== derived) {
        upsertEntityData('products', { min_order_qty: derived });
      }
      return;
    }

    if (sellingByMode === 'by_variants') {
      const isEmpty =
        minOrderQty === null ||
        minOrderQty === undefined ||
        minOrderQty === '' ||
        Number(minOrderQty) === 0;
      if (isEmpty) {
        upsertEntityData('products', { min_order_qty: 10 });
      }
    }
  }, [sellingByMode, qtyTiers, minOrderQty]);

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
        <Label className={styles.moqField}>
          <span className={styles.moqLabel}>Min Order Qty</span>
          <input
            className={`${styles.moqInput} ${
              isByQty ? styles.moqInputReadOnly : ''
            }`}
            type="number"
            value={minOrderQty ?? ''}
            readOnly={isByQty}
            disabled={isByQty}
            onChange={(e) =>
              upsertEntityData('products', {
                min_order_qty: Number(e.target.value) || 0,
              })
            }
            placeholder={isByQty ? '' : '0'}
          />
        </Label>
      </div>
    </Main_InputContainer>
  );
};

export default Main_SellingPrice;
