/**
 * Product image file-bank helpers.
 *
 * The product images live under `E:\Pet Product Images\public\products\<productId>`
 * and are exposed by the backend in two ways:
 *
 *   1. Static, unauthenticated serving under `/public/...` (used for `<img>` tags,
 *      which cannot carry the JWT header).
 *   2. An authenticated folder listing API at
 *      `GET /api/v1/general/file-banks/contents?path=<publicRelative>` that returns
 *      `{ status, path, entries: [...] }`.
 *
 * This module is intentionally small and side-effect free. It does not touch the
 * File System Access API or IndexedDB: the picker is rendered in-app and reads the
 * folder contents over HTTP, so there is no OS dialog and no permission prompt.
 */

import { apiGet } from './crud';

/** Origin of the product master backend. */
export const SERVER_ORIGIN = 'http://localhost:3001';

/** Public-relative root that contains one folder per product. */
export const PRODUCT_IMAGES_FOLDER = 'products';

/**
 * Subfolder (of `products/<productId>`) that holds the icons. Used only to order
 * picker sections — icons are shown first, then the remaining subfolders.
 */
export const PRODUCT_ICON_FOLDER = 'icon';

const FILE_BANK_CONTENTS_URL = `${SERVER_ORIGIN}/api/v1/general/file-banks/contents`;

/** MIME type fallback keyed by lowercase file extension. */
const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

/**
 * Build the public-relative path to a product's images folder.
 * @param {string|number} productId
 * @returns {string} e.g. `products/abc-123`
 */
export const buildProductImagesPath = (productId) =>
  `${PRODUCT_IMAGES_FOLDER}/${String(productId || '').trim()}`;

/**
 * List the immediate children of a public-relative folder.
 * @param {Object} params
 * @param {string} params.path   public-relative folder (e.g. `products/abc-123`)
 * @param {string} [params.token]  JWT for the authenticated listing endpoint
 * @returns {Promise<Array>} folder entries ({ name, path, type, extension, isImage, ... })
 */
export const fetchDirectoryContents = async ({ path, token }) => {
  if (!path) return [];
  const response = await apiGet(FILE_BANK_CONTENTS_URL, {
    token,
    params: { path },
  });
  return Array.isArray(response?.entries) ? response.entries : [];
};

/**
 * Convert a `contents` entry's public path to an absolute static URL usable in an
 * `<img>` tag. The listing returns paths such as `/public/products/<id>/icon/x.png`.
 * @param {string} entryPath
 * @returns {string}
 */
