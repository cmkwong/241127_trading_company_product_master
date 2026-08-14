import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useProductContext } from '../../../../store/ProductContext';
import SellingUnitDropdown from './SellingUnitDropdown';
import PricingModeSwitch from './PricingModeSwitch';
import PriceByQtyTable from './PriceByQtyTable';
import PriceByVariantsTable from './PriceByVariantsTable';
import SinglePriceRange from './SinglePriceRange';
import styles from './Main_SellingPrice.module.css';

const Main_SellingPrice = () => {
  const { pageData } = useProductContext();
  const sellingByMode = pageData?.selling_by_mode || 'by_qty';

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
      </div>
    </Main_InputContainer>
  );
};

export default Main_SellingPrice;
