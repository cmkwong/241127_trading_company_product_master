/* eslint-disable react-refresh/only-export-components -- this module is the
   single source of the document markup (component) AND its build helpers, by
   design: catalogPrint.js re-exports them. */
import { renderToStaticMarkup } from 'react-dom/server';
import styles from './CatalogPreview.module.css';
// `?inline` returns the compiled CSS text (same hashed class names as `styles`)
// so the A4 print document uses exactly the same stylesheet as this preview.
import previewCss from './CatalogPreview.module.css?inline';
import previewRowCss from './Sub_CatalogPreviewRow.module.css?inline';
import previewHeaderCss from './Sub_CatalogHeader.module.css?inline';
import {
  A4_SIZE_MM,
  getA4FramePx,
  mmToCssPx,
} from '../../../../utils/printUnits';
import { paginateRowsByPixelHeight } from '../../../../utils/printPagination';
import SubCatalogPreviewRow from './Sub_CatalogPreviewRow';
import SubCatalogHeader from './Sub_CatalogHeader';

const DEFAULT_TITLE = 'Product Catalog';

const A4_FRAME_PX = getA4FramePx();

export const A4_LAYOUT = {
  widthMm: A4_SIZE_MM.width,
  heightMm: A4_SIZE_MM.height,
  frameWidthPx: A4_FRAME_PX.widthPx,
  frameHeightPx: A4_FRAME_PX.heightPx,
  paddingTopMm: 14.1,
  paddingBottomMm: 14.1,
  paddingSideMm: 16.9,
};

