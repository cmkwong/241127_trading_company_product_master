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
  base64Value = '',
) => {
  const base64 = String(base64Value || '').trim();
  if (base64.startsWith('data:')) {
    return base64;
  }

  const normalizePath = (path = '') => {
    const unified = String(path || '').replace(/\\/g, '/');
    const withSlash = unified.startsWith('/') ? unified : `/${unified}`;
    return withSlash.replace(/^\/public\//i, '/');
  };

  const raw = String(inputUrl || '').trim();
  if (!raw) return '';

  if (raw.startsWith('blob:') || raw.startsWith('data:')) {
    return raw;
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (url.origin === baseOrigin) {
        url.pathname = normalizePath(url.pathname);
      }
      return url.toString();
    } catch {
      return raw;
    }
  }

  return `${baseOrigin}${normalizePath(raw)}`;
};
