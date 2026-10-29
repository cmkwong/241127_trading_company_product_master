export const COLUMN_SIZE_MAP = {
  S: 90,
  M: 130,
  L: 220,
  XL: 360,
  XXL: 560,
};

export const DEFAULT_COLUMN_WIDTH = '180px';
export const DEFAULT_COLUMN_WIDTH_NUMERIC = 180;
export const MIN_COLUMN_WIDTH = 60;

export const toCssWidth = (value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return `${value}px`;
  }

  return String(value);
};

export const toNumericWidth = (value) => {
  const parsed = parseFloat(String(value || '').replace(/px/gi, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeColumns = (
  columns = [],
  defaultWidth = DEFAULT_COLUMN_WIDTH,
) => {
  return columns.map((column) => {
    const sizeKey = String(column?.size || '')
      .trim()
      .toUpperCase();
    const mappedSize = COLUMN_SIZE_MAP[sizeKey];
    const width =
      toCssWidth(column?.width) ||
      (mappedSize ? `${mappedSize}px` : defaultWidth);

    return { ...column, width };
  });
};

export const resolveColumnWidth = (
  column,
  colWidths = {},
  fallback = DEFAULT_COLUMN_WIDTH_NUMERIC,
) => {
  if (colWidths[column.key] != null) return colWidths[column.key];
  return toNumericWidth(column.width) ?? fallback;
};

export const isNumericValue = (value) => {
  if (typeof value === 'number') return true;
  if (typeof value === 'string' && value.trim() !== '') {
    return Number.isFinite(Number(value));
  }
  return false;
};

export const compareCellValues = (a, b) => {
  const aBlank = a === null || a === undefined || a === '';
  const bBlank = b === null || b === undefined || b === '';
  if (aBlank && bBlank) return 0;
  if (aBlank) return 1;
  if (bBlank) return -1;

  if (isNumericValue(a) && isNumericValue(b)) {
    return Number(a) - Number(b);
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

export const getDefaultRowKey = (row, index) => row?.id ?? index;
