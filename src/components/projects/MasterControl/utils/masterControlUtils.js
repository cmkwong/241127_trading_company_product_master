export const asInputValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const isBooleanType = (type = '') => {
  const t = String(type || '').toLowerCase();
  return (
    t.includes('boolean') || t.includes('bool') || t.includes('tinyint(1)')
  );
};

export const isNumberType = (type = '') => {
  const t = String(type || '').toLowerCase();
  return (
    t.includes('int') ||
    t.includes('decimal') ||
    t.includes('numeric') ||
    t.includes('float') ||
    t.includes('double')
  );
};

export const parseInputValue = (rawValue, schemaField = {}) => {
  if (isBooleanType(schemaField?.type)) {
    const normalized = String(rawValue || '')
      .trim()
      .toLowerCase();
    return ['true', '1', 'yes', 'y'].includes(normalized);
  }

  if (isNumberType(schemaField?.type)) {
    if (rawValue === '') return '';
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? rawValue : parsed;
  }

  return rawValue;
};

export const normalizeReferenceTarget = (schemaField = {}) => {
  const ref =
    schemaField?.reference ||
    schemaField?.references ||
    schemaField?.refTable ||
    schemaField?.foreignKey?.references ||
    schemaField?.foreign_key?.references ||
    '';

  if (typeof ref === 'string') {
    return ref.toLowerCase();
  }

  if (ref && typeof ref === 'object') {
    const tableName = ref.table || ref.tableName || ref.name || '';
    return String(tableName).toLowerCase();
  }

  return '';
};

export const resolveMediaUrl = (
  inputUrl,
  baseOrigin = 'http://localhost:3001',
) => {
  const raw = String(inputUrl || '').trim();
  if (!raw) return '';
  if (
    /^https?:\/\//i.test(raw) ||
    raw.startsWith('blob:') ||
    raw.startsWith('data:')
  ) {
    return raw;
  }

  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
  return `${baseOrigin}${normalizedPath}`;
};
