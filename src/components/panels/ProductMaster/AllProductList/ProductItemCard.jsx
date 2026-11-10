import { useMemo } from 'react';
import SearchSideBarListIcon from '../../../common/SearchSideBarList/SearchSideBarListIcon';
import SearchSideBarListInfo from '../../../common/SearchSideBarList/SearchSideBarListInfo';
import {
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './ProductItemCard.module.css';

/* ------------------------------ Pure helpers ------------------------------ */

const formatDateTime = (value) => {
  if (!value) return '';
  return String(value)
    .replace('T', ' ')
    .replace(/\.\d{3}Z?$/, '');
};

const extractFirstProductName = (productNames) => {
  if (typeof productNames === 'string') {
    return String(productNames || '').trim();
  }

  if (!Array.isArray(productNames) || productNames.length === 0) {
    return '';
  }

  const activeRows = productNames.filter((row) => !row?._delete);
  if (activeRows.length === 0) {
    return '';
  }

  const rowWithDisplayOrderOne = activeRows.find((row) => {
    const orderValue = Number(row?.display_order);
    return Number.isFinite(orderValue) && orderValue === 1;
  });

  const orderOneName = String(
    rowWithDisplayOrderOne?.name || rowWithDisplayOrderOne?.value || '',
  ).trim();
  if (orderOneName) {
    return orderOneName;
  }

  const firstRowName = String(
    activeRows[0]?.name || activeRows[0]?.value || '',
  ).trim();
  if (firstRowName) {
    return firstRowName;
  }

  const fallbackRow = activeRows.find((row) => {
    return String(row?.name || row?.value || '').trim().length > 0;
  });

  return String(fallbackRow?.name || fallbackRow?.value || '').trim();
};

const getProductKeywordRelations = (product, lookups) => {
  const { pageDataId, pageKeywords } = lookups;

  const listRelations = Array.isArray(product?.product_keywords)
    ? product.product_keywords
    : [];

  if (listRelations.length > 0) {
    return listRelations;
  }

  const productId = String(product?.id || '').trim();
  const selectedId = String(pageDataId || '').trim();

  if (
    productId &&
    selectedId &&
    productId === selectedId &&
    Array.isArray(pageKeywords)
  ) {
    return pageKeywords;
  }

  return [];
};

const resolveKeywordLabel = (relation, keywordLabelById) => {
  if (!relation || typeof relation !== 'object') {
    return '';
  }

  const directLabel = String(
    relation?.keyword_name ||
      relation?.keywordName ||
      relation?.name ||
      relation?.label ||
      relation?.value ||
      relation?.text ||
      relation?.keyword?.name ||
      relation?.keyword?.label ||
      '',
  ).trim();

  if (directLabel) {
    return directLabel;
  }

  const keywordId = String(
    relation?.keyword_id ||
      relation?.keywordId ||
      relation?.master_keyword_id ||
      relation?.masterKeywordId ||
      relation?.keyword?.id ||
      '',
  ).trim();

  if (!keywordId) {
    return '';
  }

  return String(keywordLabelById.get(keywordId) || '').trim();
};

/* ------------------------------ Lookup hook ------------------------------- */

/**
 * Gathers, once per list, the master/entity data needed to render a product
 * card. Kept as a single memoized object so `buildProductCardTitle` /
 * `buildProductCardRows` stay pure and can be reused by the sidebar for the
 * expanded modal and Excel export.
 */
export const useProductCardLookups = () => {
  const pageDataId = useEntityField('products', 'id');
  const pageKeywords = useEntityRows('products', 'product_keywords');
  const pageNames = useEntityRows('products', 'product_names');
  const pageLinks = useEntityRows('products', 'product_links');
  const { category, productStatus, productKeywords } = useMasterContext();

  const keywordLabelById = useMemo(() => {
    const lookup = new Map();

    (productKeywords || []).forEach((item) => {
      const id = String(item?.id || '').trim();
      const label = String(item?.name || item?.label || '').trim();
      if (!id || !label) return;
      lookup.set(id, label);
    });

    return lookup;
  }, [productKeywords]);

  return useMemo(
    () => ({
      pageDataId,
      pageKeywords,
      pageNames,
      pageLinks,
      category,
      productStatus,
      keywordLabelById,
    }),
    [
      pageDataId,
      pageKeywords,
      pageNames,
      pageLinks,
      category,
      productStatus,
      keywordLabelById,
    ],
  );
};

/* ------------------------------ Exported builders ------------------------- */

export const buildProductCardTitle = (product, lookups) => {
  const { pageDataId, pageNames } = lookups;

  const productId = String(product?.id || '').trim();
  const selectedId = String(pageDataId || '').trim();

  if (productId && selectedId && productId === selectedId) {
    const liveName = extractFirstProductName(pageNames);
    if (liveName) {
      return liveName;
    }
  }

  const listName = extractFirstProductName(product?.product_names);
  if (listName) {
    return listName;
  }

  return productId;
};

export const resolveProductCardStatusLabel = (product, lookups) => {
  const { productStatus } = lookups;
  const statusId = product?.product_status_id || product?.status_id;

  return (
    productStatus.find((item) => item.id === statusId)?.name ||
    productStatus.find((item) => item.id === statusId)?.label ||
    ''
  );
};

export const buildProductCardKeywordText = (product, lookups) =>
  getProductKeywordRelations(product, lookups)
    .map((relation) => resolveKeywordLabel(relation, lookups.keywordLabelById))
    .filter(Boolean)
    .join(', ');

/* ------------------------------ Product links ----------------------------- */

const PRODUCT_CARD_MAX_LINKS = 2;

const normalizeProductLinkUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (/^\/\//.test(raw)) {
    return `https:${raw}`;
  }

  // Reject other schemes (javascript:, mailto:, data:, etc.) for safety.
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    return '';
  }

  return `https://${raw}`;
};

