import styles from './SalesQuotationSummaryBar.module.css';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import { formatMoney, toSafeString } from '../utils/quotationTotals';

const formatPercent = (value) => {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return `${value.toFixed(2)}%`;
};

const SalesQuotationSummaryBar = ({
  totalsSummary,
  baseCurrencyCode,
  onBaseCurrencyChange,
  baseCurrencyOptions,
  latestExchangeRateRow,
  isCompact,
}) => {
  return (
    <div
      className={`${styles.currencySummaryBar} ${
        isCompact ? styles.currencySummaryBarCompact : ''
      }`}
    >
      {!isCompact ? (
        <div className={styles.baseCurrencyPicker}>
          <span className={styles.baseCurrencyLabel}>Base Currency</span>
          <Main_Dropdown
            defaultOptions={baseCurrencyOptions}
            defaultSelectedOption={baseCurrencyCode}
            onChange={(ov, nv) =>
              onBaseCurrencyChange(toSafeString(nv).toUpperCase() || 'USD')
            }
            size="S"
          />
          <span className={styles.rateMetaText}>
            Rate Date: {toSafeString(latestExchangeRateRow?.Date) || '-'}
          </span>
        </div>
      ) : null}

      <div
        className={`${styles.totalsSummaryGrid} ${
          isCompact ? styles.totalsSummaryGridCompact : ''
        }`}
      >
        {isCompact ? (
          <>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>Total Cost</span>
              <span className={styles.totalValue}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.costGrandTotal)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>Profit</span>
              <span className={styles.totalValue}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.profitAmount)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>Profit % (vs Cost)</span>
              <span className={styles.totalValue}>
                {formatPercent(totalsSummary.profitPercent)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>
                Shipping Sales (Selected)
              </span>
              <span className={styles.totalValue}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.shipping)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>
                Product Sales (Selected)
              </span>
              <span className={styles.totalValue}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.product)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>
                Service Sales (Selected)
              </span>
              <span className={styles.totalValue}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.service)}
              </span>
            </div>
            <div className={`${styles.totalCard} ${styles.totalCardHighlight}`}>
              <span className={styles.totalLabel}>Total Sales</span>
              <span className={styles.totalValueStrong}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.grandTotal)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>Total Cost</span>
              <span className={styles.totalValue}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.costGrandTotal)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>Profit</span>
              <span className={styles.totalValue}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.profitAmount)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>Profit % (vs Cost)</span>
              <span className={styles.totalValue}>
                {formatPercent(totalsSummary.profitPercent)}
              </span>
            </div>
          </>
        )}
      </div>

      {!isCompact && totalsSummary.missingCount > 0 ? (
        <div className={styles.totalWarningText}>
          Sales skipped: {totalsSummary.salesMissingCount} row(s), Cost skipped:{' '}
          {totalsSummary.costMissingCount} row(s) due to missing currency or
          exchange rate.
        </div>
      ) : null}
    </div>
  );
};

export default SalesQuotationSummaryBar;
