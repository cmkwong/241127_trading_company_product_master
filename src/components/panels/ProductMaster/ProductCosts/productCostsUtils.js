export const truthy = (v) => v === true || v === 1 || v === '1';

export const getVariantTypeId = (row, type) => {
  if (!row) return null;
  if (type === 'color') {
    return (
      row.color_type_id ?? row.master_color_type_id ?? row.color_id ?? null
    );
  }
  if (type === 'size') {
    return row.size_type_id ?? row.master_size_type_id ?? row.size_id ?? null;
  }
  return (
    row.capacity_type_id ??
    row.master_capacity_type_id ??
    row.capacity_id ??
    null
  );
};

export const getCapacityLabel = (item) => {
  if (!item) return '';
  if (item.name) return item.name;
  const value = item.value ?? '';
  const unit = item.unit ?? '';
  return `${value} ${unit}`.trim();
};

export const normalizeLower = (v) =>
  String(v || '')
    .trim()
    .toLowerCase();

export const getCostComboKey = (
  colorVariantId,
  capacityVariantId,
  sizeVariantId,
) =>
  [colorVariantId || '', capacityVariantId || '', sizeVariantId || ''].join(
    '|',
  );

export const parseRateDate = (value) => {
  const match = String(value ?? '').match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
};

/**
 * Pick the exchange-rate row effective on (or just before) the given date.
 * Falls back to the latest available row when the date is missing.
 */
export const selectExchangeRateRow = (rows, dateStr) => {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) return null;

  const target = parseRateDate(dateStr);
  const eligible = target
    ? list.filter((r) => {
        const d = parseRateDate(r?.Date);
        return d && d <= target;
      })
    : list;

  const pool = eligible.length > 0 ? eligible : list;
  return [...pool].sort((a, b) =>
    (parseRateDate(b?.Date) || '').localeCompare(parseRateDate(a?.Date) || ''),
  )[0];
};

export const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
