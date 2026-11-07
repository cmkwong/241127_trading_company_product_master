import styles from './Sub_CatalogHeader.module.css';
import DEFAULT_LOGO_URL from '../../../../assets/brand_logos/watermark_v2.png';

const DEFAULT_TITLE = 'Product Catalog';

const toText = (value) => String(value ?? '').trim();

const SubCatalogHeader = ({
  logoUrl = '',
  logoAlt = 'Rivolx',
  title = DEFAULT_TITLE,
  subtitle = '',
  meta = '',
  pageNumber = 0,
  pageCount = 0,
}) => {
  const safeTitle = toText(title) || DEFAULT_TITLE;
  const safeSubtitle = toText(subtitle);
  const safeMeta = toText(meta);
  const current = Number(pageNumber);
  const total = Number(pageCount);
  const hasPageNumber =
    Number.isFinite(current) &&
    Number.isFinite(total) &&
    current > 0 &&
    total > 0;

  return (
    <div className={styles.pageHeader}>
      <img
        className={styles.brandLogo}
        src={toText(logoUrl) || DEFAULT_LOGO_URL}
        alt={logoAlt}
      />
      <div className={styles.pageHeaderRight}>
        <h1 className={styles.title}>{safeTitle}</h1>
        {safeSubtitle ? (
          <p className={styles.subtitle}>{safeSubtitle}</p>
        ) : null}
        {safeMeta ? <p className={styles.meta}>{safeMeta}</p> : null}
        {hasPageNumber ? (
          <span className={styles.pageNumber}>
            {current}/{total}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default SubCatalogHeader;
