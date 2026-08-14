import { useProductContext } from '../../../../store/ProductContext';
import styles from './PricingModeSwitch.module.css';

const MODES = [
  { value: 'by_qty', label: 'Price by Quantity' },
  { value: 'by_variants', label: 'Price by Varients' },
  { value: 'by_single_price', label: 'Single Price Range' },
];

const PricingModeSwitch = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const activeMode = pageData?.selling_by_mode || 'by_qty';

  const handleSelect = (value) => {
    upsertProductPageData({ selling_by_mode: value });
  };

  return (
    <div
      className={styles.segment}
      role="radiogroup"
      aria-label="Selling by mode"
    >
      {MODES.map((mode) => {
        const isActive = mode.value === activeMode;
        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`${styles.segmentItem} ${isActive ? styles.active : ''}`}
            onClick={() => handleSelect(mode.value)}
          >
            <span className={styles.radio}>
              <span
                className={
                  isActive ? styles.radioInner : styles.inactiveRadioInner
                }
              />
            </span>
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};

export default PricingModeSwitch;
