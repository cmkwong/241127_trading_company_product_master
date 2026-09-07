/**
 * Shared money helpers used across all printouts (Sales Quotation, AR Invoice,
 * AP Invoice and Purchase Request) so that a line "Amount" is always derived
 * the same way: round the effective Rate to a fixed number of decimals first,
 * then multiply by Quantity.
 */

export const toFiniteNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return NaN;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

/**
 * Round a money value to the given number of decimals (default 2), matching
 * how `formatMoney` displays rates. Returns NaN for non-finite input.
 */
export const roundMoney = (value, decimals = 2) => {
  const amount = toFiniteNumber(value);
  if (!Number.isFinite(amount)) {
    return NaN;
  }

  const factor = 10 ** decimals;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
};

/**
 * Compute a line amount from a unit Rate, Quantity and optional discount
 * percent. The effective rate is rounded to `rateDecimals` (default 3) BEFORE
 * multiplying by quantity, so `Amount === rounded Rate × Quantity` on the
 * printed document.
 *
 * Returns NaN when the rate is not a finite number.
 */
export const computeLineAmount = ({
  rate,
  quantity = 1,
  discountPercent = 0,
  rateDecimals = 3,
}) => {
  const rawRate = toFiniteNumber(rate);
  if (!Number.isFinite(rawRate)) {
    return NaN;
  }

  let discount = toFiniteNumber(discountPercent);
  if (!Number.isFinite(discount)) {
    discount = 0;
  }
  if (discount < 0) {
    discount = 0;
  }
  if (discount > 100) {
    discount = 100;
  }

  const effectiveRate = rawRate * (1 - discount / 100);

  const qty = toFiniteNumber(quantity);
  const safeQty = Number.isFinite(qty) ? qty : 1;

  return safeQty * roundMoney(effectiveRate, rateDecimals);
};

/**
 * Format a numeric value as a money string with a fixed number of decimals
 * (default 2). Non-finite values fall back to 0.
 */
export const formatMoney = (value, decimals = 2) => {
  const amount = Number.isFinite(toFiniteNumber(value)) ? value : 0;
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a unit Rate with 3 decimal places (matches the precision used when
 * deriving the line amount).
 */
export const formatRateMoney = (value) => formatMoney(value, 3);
