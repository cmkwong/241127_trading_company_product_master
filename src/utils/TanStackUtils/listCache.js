// Lightweight localStorage-backed cache helpers for context lists/options.
// The app already has TanStack Query wired up, but these helpers keep the
// module-level "list" state instant-on-mount (stale-while-revalidate) without
// requiring a per-endpoint useQuery refactor of the context modules.

const safeGetItem = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (quota / private browsing).
  }
};

const safeRemoveItem = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
};

export const readJson = (key, fallback) => {
  try {
    const raw = safeGetItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const writeJson = (key, value) => {
  try {
    safeSetItem(key, JSON.stringify(value));
  } catch {
    // Ignore larger-than-quota payloads.
  }
};

export const removeCache = (key) => {
  safeRemoveItem(key);
};

/**
 * Recursively remove any value that starts with "blob:" so that persisted
 * lists never store tab-scoped object URLs (which cannot be used in a new tab).
 * The current tab will re-hydrate images on its normal background fetch.
 */
export const stripBlobUrls = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => stripBlobUrls(item));
  }

  if (!value || typeof value !== 'object') {
    return typeof value === 'string' && value.startsWith('blob:') ? '' : value;
  }

  return Object.entries(value).reduce((acc, [key, nestedValue]) => {
    acc[key] = stripBlobUrls(nestedValue);
    return acc;
  }, {});
};
