import { toArray, toSafeString } from './apInvoiceHelpers';

const EXCHANGE_RATE_META_KEYS = new Set([
  'id',
  'Date',
  'created_at',
  'updated_at',
  '_isNew',
  '_localId',
]);

const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return NaN;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? NaN : parsed;
};

const parseRateDate = (value) => {
  const normalized = toSafeString(value);
  if (!normalized) return 0;

  const dateOnlyMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})/);
  const candidate = dateOnlyMatch?.[1] || normalized;
  const timestamp = Date.parse(candidate);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const formatMoney = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const buildNormalizedCurrencies = (currencies = []) => {
  return toArray(currencies)
    .map((item) => {
      const id = toSafeString(item?.id);
      const code = toSafeString(item?.code).toUpperCase();
      const name = toSafeString(item?.name || item?.label);

      if (!id || !code) {
        return null;
      }

      return { id, code, name };
    })
    .filter(Boolean);
};

export const buildCurrencyCodeById = (normalizedCurrencies = []) => {
  return toArray(normalizedCurrencies).reduce((acc, item) => {
    const id = toSafeString(item?.id);
    const code = toSafeString(item?.code).toUpperCase();

    if (id && code) {
      acc[id] = code;
    }

    return acc;
  }, {});
};

export const buildBaseCurrencyOptions = (normalizedCurrencies = []) => {
  const seenCodes = new Set();

  return toArray(normalizedCurrencies)
    .map((item) => {
      const code = toSafeString(item?.code).toUpperCase();
      const name = toSafeString(item?.name || item?.label || code);

      if (!code || seenCodes.has(code)) {
        return null;
      }

      seenCodes.add(code);
      return {
        id: code,
        name: code === name ? code : `${code} - ${name}`,
      };
    })
    .filter(Boolean);
};

export const getLatestExchangeRateRow = (rows = []) => {
  const normalizedRows = toArray(rows);
  if (normalizedRows.length === 0) {
    return null;
  }

  return [...normalizedRows].sort((a, b) => {
    return parseRateDate(b?.Date) - parseRateDate(a?.Date);
  })[0];
};

export const buildExchangeRateMap = (row = {}) => {
  const map = { HKD: 1 };

  Object.entries(row || {}).forEach(([key, value]) => {
    if (EXCHANGE_RATE_META_KEYS.has(key)) {
      return;
    }

    const currencyCode = toSafeString(key).toUpperCase();
    if (!currencyCode) {
      return;
    }

    const rate = toNumber(value);
    if (!Number.isFinite(rate) || rate <= 0) {
      return;
    }

    map[currencyCode] = rate;
  });

  return map;
};

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
