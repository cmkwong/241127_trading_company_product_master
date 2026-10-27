/**
 * Shared currency helpers used across Sales Quotation (product / service /
 * shipping rows) and any other module that needs a default currency.
 *
 * The seeded UUIDs below come from `master_currencies` (see
 * `datas/master.js` on the server). They are kept as a fallback for when the
 * master-data options have not finished loading yet, so a newly added row is
 * still assigned a real currency id instead of an empty string.
 */

// Seeded master_currencies UUIDs.
export const USD_CURRENCY_ID = 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a01';
export const CNY_CURRENCY_ID = 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a03';

export const DEFAULT_CURRENCY_CODE = 'USD';

// Currency code used as the default for the sales (revenue) side of a row.
export const SALES_CURRENCY_CODE = 'USD';

// Currency code used as the default for the cost side of a row.
export const COST_CURRENCY_CODE = 'CNY';

// Seeded master_currencies UUIDs keyed by code, used as a fallback when the
// master-data options have not finished loading yet.
const SEEDED_CURRENCY_IDS = {
  USD: USD_CURRENCY_ID,
  CNY: CNY_CURRENCY_ID,
};

/**
 * Look up a currency id by its `code` ('USD', 'CNY', ...) within a list of
 * currency option objects shaped like `{ id, code, name }`.
 *
 * Returns an empty string when no match is found.
 */
export const resolveCurrencyIdByCode = (
  options,
  code = DEFAULT_CURRENCY_CODE,
) => {
  if (!Array.isArray(options)) return '';

  const target = String(code || '').trim().toUpperCase();
  if (!target) return '';

  const match = options.find(
    (option) => String(option?.code || '').trim().toUpperCase() === target,
  );

  return match?.id || '';
};

/**
 * Resolve a currency id for the given `code` from the master data options,
 * falling back to the seeded master_currencies UUID when the options have not
 * loaded yet (or do not contain that code).
 *
 * Returns an empty string when the code is unknown and has no seeded fallback.
 */
export const resolveCurrencyId = (
  options,
  code = DEFAULT_CURRENCY_CODE,
) =>
  resolveCurrencyIdByCode(options, code) ||
  SEEDED_CURRENCY_IDS[String(code || '').trim().toUpperCase()] ||
  '';

/**
 * Default currency for a new row: USD resolved from the master data options by
 * code, falling back to the seeded USD UUID when options are not yet loaded.
 */
export const resolveDefaultCurrencyId = (options) =>
  resolveCurrencyId(options, DEFAULT_CURRENCY_CODE);