export const buildPublicFileUrl = (entryPath = '') => {
  const normalized = String(entryPath).replace(/\\/g, '/');
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `${SERVER_ORIGIN}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
};

/**
 * Resolve a stored file value into a `src` the SPA can actually load.
 *
 * Values reach the UI in three shapes: `blob:`/`data:` (freshly picked or
 * base64-hydrated), absolute URLs (file-bank entries carry `entry.url`), and
 * `/public/...` paths exactly as stored in the DB. The last shape is served
 * ONLY by the backend origin — the Vite dev origin answers `/public/...` with
 * the SPA's index.html, so it must be resolved before reaching an `<img>`.
 *
 * @param {string} value  stored path, blob/data URL or absolute URL
 * @param {string} [base] origin to prefix (defaults to {@link SERVER_ORIGIN})
 * @returns {string} a loadable URL (or '' for empty input)
 */
export const resolveDisplayFileUrl = (value = '', base = SERVER_ORIGIN) => {
  const url = String(value || '')
    .replace(/\\/g, '/')
    .trim();
  if (!url) return '';
  if (/^(blob:|data:|https?:\/\/)/i.test(url)) return url;

  const origin = String(base || SERVER_ORIGIN)
    .trim()
    .replace(/\/+$/, '');
  if (!origin) return url;

  return `${origin}/${url.replace(/^\/+/, '')}`;
};

/** @param {Object} entry @returns {boolean} */
export const isImageEntry = (entry) =>
  Boolean(entry && entry.type === 'file' && entry.isImage);

/**
 * Order a folder's entries for display: folders first (alphabetically), then files.
 * @param {Array} entries
 * @returns {Array}
 */
export const sortEntriesForPicker = (entries) =>
  [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

/**
 * Determine the MIME type for an entry, preferring the extension map over the
 * server-provided value (the listing does not carry a MIME type).
 * @param {Object} entry
 * @returns {string}
 */
const mimeForEntry = (entry) => {
  const ext = String(entry?.extension || '').toLowerCase();
  return MIME_BY_EXT[ext] || 'application/octet-stream';
};

/**
 * Fetch an entry's bytes over the static URL and wrap them in a `File` so the
 * existing upload pipeline (type/size validation + object URL) works unchanged.
 * @param {Object} entry
 * @returns {Promise<File>}
 */
export const fetchEntryAsFile = async (entry) => {
  const response = await fetch(buildPublicFileUrl(entry.path));
  if (!response.ok) {
    throw new Error(`Failed to load image (${response.status})`);
  }
  const blob = await response.blob();
  const type = blob.type || mimeForEntry(entry);
  return new File([blob], entry.name || 'image', { type });
};

/** Public path prefix used by all file-bank listings. */
export const PUBLIC_PREFIX = '/public';

const FILE_BANK_TREE_URL = `${SERVER_ORIGIN}/api/v1/general/file-banks/tree`;

/**
 * Fetch the file-bank tree metadata (storage labels + dynamic roots derived
 * from every model's `fileConfig.uploadDir`).
 * @param {Object} params
 * @param {string} [params.token]  JWT for the authenticated endpoint
 * @param {number} [params.maxDepth]  max directory depth (undefined = unlimited)
 * @returns {Promise<{ storage: Object, roots: Array, fileBanks: Object }>}
 */
export const fetchFileBankTree = async ({ token, maxDepth } = {}) => {
  const response = await apiGet(FILE_BANK_TREE_URL, {
    token,
    params: maxDepth == null ? {} : { maxDepth },
  });
  return {
    storage: response?.storage || null,
    roots: Array.isArray(response?.roots) ? response.roots : [],
    fileBanks: response?.fileBanks || null,
  };
};

/** Base Windows path to the product images folder (mirrors the server config). */
export const PRODUCT_IMAGES_BASE_PATH = 'E:\\Pet Product Images\\public\\products';

/**
 * Build the Windows filesystem path to a product's images folder (used only to
 * copy to the clipboard; the in-app picker reads over HTTP instead).
 * @param {string|number} productId
 * @returns {string} e.g. `E:\Pet Product Images\public\products\abc-123`
 */
export const buildProductFolderWindowsPath = (productId) =>
  `${PRODUCT_IMAGES_BASE_PATH}\\${String(productId || '').trim()}`;

/**
 * List a file-bank directory and return the full (enriched) response, including
 * navigation metadata (parentPath / hasParent) and counts.
 * @param {Object} params
 * @param {string} params.path      public-relative folder (e.g. `products/abc-123`)
 * @param {string} [params.token]   JWT
 * @param {boolean} [params.imagesOnly]
 * @param {string} [params.search]
 * @returns {Promise<{path,parentPath,hasParent,folderCount,fileCount,entries}>}
 */
export const fetchFileBankDirectory = async ({
  path,
  token,
  imagesOnly = false,
  search = '',
}) => {
  if (!path) path = 'public';
  const params = { path };
  if (imagesOnly) params.imagesOnly = 'true';
  if (search) params.search = search;

  const response = await apiGet(FILE_BANK_CONTENTS_URL, { token, params });
  return {
    path: response?.path || path,
    parentPath: response?.parentPath ?? null,
    hasParent: !!response?.hasParent,
    folderCount: response?.folderCount ?? 0,
    fileCount: response?.fileCount ?? 0,
    entries: Array.isArray(response?.entries) ? response.entries : [],
  };
};
