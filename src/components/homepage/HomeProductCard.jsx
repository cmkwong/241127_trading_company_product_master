import Label from '../common/Texts/Label';
import styles from './HomeProductCard.module.css';

const formatMoney = (value) => (Number.isFinite(value) ? value.toFixed(2) : null);

const HomeProductCard = ({ product }) => {
  const priceFrom = formatMoney(product.priceFrom);
  const priceTo = formatMoney(product.priceTo);
  const priceText =
    product.priceDisplay ||
    (priceFrom !== null || priceTo !== null
      ? `$${priceFrom ?? '—'} - $${priceTo ?? '—'}`
      : '—');

  return (
    <article className={styles.productCard} data-node-id="1078:725">
      <div className={styles.imageWrap}>
        <img
          src={product.image || ''}
          alt={product.name || 'Product'}
          className={styles.productImage}
        />
      </div>

      <div className={styles.cardBody}>
        <p className={styles.productName}>{product.name}</p>

        <div className={styles.priceRow}>
          <p className={styles.priceRange}>{priceText}</p>
          <Label className={styles.moqText} size="XS" weight="regular">
            {Number.isFinite(product.moq) ? `MOQ: ${product.moq} pcs` : 'MOQ: —'}
          </Label>
        </div>

        <div className={styles.divider} />

        <div className={styles.supplierRow}>
          <span className={styles.starIcon} aria-hidden="true">
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1L7.2 3.5L10 3.9L8 5.8L8.5 8.5L6 7.2L3.5 8.5L4 5.8L2 3.9L4.8 3.5L6 1Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className={styles.rating}>
            {Number.isFinite(product.rating) ? product.rating.toFixed(1) : '—'}
          </span>
        </div>
      </div>
    </article>
  );
};

export default HomeProductCard;

