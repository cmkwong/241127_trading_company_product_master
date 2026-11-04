import { apiGet, apiPost } from '../../../utils/crud';

export const HOME_API_BASE = 'http://localhost:3001/api/v1/trade_business/home';

export const FILE_SERVER_BASE_URL = 'http://localhost:3001';

export const HOME_PAGE_SIZE = 24;

/** Number of products requested from the collection endpoints; the front-end
 * decides how many of these to actually display. */
export const HOME_COLLECTION_SIZE = 10;

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
 *
 * The server now returns the flat home-page card template
 * (`product_card.js`), but this mapper still tolerates the older nested shape
 * (`{ name, mainIconImage, price: { min, max, display }, minOrderQty }`) so an
 * out-of-sync server build cannot break the page.
 */
export const mapProductDetailToCard = (detail) => {
  const price = detail?.price || {};
  const categoryIds = Array.isArray(detail?.categoryIds)
    ? detail.categoryIds
    : [];
  const image = detail?.image ?? detail?.mainIconImage;

  return {
    id: detail?.id,
    name: detail?.name || 'Untitled product',
    image: toAbsoluteImageUrl(image),
    priceFrom: toFiniteNumber(detail?.priceFrom ?? price.min),
    priceTo: toFiniteNumber(detail?.priceTo ?? price.max),
    priceDisplay: detail?.priceDisplay ?? price.display ?? '',
    moq: toFiniteNumber(detail?.moq ?? detail?.minOrderQty),
    categoryIds,
    categoryId: detail?.categoryId ?? categoryIds[0] ?? null,
  };
};

/**
 * Map a server product detail to the compact shape the home-page
 * "Recommendation" / "New Arrivals" mini cards expect (`ProductCollections`).
 * `price` is always a number so callers can safely call `.toFixed()`.
 */
export const mapProductDetailToMiniCard = (detail) => {
  const card = mapProductDetailToCard(detail);
  return {
    id: card.id,
    name: card.name,
    image: card.image,
    price: card.priceFrom ?? 0,
    priceDisplay: card.priceDisplay,
    moq: card.moq,
    categoryIds: card.categoryIds,
    categoryId: card.categoryId,
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
 * Fetch the home-page "Recommendation" products. The server resolves the user
 * (or guest) from the token, so only the token and an optional `limit` are sent.
 */
export const fetchRecommendedProducts = async (
  token,
  { limit = HOME_COLLECTION_SIZE } = {},
) => {
  const response = await apiGet(`${HOME_API_BASE}/products/recommendations`, {
    token,
    params: [['limit', limit]],
  });
  const details = Array.isArray(response?.productDetails)
    ? response.productDetails
    : [];
  return details;
};

/**
 * Fetch the home-page "New Arrivals" products (created within the last 2
 * months, randomly selected).
 */
export const fetchNewArrivals = async (
  token,
  { limit = HOME_COLLECTION_SIZE } = {},
) => {
  const response = await apiGet(`${HOME_API_BASE}/products/new-arrivals`, {
    token,
    params: [['limit', limit]],
  });
  const details = Array.isArray(response?.productDetails)
    ? response.productDetails
    : [];
  return details;
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
