/* eslint-disable react-refresh/only-export-components -- this module is the
   single source of the document markup (component) AND its build helpers, by
   design: catalogPrint.js re-exports them. */
import { renderToStaticMarkup } from 'react-dom/server';
import styles from './catalogPreview.module.css';
// `?inline` returns the compiled CSS text (same hashed class names as `styles`)
// so the A4 print document uses exactly the same stylesheet as this preview.
import previewCss from './catalogPreview.module.css?inline';
import { A4_SIZE_MM, getA4FramePx } from '../../../../utils/printUnits';
import { chunkRows } from './catalogData';

const DEFAULT_TITLE = 'Product Catalog';

const A4_FRAME_PX = getA4FramePx();

export const A4_LAYOUT = {
  widthMm: A4_SIZE_MM.width,
  heightMm: A4_SIZE_MM.height,
  frameWidthPx: A4_FRAME_PX.widthPx,
  frameHeightPx: A4_FRAME_PX.heightPx,
  paddingTopMm: 14.1,
  paddingSideMm: 16.9,
};

const PAGE_STYLE = {
  '--a4-width-mm': `${A4_LAYOUT.widthMm}mm`,
  '--a4-height-mm': `${A4_LAYOUT.heightMm}mm`,
  '--a4-width-px': `${A4_LAYOUT.frameWidthPx}px`,
  '--a4-height-px': `${A4_LAYOUT.frameHeightPx}px`,
  '--page-padding-top-mm': `${A4_LAYOUT.paddingTopMm}mm`,
  '--page-padding-side-mm': `${A4_LAYOUT.paddingSideMm}mm`,
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const ProductRow = ({ row }) => (
  <div className={styles.row}>
    <div className={styles.colMain}>
      <div className={styles.mainCell}>
        {row.mainImageUrl ? (
          <img
            className={styles.mainImage}
            src={row.mainImageUrl}
            alt={row.name}
          />
        ) : (
          <div className={styles.mainImage} />
        )}
        {row.sku ? <span className={styles.sku}>{row.sku}</span> : null}
      </div>
    </div>

    <div className={styles.colAttributes}>
      <div className={styles.attrCell}>
        {row.name ? <span className={styles.attrName}>{row.name}</span> : null}
        {row.attributes.length > 0 ? (
          <div className={styles.attrList}>
            {row.attributes.map((attr, index) => (
              <div className={styles.attrRow} key={`${row.id}-attr-${index}`}>
                <span className={styles.attrDot} />
                <span>{attr}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>

    <div className={styles.colImages}>
      <div className={styles.imagesCell}>
        {row.thumbImageUrls.map((url, index) => (
          <img
            className={styles.thumb}
            key={`${row.id}-thumb-${index}`}
            src={url}
            alt=""
          />
        ))}
      </div>
    </div>

    <div className={styles.colPrice}>
      <div className={styles.priceCell}>
        <span className={styles.cellHeader}>Qty Pricing</span>
        <div className={styles.cellRows}>
          {row.priceRows.map((price, index) => (
            <div className={styles.cellRow} key={`${row.id}-price-${index}`}>
              <span className={styles.cellLabel}>{price.label}</span>
              <span className={styles.cellValue}>{price.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className={styles.colStyle}>
      <div className={styles.styleCell}>
        <span className={styles.cellHeader}>Style Pricing</span>
        <div className={styles.cellRows}>
          {row.styleRows.map((style, index) => (
            <div className={styles.cellRow} key={`${row.id}-style-${index}`}>
              <span className={styles.cellLabel}>{style.label}</span>
              <span className={styles.cellValue}>{style.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CatalogPreviewPage = ({
  pages,
  title,
  subtitle,
  pageStyle,
  showTitle,
}) => (
  <>
    {pages.map((rows, pageIndex) => (
      <div className={styles.page} style={pageStyle} key={`page-${pageIndex}`}>
        {pageIndex === 0 && showTitle ? (
          <>
            <h1 className={styles.title}>{title}</h1>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </>
        ) : null}
        <div className={styles.rows}>
          <div className={styles.headerRow}>
            <span className={styles.colMain}>Main Image</span>
            <span className={styles.colAttributes}>Attributes</span>
            <span className={styles.colImages}>Images</span>
            <span className={styles.colPrice}>Price</span>
            <span className={styles.colStyle}>Style Pricing</span>
          </div>
          {rows.map((row) => (
            <ProductRow key={row.id} row={row} />
          ))}
        </div>
      </div>
    ))}
  </>
);

/**
 * Document-level CSS that cannot live inside the CSS module because it targets
 * the document shell (`@page`, `html`, `body`) rather than a component.
 */
const buildDocumentShellCss = () => `
  @page {
    size: A4 portrait;
    margin: 0;
  }

  html,
  body {
    width: ${A4_LAYOUT.widthMm}mm;
    min-height: ${A4_LAYOUT.heightMm}mm;
  }

  body {
    margin: 0;
    background: #ffffff;
  }

  .page * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  @media screen {
    html,
    body {
      width: 100%;
      min-height: 100%;
    }

    body {
      background: #f3f4f6;
      padding: 24px;
    }
  }
`;

export const buildCatalogDocumentHtml = ({
  rows = [],
  pageSize = 10,
  title = DEFAULT_TITLE,
  subtitle = '',
} = {}) => {
  const pages = chunkRows(rows, pageSize);
  const markup = renderToStaticMarkup(
    <CatalogPreviewPage
      pages={pages}
      title={title}
      subtitle={subtitle}
      pageStyle={PAGE_STYLE}
      showTitle
    />,
  );

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
      rel="stylesheet"
    />
    <title>${escapeHtml(title)}</title>
    <style>${buildDocumentShellCss()}</style>
    <style>${previewCss}</style>
  </head>
  <body>
    ${markup}
  </body>
</html>
`;
};

