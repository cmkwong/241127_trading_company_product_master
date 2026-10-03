import Label from '../common/Texts/Label';
import styles from './HomeProductCard.module.css';

const formatMoney = (value) =>
  Number.isFinite(value) ? value.toFixed(2) : null;

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
            {Number.isFinite(product.moq)
              ? `MOQ: ${product.moq} pcs`
              : 'MOQ: —'}
          </Label>
        </div>
      </div>
    </article>
  );
};

export default HomeProductCard;
