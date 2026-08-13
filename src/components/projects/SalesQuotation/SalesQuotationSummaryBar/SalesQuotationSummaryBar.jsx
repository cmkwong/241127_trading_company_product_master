import { useMemo, useState } from 'react';
import styles from './SalesQuotationSummaryBar.module.css';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import { formatMoney, toSafeString, toNumber } from '../utils/quotationTotals';

const formatPercent = (value) => {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return `${value.toFixed(2)}%`;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const convertToBase = (
  amount,
  currencyCode,
  baseCurrencyCode,
  exchangeRateMap,
) => {
  const parsed = toNumber(amount);
  if (!Number.isFinite(parsed)) return null;

  const sourceCode = toSafeString(currencyCode).toUpperCase();
  const targetCode = toSafeString(baseCurrencyCode).toUpperCase();
  if (!sourceCode || !targetCode) return null;

  const sourceRate = exchangeRateMap[sourceCode];
  const targetRate = exchangeRateMap[targetCode];
  if (!Number.isFinite(sourceRate) || sourceRate <= 0) return null;
  if (!Number.isFinite(targetRate) || targetRate <= 0) return null;

  return (parsed / sourceRate) * targetRate;
};

const sumPoCosts = (costRows, baseCurrencyCode, exchangeRateMap) => {
  return toArray(costRows).reduce((total, row) => {
    const converted = convertToBase(
      row?.price,
      row?.currency_code,
      baseCurrencyCode,
      exchangeRateMap,
    );
    return Number.isFinite(converted) ? total + converted : total;
  }, 0);
};

const formatEstimated = (value) => `(${formatMoney(value)})`;

const formatRundownDate = (value) => {
  const normalized = toSafeString(value);
  if (!normalized) return '-';

  // TIMESTAMP strings from MySQL can be "YYYY-MM-DD HH:MM:SS" or ISO "YYYY-MM-DDTHH:..."
  return normalized.slice(0, 10) || normalized;
};

const BalanceCard = ({
  label,
  labelHighlight,
  salesValue,
  estimatedCost,
  actualPoCost,
  hasPoData,
  isHighlight,
  currencyCode,
}) => {
  currencyCode = currencyCode || 'USD';
  const estimatedBalance =
    Number.isFinite(salesValue) && Number.isFinite(estimatedCost)
      ? salesValue - estimatedCost
      : null;
  const actualBalance =
    Number.isFinite(salesValue) && Number.isFinite(actualPoCost)
      ? salesValue - actualPoCost
      : null;
  const estimatedProfitPercent =
    estimatedBalance !== null &&
    Number.isFinite(estimatedCost) &&
    estimatedCost > 0
      ? (estimatedBalance / estimatedCost) * 100
      : null;
  const actualProfitPercent =
    actualBalance !== null && Number.isFinite(actualPoCost) && actualPoCost > 0
      ? (actualBalance / actualPoCost) * 100
      : null;
  const showRealColumn = hasPoData && Number.isFinite(actualPoCost);

  return (
    <div
      className={`${styles.balanceCard} ${isHighlight ? styles.balanceCardHighlight : ''}`}
    >
      <span
        className={`${styles.cardLabel} ${labelHighlight ? styles.cardLabelHighlight : ''}`}
      >
        {label}
      </span>

      <div className={styles.cardGrid}>
        <div className={styles.gridHeaderRow}>
          <span className={styles.gridRowLabel} />
          <span className={styles.gridHeaderEstimated}>Estimated</span>
          <span className={styles.gridHeaderReal}>Real</span>
        </div>

        <div className={styles.gridDataRow}>
          <span className={styles.gridRowLabel}>Sales</span>
          <span className={styles.gridCellEstimated}>-</span>
          <span
            className={`${styles.gridCellReal} ${isHighlight ? styles.gridCellRealHighlight : ''}`}
          >
            {currencyCode} {formatMoney(salesValue)}
          </span>
        </div>

        <div className={styles.gridDataRow}>
          <span className={styles.gridRowLabel}>Cost</span>
          <span className={styles.gridCellEstimated}>
            {estimatedCost !== null ? formatEstimated(estimatedCost) : '-'}
          </span>
          <span className={styles.gridCellReal}>
            {showRealColumn
              ? `${currencyCode} ${formatMoney(actualPoCost)}`
              : `${currencyCode} ${formatMoney(estimatedCost)}`}
          </span>
        </div>

        <div className={styles.gridSeparator} />

        <div className={styles.gridDataRow}>
          <span className={styles.gridRowLabel}>Balance</span>
          <span className={styles.gridCellEstimated}>
            {estimatedBalance !== null
              ? formatEstimated(estimatedBalance)
              : '-'}
          </span>
          <span className={styles.gridCellReal}>
            {showRealColumn && actualBalance !== null
              ? `${currencyCode} ${formatMoney(actualBalance)}`
              : `${currencyCode} ${formatMoney(estimatedBalance)}`}
          </span>
        </div>

        <div className={styles.gridDataRow}>
          <span className={styles.gridRowLabel}>Profit %</span>
          <span className={styles.gridCellEstimated}>
            {estimatedProfitPercent !== null
              ? formatEstimated(estimatedProfitPercent)
              : '-'}
          </span>
          <span className={styles.gridCellReal}>
            {showRealColumn && actualProfitPercent !== null
              ? formatPercent(actualProfitPercent)
              : formatPercent(estimatedProfitPercent)}
          </span>
        </div>
      </div>
    </div>
  );
};

const CostRundownCard = ({
  title,
  rows,
  baseCurrencyCode,
  exchangeRateMap,
}) => {
  const baseCode = toSafeString(baseCurrencyCode).toUpperCase() || 'HKD';

  const total = toArray(rows).reduce((acc, row) => {
    const converted = convertToBase(
      row?.price,
      row?.currency_code,
      baseCode,
      exchangeRateMap,
    );
    return Number.isFinite(converted) ? acc + converted : acc;
  }, 0);

  return (
    <div className={styles.rundownCard}>
      <div className={styles.rundownCardHeader}>{title}</div>

      <div className={styles.rundownColHeader}>
        <span>PR ID</span>
        <span className={styles.rundownDate}>Created Date</span>
        <span className={styles.rundownSupplier}>Supplier</span>
        <span className={styles.rundownItem}>Item</span>
        <span className={styles.rundownCost}>Cost</span>
      </div>

      {toArray(rows).map((row, index) => {
        const converted = convertToBase(
          row?.price,
          row?.currency_code,
          baseCode,
          exchangeRateMap,
        );
        const costText = Number.isFinite(converted)
          ? `${baseCode} ${formatMoney(converted)}`
          : '-';

        return (
          <div
            key={`${row?.purchase_request_id}-${row?.id}-${index}`}
            className={`${styles.rundownDataRow} ${
              index % 2 === 1 ? styles.rundownDataRowAlt : ''
            }`}
          >
            <span className={styles.rundownPrId}>
              {toSafeString(row?.purchase_request_id) || '-'}
            </span>
            <span className={styles.rundownDate}>
              {formatRundownDate(row?.created_at)}
            </span>
            <span className={styles.rundownSupplier}>
              {toSafeString(row?.supplier_name) || '-'}
            </span>
            <span className={styles.rundownItem}>
              {toSafeString(row?.item_label) || '-'}
            </span>
            <span className={styles.rundownCost}>{costText}</span>
          </div>
        );
      })}

      <div className={styles.rundownTotalRow}>
        <span className={styles.rundownTotalLabel}>Total Cost</span>
        <span className={styles.rundownTotalValue}>
          {baseCode} {formatMoney(total)}
        </span>
      </div>
    </div>
  );
};

const SalesQuotationSummaryBar = ({
  totalsSummary,
  baseCurrencyCode,
  onBaseCurrencyChange,
  baseCurrencyOptions,
  latestExchangeRateRow,
  exchangeRateMap,
  isCompact,
  purchaseCosts,
}) => {
  const [isCostRundownOpen, setIsCostRundownOpen] = useState(false);

  const hasPoData =
    purchaseCosts &&
    (toArray(purchaseCosts?.shipping_costs).length > 0 ||
      toArray(purchaseCosts?.product_costs).length > 0 ||
      toArray(purchaseCosts?.service_costs).length > 0);

  const poShippingTotal = useMemo(
    () =>
      sumPoCosts(
        purchaseCosts?.shipping_costs,
        baseCurrencyCode,
        exchangeRateMap,
      ),
    [purchaseCosts, baseCurrencyCode, exchangeRateMap],
  );
  const poProductTotal = useMemo(
    () =>
      sumPoCosts(
        purchaseCosts?.product_costs,
        baseCurrencyCode,
        exchangeRateMap,
      ),
    [purchaseCosts, baseCurrencyCode, exchangeRateMap],
  );
  const poServiceTotal = useMemo(
    () =>
      sumPoCosts(
        purchaseCosts?.service_costs,
        baseCurrencyCode,
        exchangeRateMap,
      ),
    [purchaseCosts, baseCurrencyCode, exchangeRateMap],
  );
  const poGrandTotal = poShippingTotal + poProductTotal + poServiceTotal;

  if (isCompact) {
    return (
      <div className={`${styles.summaryBar} ${styles.summaryBarCompact}`}>
        <div className={styles.metricsRow}>
          <div className={styles.balanceCard}>
            <span className={styles.cardLabel}>Total Cost</span>
            <div className={styles.salesRow}>
              <span className={styles.salesValue}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.costGrandTotal)}
              </span>
            </div>
          </div>
          <div className={styles.balanceCard}>
            <span className={styles.cardLabel}>Profit</span>
            <div className={styles.salesRow}>
              <span className={styles.salesValue}>
                {totalsSummary.baseCurrencyCode}{' '}
                {formatMoney(totalsSummary.profitAmount)}
              </span>
            </div>
          </div>
          <div className={styles.balanceCard}>
            <span className={styles.cardLabel}>Profit % (vs Cost)</span>
            <div className={styles.salesRow}>
              <span className={styles.salesValue}>
                {totalsSummary.profitPercent !== null
                  ? `${totalsSummary.profitPercent.toFixed(2)}%`
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.summaryBar}>
      <div className={styles.currencyRow}>
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

        <button
          type="button"
          className={styles.viewCostsButton}
          onClick={() => setIsCostRundownOpen((prev) => !prev)}
        >
          {isCostRundownOpen ? 'Hide Cost Rundown' : 'View Cost Rundown'}
        </button>
      </div>

      <div className={styles.metricsRow}>
        <BalanceCard
          label="Shipping Balance (Selected)"
          salesValue={totalsSummary.shipping}
          estimatedCost={totalsSummary.costShipping}
          actualPoCost={poShippingTotal}
          hasPoData={hasPoData}
          currencyCode={totalsSummary.baseCurrencyCode}
        />
        <BalanceCard
          label="Product Balance (Selected)"
          salesValue={totalsSummary.product}
          estimatedCost={totalsSummary.costProduct}
          actualPoCost={poProductTotal}
          hasPoData={hasPoData}
          currencyCode={totalsSummary.baseCurrencyCode}
        />
        <BalanceCard
          label="Service Balance (Selected)"
          salesValue={totalsSummary.service}
          estimatedCost={totalsSummary.costService}
          actualPoCost={poServiceTotal}
          hasPoData={hasPoData}
          currencyCode={totalsSummary.baseCurrencyCode}
        />
        <BalanceCard
          label="Total Balance"
          labelHighlight
          salesValue={totalsSummary.grandTotal}
          estimatedCost={totalsSummary.costGrandTotal}
          actualPoCost={poGrandTotal}
          hasPoData={hasPoData}
          isHighlight
          currencyCode={totalsSummary.baseCurrencyCode}
        />
      </div>

      {totalsSummary.missingCount > 0 && (
        <div className={styles.totalWarningText}>
          Sales skipped: {totalsSummary.salesMissingCount} row(s), Cost skipped:{' '}
          {totalsSummary.costMissingCount} row(s) due to missing currency or
          exchange rate.
        </div>
      )}

      {isCostRundownOpen && (
        <div
          className={styles.rundownModalBackdrop}
          onClick={() => setIsCostRundownOpen(false)}
        >
          <div
            className={styles.rundownModalWindow}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.rundownModalHeader}>
              <span className={styles.rundownModalTitle}>
                Purchase Cost Breakdown
              </span>
              <button
                type="button"
                className={styles.rundownModalClose}
                onClick={() => setIsCostRundownOpen(false)}
                aria-label="Close cost breakdown"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className={styles.rundownModalBody}>
              <CostRundownCard
                title="Shipping Cost Breakdown"
                rows={purchaseCosts?.shipping_costs}
                baseCurrencyCode={baseCurrencyCode}
                exchangeRateMap={exchangeRateMap}
              />
              <CostRundownCard
                title="Product Cost Breakdown"
                rows={purchaseCosts?.product_costs}
                baseCurrencyCode={baseCurrencyCode}
                exchangeRateMap={exchangeRateMap}
              />
              <CostRundownCard
                title="Service Cost Breakdown"
                rows={purchaseCosts?.service_costs}
                baseCurrencyCode={baseCurrencyCode}
                exchangeRateMap={exchangeRateMap}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesQuotationSummaryBar;
