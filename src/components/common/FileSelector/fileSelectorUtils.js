/**
 * Pure helpers for the File Selector ("file bank") window: formatting,
 * filtering, breadcrumb construction, and history/navigation logic. Kept
 * side-effect free so they are trivial to unit test.
 */

/** `3/23/2026 3:03 AM` style timestamp from an ISO string. */
export const formatFileDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  if (hours === 0) hours = 12;
  return `${month}/${day}/${year} ${hours}:${minutes} ${period}`;
};

/** `1,234 KB` style size from a byte count. */
export const formatFileSize = (bytes) => {
  if (bytes == null || !Number.isFinite(Number(bytes))) return '';
  const kb = Number(bytes) / 1024;
  if (kb < 1) return `${Number(bytes)} B`;
  return `${Math.round(kb).toLocaleString('en-US')} KB`;
};

/** Windows-explorer style type label (defensive local fallback). */
export const getTypeLabel = (entry) => {
  if (!entry || entry.type === 'folder') return 'File folder';
  const ext = String(entry.extension || '').replace('.', '').toUpperCase();
  return ext ? `${ext} File` : 'File';
};

/**
 * Human-readable name for a file-bank entry: the DB display name when the
 * server resolved one, otherwise the on-disk filename (a UUID for stored
 * product assets).
 */
export const getEntryDisplayName = (entry) => {
  if (!entry) return '';
  return entry.displayName || entry.name || '';
};

/** Whether an entry can be picked for the current mode. */
export const isSelectable = (entry, mode) => {
  if (!entry || entry.type === 'folder') return false;
  if (mode === 'image') return !!entry.isImage;
  return true;
};

/**
 * Order a folder's entries: folders first (alphabetically), then files
 * (alphabetically). Mirrors the server sort and is used after client-side
 * filtering.
 */
export const sortEntries = (entries) =>
  [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

/**
 * Build breadcrumb segments from a `/public/...` path plus storage metadata.
 * @returns {Array<{ label, path, kind }>} kind ∈ 'drive' | 'root' | 'folder'
 */
export const buildBreadcrumb = (publicPath = '', storage = null) => {
  const crumbs = [];
  if (storage?.driveLabel) {
    crumbs.push({ label: storage.driveLabel, path: null, kind: 'drive' });
  }
  if (storage?.rootLabel) {
    crumbs.push({ label: storage.rootLabel, path: null, kind: 'root' });
  }

  const normalized = String(publicPath || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^public\/?/, '');
  const segments = normalized.split('/').filter(Boolean);

  segments.forEach((segment, index) => {
    const rel = segments.slice(0, index + 1).join('/');
    crumbs.push({
      label: segment,
      path: `/public/${rel}`,
      kind: 'folder',
    });
  });

  return crumbs;
};

/**
 * Append a navigation step to a history stack and return the next state.
 * @param {string[]} history   current history of `/public/...` paths
 * @param {number} index       current position
 * @param {string} nextPath    path to navigate to
 * @returns {{ history: string[], index: number }}
 */
export const pushHistory = (history, index, nextPath) => {
  const trimmed = history.slice(0, index + 1);
  trimmed.push(nextPath);
  return { history: trimmed, index: trimmed.length - 1 };
};

/**
 * Normalize a public-relative or `/public/...` start path into the canonical
 * `/public/...` form. Falls back to the public root.
 * @param {string|undefined} startPath
 */
export const normalizeStartPath = (startPath) => {
  const value = String(startPath || '').trim();
  if (!value) return '/public';
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');
  if (normalized === 'public') return '/public';
  if (normalized.startsWith('public/')) return `/${normalized}`;
  return `/public/${normalized}`;
};