const PAGE_STYLE = {
  '--a4-width-mm': `${A4_LAYOUT.widthMm}mm`,
  '--a4-height-mm': `${A4_LAYOUT.heightMm}mm`,
  '--a4-width-px': `${A4_LAYOUT.frameWidthPx}px`,
  '--a4-height-px': `${A4_LAYOUT.frameHeightPx}px`,
  '--page-padding-top-mm': `${A4_LAYOUT.paddingTopMm}mm`,
  '--page-padding-bottom-mm': `${A4_LAYOUT.paddingBottomMm}mm`,
  '--page-padding-side-mm': `${A4_LAYOUT.paddingSideMm}mm`,
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const MEASURE_HOST_ID = 'catalog-measure-host';
const MEASURE_OVERRIDE_ID = 'catalog-measure-override';
// The probe page is rendered as a direct child of the offscreen host, so
// structural selectors are used instead of the hashed CSS-module class names.
// `height: auto` + `min-height: 0` let the probe grow past one A4 page so every
// row height can be read in a single pass; `border: 0` matches print media
// (screen adds a 1px page border) so measurement stays conservative.
const MEASURE_OVERRIDE_CSS = `
  #${MEASURE_HOST_ID} > div {
    height: auto !important;
    min-height: 0 !important;
    border: 0 !important;
  }
  #${MEASURE_HOST_ID} > div > * {
    flex: 0 0 auto !important;
  }
`;

const CATALOG_FIT_SLACK_PX = 4;
const FALLBACK_ROW_HEIGHT_PX = 108;
const FALLBACK_PAGE_OVERHEAD_PX = 140;

const CatalogPreviewPage = ({
  chunks,
  title,
  subtitle,
  logoUrl,
  pageStyle,
  baseCurrency,
}) => (
  <>
    {chunks.map((chunk, pageIndex) => (
      <div className={styles.page} style={pageStyle} key={`page-${pageIndex}`}>
        <SubCatalogHeader
          logoUrl={logoUrl}
          title={title}
          subtitle={subtitle}
          pageNumber={pageIndex + 1}
          pageCount={chunks.length}
        />
        <div className={styles.rows} data-catalog-rows>
          <div className={styles.headerRow}>
            <span className={styles.colMain}>Products</span>
            <span className={styles.colImages} aria-hidden="true" />
            <span className={styles.colAttributes}>Features</span>
            <span className={styles.colPrice}>Price ({baseCurrency})</span>
          </div>
          {chunk.rows.map((row, rowIndex) => (
            <SubCatalogPreviewRow
              key={row.id}
              row={row}
              index={chunk.startIndex + rowIndex + 1}
            />
          ))}
        </div>
      </div>
    ))}
  </>
);

const getCatalogMeasureHost = () => {
  if (typeof document === 'undefined') return null;
  let host = document.getElementById(MEASURE_HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = MEASURE_HOST_ID;
    host.style.cssText =
      'position:absolute;left:-20000px;top:0;visibility:hidden;pointer-events:none;';
    document.body.appendChild(host);
  }
  if (!document.getElementById(MEASURE_OVERRIDE_ID)) {
    const style = document.createElement('style');
    style.id = MEASURE_OVERRIDE_ID;
    style.textContent = MEASURE_OVERRIDE_CSS;
    document.head.appendChild(style);
  }
  return host;
};

const measureCatalogLayout = ({
  rows,
  title,
  subtitle,
  logoUrl,
  baseCurrency,
}) => {
  const host = getCatalogMeasureHost();
  if (!host) return null;

  try {
    host.innerHTML = renderToStaticMarkup(
      <CatalogPreviewPage
        chunks={[{ rows, startIndex: 0 }]}
        title={title}
        subtitle={subtitle}
        logoUrl={logoUrl}
        pageStyle={PAGE_STYLE}
        baseCurrency={baseCurrency}
      />,
    );

    const pageEl = host.children[0];
    if (!pageEl) return null;

    const pageStyle = window.getComputedStyle(pageEl);
    const contentTop =
      pageEl.getBoundingClientRect().top + parseFloat(pageStyle.paddingTop);
    const rowsEl = pageEl.querySelector('[data-catalog-rows]');
    const rowEls = rowsEl
      ? Array.from(rowsEl.querySelectorAll('[data-catalog-row]'))
      : [];

    const rowRects = rowEls.map((el) => el.getBoundingClientRect());
    // Each advance is the next row's top minus this row's top, which already
    // includes the flex `gap` between rows; the final row uses its own height.
    const rowHeightsPx = rowRects.map((rect, index) => {
      const next = rowRects[index + 1];
      return next ? next.top - rect.top : rect.height;
    });

    // Static header + table head (and their gaps) sit above the first row; their
    // combined height is reserved once so rows never spill onto a phantom page.
    const pageOverheadPx =
      rowRects.length > 0 ? rowRects[0].top - contentTop : 0;

    const pageContentPx = mmToCssPx(
      A4_LAYOUT.heightMm - A4_LAYOUT.paddingTopMm - A4_LAYOUT.paddingBottomMm,
    );

    return { pageContentPx, pageOverheadPx, rowHeightsPx };
  } catch {
    return null;
  } finally {
    if (host) host.innerHTML = '';
  }
};

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

const paginateCatalogRows = ({
  rows,
  title,
  subtitle,
  logoUrl,
  baseCurrency,
}) => {
  const normalizedRows = Array.isArray(rows) ? rows : [];

  if (normalizedRows.length === 0) {
    return [{ rows: [], startIndex: 0 }];
  }

  const layout = measureCatalogLayout({
    rows: normalizedRows,
    title,
    subtitle,
    logoUrl,
    baseCurrency,
  });

  const chunks = layout
    ? paginateRowsByPixelHeight({
        rowHeightsPx: layout.rowHeightsPx,
        pageContentPx: layout.pageContentPx,
        pageOverheadPx: layout.pageOverheadPx,
        pageSpacerPx: 0,
        pageFooterPx: 0,
        slackPx: CATALOG_FIT_SLACK_PX,
        hasFooter: false,
      })
    : paginateRowsByPixelHeight({
        rowHeightsPx: normalizedRows.map(() => FALLBACK_ROW_HEIGHT_PX),
        pageContentPx: mmToCssPx(
          A4_LAYOUT.heightMm -
            A4_LAYOUT.paddingTopMm -
            A4_LAYOUT.paddingBottomMm,
        ),
        pageOverheadPx: FALLBACK_PAGE_OVERHEAD_PX,
        pageSpacerPx: 0,
        pageFooterPx: 0,
        slackPx: CATALOG_FIT_SLACK_PX,
        hasFooter: false,
      });

  return chunks.map((chunk) => ({
    rows: normalizedRows.slice(chunk.startIndex, chunk.endIndex),
    startIndex: chunk.startIndex,
  }));
};

export const buildCatalogDocumentHtml = ({
  rows = [],
  title = DEFAULT_TITLE,
  subtitle = '',
  logoUrl = '',
  baseCurrency = 'USD',
} = {}) => {
  const normalizedBaseCurrency =
    String(baseCurrency || '')
      .trim()
      .toUpperCase() || 'USD';
  const chunks = paginateCatalogRows({
    rows,
    title,
    subtitle,
    logoUrl,
    baseCurrency: normalizedBaseCurrency,
  });
  const markup = renderToStaticMarkup(
    <CatalogPreviewPage
      chunks={chunks}
      title={title}
      subtitle={subtitle}
      logoUrl={logoUrl}
      pageStyle={PAGE_STYLE}
      baseCurrency={normalizedBaseCurrency}
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
    <style>${previewRowCss}</style>
    <style>${previewHeaderCss}</style>
  </head>
  <body>
    ${markup}
  </body>
</html>
`;
};
