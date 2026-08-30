import Header from '../../common/Texts/Header';
import styles from './LowPriceZone.module.css';

const LowPriceZone = ({ deals }) => {
  return (
    <section className={styles.lowPriceZone}>
      <div className={styles.sectionHeader}>
        <span className={styles.fireIcon} aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M9.8 1.5C10.2 3.3 9.3 4.4 8.4 5.5C7.5 6.6 6.7 7.7 6.7 9.5C6.7 11.8 8.5 13.6 10.8 13.6C13.2 13.6 15 11.7 15 9.4C15 7.2 13.7 5.8 12.6 4.6C11.8 3.7 11 2.8 10.8 1.5H9.8Z"
              fill="currentColor"
            />
            <path
              d="M10.5 18.5C6.7 18.5 3.8 15.7 3.8 11.9C3.8 9.6 4.7 8.1 6.2 6.3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <Header as="h3" size="S" color="#0c1e36" weight="semibold">
          Low Price Zone
        </Header>
      </div>

      <div className={styles.dealsRow}>
        {deals.map((deal) => (
          <button key={deal.id} type="button" className={styles.dealCard}>
            <img
              src={deal.image}
              alt="Low price product"
              className={styles.dealImage}
            />
            <p className={styles.dealPrice}>${deal.price.toFixed(2)}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default LowPriceZone;