const getProductLinkRelations = (product, lookups) => {
  const { pageDataId, pageLinks } = lookups;

  const listRelations = Array.isArray(product?.product_links)
    ? product.product_links
    : [];

  if (listRelations.length > 0) {
    return listRelations;
  }

  const productId = String(product?.id || '').trim();
  const selectedId = String(pageDataId || '').trim();

  if (
    productId &&
    selectedId &&
    productId === selectedId &&
    Array.isArray(pageLinks)
  ) {
    return pageLinks;
  }

  return [];
};

const sortProductLinksByScore = (relations) => {
  return relations
    .filter((relation) => relation && !relation._delete)
    .map((relation) => {
      const url = normalizeProductLinkUrl(relation.link);
      const score = Number(relation?.score);

      return {
        id: String(relation?.id || '').trim(),
        name: String(relation?.name || '').trim(),
        url,
        score: Number.isFinite(score) ? score : 0,
      };
    })
    .filter((link) => link.url)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.name.localeCompare(b.name);
    });
};

const buildProductCardLinks = (product, lookups) =>
  sortProductLinksByScore(getProductLinkRelations(product, lookups)).slice(
    0,
    PRODUCT_CARD_MAX_LINKS,
  );

const buildProductCardLinkValue = (links) =>
  links.map((link) => ({
    type: 'link',
    text: link.name || link.url,
    href: link.url,
  }));

export const buildProductCardRows = (product, lookups) => {
  const { category } = lookups;

  const categoryLabels =
    product?.product_categories
      ?.map((c) => c.category_id)
      .map((categoryId) => {
        const item = category.find(
          (lookupItem) => lookupItem.id === categoryId,
        );
        return item?.label || item?.name || `Unknown (${categoryId})`;
      }) || [];

  const alibabaIdValues =
    product?.product_alibaba_ids
      ?.map((item) => item.value)
      .filter(Boolean) || [];

  const links = buildProductCardLinks(product, lookups);

  const rows = [
    {
      label: 'Product Keywords:',
      value: buildProductCardKeywordText(product, lookups),
    },
    { label: 'ID:', value: product?.id || '' },
    { label: 'Status:', value: resolveProductCardStatusLabel(product, lookups) },
    { label: 'Categories:', value: categoryLabels.join(', ') },
    { label: 'Alibaba:', value: alibabaIdValues.join(', ') },
    { label: 'Created At:', value: formatDateTime(product?.created_at) },
    { label: 'Updated At:', value: formatDateTime(product?.updated_at) },
  ];

  if (links.length > 0) {
    rows.splice(1, 0, {
      key: 'links',
      label: 'Link:',
      value: buildProductCardLinkValue(links),
      links,
    });
  }

  return rows;
};

export const resolveProductCardIconUrl = (product) =>
  String(product?.icon_url || '');

/* -------------------------------- Component ------------------------------- */

/**
 * Renders the (up to two, score-ordered) product links inside the "Link:"
 * detail row. Each link shows its name (or the URL when unnamed) followed by
 * an open-in-new-tab button. Clicking the button never selects the row.
 */
const ProductCardLinkList = ({ links = [] }) => (
  <span className={styles.linkList}>
    {links.map((link) => {
      const label = link.name || link.url;

      return (
        <span key={link.id || link.url} className={styles.linkRow}>
          <span className={styles.linkText} title={link.url}>
            {label}
          </span>
          <a
            className={styles.linkButton}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open ${link.url} in a new tab`}
            aria-label={`Open ${label} in a new tab`}
            onClick={(event) => event.stopPropagation()}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3.5a.75.75 0 0 0 0 1.5h4.19L4.22 10.97a.75.75 0 1 0 1.06 1.06L11.25 6.06V10a.75.75 0 0 0 1.5 0V4a.75.75 0 0 0-.75-.75H6z" />
              <path d="M3 3.75A.75.75 0 0 1 3.75 3h1a.75.75 0 0 0 0-1.5h-1A2.25 2.25 0 0 0 1.5 3.75v8.5A2.25 2.25 0 0 0 3.75 14.5h8.5a2.25 2.25 0 0 0 2.25-2.25v-1a.75.75 0 0 0-1.5 0v1c0 .414-.336.75-.75.75h-8.5a.75.75 0 0 1-.75-.75v-8.5z" />
            </svg>
          </a>
        </span>
      );
    })}
  </span>
);

/**
 * ProductItemCard
 * Self-contained card body for a single product row inside the product
 * sidebar list. Reuses the shared icon/info renderers so the visuals (hover
 * image preview, keyword truncation, status colours) stay identical to the
 * default sidebar item, while keeping the product-specific derivation local.
 */
const ProductItemCard = ({ product, lookups, className = '' }) => {
  // Allow the card to be used standalone; prefer a caller-provided lookup
  // object so a whole list can share one memoized instance.
  const resolvedLookups = useProductCardLookups();
  const activeLookups = lookups || resolvedLookups;

  const title = buildProductCardTitle(product, activeLookups);
  const rows = buildProductCardRows(product, activeLookups).map((row) =>
    row.key === 'links'
      ? { ...row, renderValue: () => <ProductCardLinkList links={row.links} /> }
      : row,
  );
  const iconUrl = resolveProductCardIconUrl(product);
  const hasIconUrl = iconUrl.trim().length > 0;

  return (
    <div className={`${styles.card} ${className}`.trim()}>
      {hasIconUrl ? (
        <SearchSideBarListIcon url={iconUrl} alt={title} />
      ) : null}
      <SearchSideBarListInfo title={title} rows={rows} />
    </div>
  );
};

export default ProductItemCard;


