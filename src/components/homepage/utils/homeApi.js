import { apiPost } from '../../../utils/crud';

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
 * Missing price/rating fields are left null so the card can render "—".
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
    rating: null, // no rating source yet
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
