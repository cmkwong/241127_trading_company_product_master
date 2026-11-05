import { toArray, toSafeString } from './printHelpers';

const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return NaN;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? NaN : parsed;
};

/**
 * Totals for an AP invoice. Rows live in `ap_invoice_row_details`; each row is
 * converted to the base currency via `currencyCodeById` + `exchangeRateMap`.
 */
export const computeApInvoiceTotals = (
  invoice,
  {
    baseCurrencyCode = 'HKD',
    currencyCodeById = {},
    exchangeRateMap = { HKD: 1 },
  } = {},
) => {
  const rows = toArray(invoice?.ap_invoice_row_details);
  const normalizedBase = toSafeString(baseCurrencyCode).toUpperCase() || 'HKD';

  const convertToBase = (rawAmount, currencyId) => {
    const amount = toNumber(rawAmount);
    if (!Number.isFinite(amount)) {
      return null;
    }

    const sourceCode = toSafeString(
      currencyCodeById[toSafeString(currencyId)],
    ).toUpperCase();
    if (!sourceCode) {
      return null;
    }

    const sourceRate = exchangeRateMap[sourceCode];
    const targetRate = exchangeRateMap[normalizedBase];

    if (!Number.isFinite(sourceRate) || sourceRate <= 0) {
      return null;
    }

    if (!Number.isFinite(targetRate) || targetRate <= 0) {
      return null;
    }

    return (amount / sourceRate) * targetRate;
  };

  return rows.reduce(
    (acc, row) => {
      const rawAmount = toNumber(row?.amount);
      if (Number.isFinite(rawAmount)) {
        acc.rawTotal += rawAmount;
      }

      const converted = convertToBase(row?.amount, row?.currency_id);
      if (Number.isFinite(converted)) {
        acc.totalAmount += converted;
      } else {
        acc.missingCount += 1;
      }

      return acc;
    },
    {
      totalAmount: 0,
      rawTotal: 0,
      missingCount: 0,
      baseCurrencyCode: normalizedBase,
    },
  );
};
