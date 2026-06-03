export const toSafeString = (value) => String(value || '').trim();

export const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return NaN;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? NaN : parsed;
};

export const formatMoney = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const EXCHANGE_RATE_META_KEYS = new Set([
  'id',
  'Date',
  'created_at',
  'updated_at',
  '_isNew',
  '_localId',
]);

const parseRateDate = (value) => {
  const normalized = toSafeString(value);
  if (!normalized) return 0;

  const dateOnlyMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})/);
  const candidate = dateOnlyMatch?.[1] || normalized;
  const timestamp = Date.parse(candidate);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const getLatestExchangeRateRow = (rows = []) => {
  const normalizedRows = Array.isArray(rows) ? rows : [];
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

export const buildNormalizedCurrencies = (currencies = []) => {
  return (Array.isArray(currencies) ? currencies : [])
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
  return (
    Array.isArray(normalizedCurrencies) ? normalizedCurrencies : []
  ).reduce((acc, item) => {
    const id = toSafeString(item?.id);
    const code = toSafeString(item?.code);

    if (id && code) {
      acc[id] = code;
    }

    return acc;
  }, {});
};

export const buildBaseCurrencyOptions = (normalizedCurrencies = []) => {
  const seenCodes = new Set();

  return (Array.isArray(normalizedCurrencies) ? normalizedCurrencies : [])
    .map((item) => {
      const code = toSafeString(item?.code);
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

export const computeQuotationTotals = (
  quotation,
  {
    baseCurrencyCode = 'HKD',
    currencyCodeById = {},
    exchangeRateMap = { HKD: 1 },
  } = {},
) => {
  const shippingRows = Array.isArray(quotation?.sales_shipping_prices)
    ? quotation.sales_shipping_prices
    : [];
  const productRows = Array.isArray(quotation?.sales_product_details)
    ? quotation.sales_product_details
    : [];
  const serviceRows = Array.isArray(quotation?.sales_service_details)
    ? quotation.sales_service_details
    : [];

  const convertToBase = (rawAmount, currencyId) => {
    const amount = toNumber(rawAmount);
    if (!Number.isFinite(amount)) {
      return null;
    }

    const sourceCode = currencyCodeById[toSafeString(currencyId)];
    const targetCode = toSafeString(baseCurrencyCode).toUpperCase() || 'HKD';

    if (!sourceCode) {
      return null;
    }

    const sourceRate = exchangeRateMap[sourceCode];
    const targetRate = exchangeRateMap[targetCode];

    if (!Number.isFinite(sourceRate) || sourceRate <= 0) {
      return null;
    }

    if (!Number.isFinite(targetRate) || targetRate <= 0) {
      return null;
    }

    return (amount / sourceRate) * targetRate;
  };

  const sumConvertedRows = (rows, getAmount, getCurrencyId) => {
    return rows.reduce(
      (acc, row) => {
        const converted = convertToBase(getAmount(row), getCurrencyId(row));

        if (!Number.isFinite(converted)) {
          return { ...acc, missingCount: acc.missingCount + 1 };
        }

        return { ...acc, total: acc.total + converted };
      },
      { total: 0, missingCount: 0 },
    );
  };

  const shippingSelectedRows = shippingRows.filter((row) =>
    Boolean(row?.selected),
  );

  const shippingSummary = sumConvertedRows(
    shippingSelectedRows,
    (row) => row?.price,
    (row) => row?.currency_id,
  );

  const productSummary = sumConvertedRows(
    productRows,
    (row) => {
      const qty = toNumber(row?.qty);
      const price = toNumber(row?.price);

      if (!Number.isFinite(price)) {
        return NaN;
      }

      return (Number.isFinite(qty) ? qty : 1) * price;
    },
    (row) => row?.currency_id,
  );

  const serviceSummary = sumConvertedRows(
    serviceRows,
    (row) => {
      const qty = toNumber(row?.qty);
      const price = toNumber(row?.price);

      if (!Number.isFinite(price)) {
        return NaN;
      }

      return (Number.isFinite(qty) ? qty : 1) * price;
    },
    (row) => row?.currency_id,
  );

  const grandTotal =
    shippingSummary.total + productSummary.total + serviceSummary.total;
  const missingCount =
    shippingSummary.missingCount +
    productSummary.missingCount +
    serviceSummary.missingCount;

  return {
    shipping: shippingSummary.total,
    product: productSummary.total,
    service: serviceSummary.total,
    grandTotal,
    missingCount,
    baseCurrencyCode: toSafeString(baseCurrencyCode).toUpperCase() || 'HKD',
  };
};
