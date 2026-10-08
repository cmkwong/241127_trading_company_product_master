import { apiGet, apiPost } from '../../../utils/crud';

export const HOME_API_BASE = 'http://localhost:3001/api/v1/trade_business/home';

export const FILE_SERVER_BASE_URL = 'http://localhost:3001';

export const HOME_PAGE_SIZE = 24;

export const toAbsoluteImageUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${FILE_SERVER_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const toFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Map a server product detail to the shape HomeProductCard expects.
 * Missing price fields are left null so the card can render "—".
 */
export const mapProductDetailToCard = (detail) => {
  const price = detail?.price || {};
  const categoryIds = Array.isArray(detail?.categoryIds)
    ? detail.categoryIds
    : [];

  return {
    id: detail?.id,
    name: detail?.name || 'Untitled product',
    image: toAbsoluteImageUrl(detail?.mainIconImage),
    priceFrom: toFiniteNumber(price.min),
    priceTo: toFiniteNumber(price.max),
    priceDisplay: price.display || '',
    moq: toFiniteNumber(detail?.minOrderQty),
    categoryIds,
    categoryId: categoryIds[0] ?? null,
  };
};

export const fetchHomeProducts = async (
  token,
  { offset = 0, limit = HOME_PAGE_SIZE } = {},
) => {
  const response = await apiPost(HOME_API_BASE, { offset, limit }, { token });
  const details = Array.isArray(response?.productDetails)
    ? response.productDetails
    : [];
  const pagination = response?.pagination || {};
  return {
    details,
    total: Number(pagination.total) || details.length,
    hasMore: Boolean(pagination.hasMore),
  };
};

/**
 * Fetch the home-page product cards for one or more categories. Categories are
 * sent as repeated `category` query parameters (server-side exact match against
 * `product_categories.category_id`), so an array of key/value pairs is passed to
 * `apiGet` — `URLSearchParams` turns each pair into a separate `category=` param.
 */
export const fetchProductsByCategory = async (
  token,
  categoryIds = [],
  { offset = 0, limit = HOME_PAGE_SIZE } = {},
) => {
  const ids = (Array.isArray(categoryIds) ? categoryIds : [categoryIds])
    .map((id) => String(id).trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return { details: [], total: 0, hasMore: false };
  }

  const params = [
    ...ids.map((id) => ['category', id]),
    ['offset', offset],
    ['limit', limit],
  ];

  const response = await apiGet(`${HOME_API_BASE}/products/category`, {
    token,
    params,
  });

  const details = Array.isArray(response?.productDetails)
    ? response.productDetails
    : [];
  const pagination = response?.pagination || {};
  return {
    details,
    total: Number(pagination.total) || details.length,
    hasMore: Boolean(pagination.hasMore),
  };
};

/**
 * Fetch the authenticated user's own record. The endpoint is self-restricted on
 * the server (`restrictTo('user-self')`) and identifies the caller solely from
 * the verified token, so no id/email is passed — the token is the only input.
 */
export const fetchSelfUser = async (token) => {
  if (!token) return null;

  const url = `${HOME_API_BASE}/users/data/info`;
  const response = await apiGet(url, { token });

  return response?.structuredData?.data?.users?.[0] ?? null;
};
