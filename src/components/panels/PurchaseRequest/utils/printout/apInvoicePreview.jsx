/* eslint-disable react-refresh/only-export-components -- this module mirrors the
   sales printout pipeline: it exposes the A4 document builder (and its view-data
   helper) alongside internal markup components, by design. */
import { renderToStaticMarkup } from 'react-dom/server';
import styles from '../../../SalesQuotation/utils/printout/quotationPreview.module.css';
// `?inline` returns the compiled CSS text (same hashed class names as `styles`)
// so the standalone AP invoice document shares the sales layout exactly.
import previewCss from '../../../SalesQuotation/utils/printout/quotationPreview.module.css?inline';
import {
  A4_LAYOUT,
  resolveCompanyInfo,
} from '../../../SalesQuotation/utils/printout/quotationPreview';
import {
  buildPageNumberLabel,
  paginateRowsWithFooter,
} from '../../../../../utils/printPagination';
import { formatMoney } from '../../../SalesQuotation/utils/quotationTotals';
import {
  getSupplierAddressPreview,
  getSupplierDisplayName,
  toArray,
  toSafeString,
} from './printHelpers';
import { computeApInvoiceTotals } from './apInvoiceTotals';

const PAGE_STYLE = {
  '--a4-width-mm': `${A4_LAYOUT.widthMm}mm`,
  '--a4-height-mm': `${A4_LAYOUT.heightMm}mm`,
  '--a4-width-px': `${A4_LAYOUT.frameWidthPx}px`,
  '--a4-height-px': `${A4_LAYOUT.frameHeightPx}px`,
  '--page-padding-top-mm': `${A4_LAYOUT.paddingTopMm}mm`,
  '--page-padding-bottom-mm': `${A4_LAYOUT.paddingBottomMm}mm`,
  '--page-padding-side-mm': `${A4_LAYOUT.paddingSideMm}mm`,
};

const AP_TERMS_LINES = [
  'Payment is due on or before the due date stated above.',
  'Please quote the invoice number on all remittances.',
  'Any discrepancies must be reported in writing within 5 business days of receipt.',
];

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDateLabel = (value) => {
  const text = toSafeString(value);
  if (!text) return '-';
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDocumentNumber = (value) => {
  const text = toSafeString(value);
  if (!text) return '-';
  const [head] = text.split('-');
  return (head || text).toUpperCase();
};

const AP_NUMBER_LABEL_BY_STATUS = {
  ordered: 'PO No. #',
  pending: '#',
  cancelled: '#',
  ap_invoiced: 'AP. Inv #',
  draft: '#',
};

const DEFAULT_AP_NUMBER_LABEL = '#';

const buildDocumentTitle = (invoice, supplierName) =>
  `${toSafeString(invoice?.id) || 'AP-INVOICE'} - ${supplierName} - AP Invoice`;

const resolveSupplierAddress = (
  invoice,
  supplier,
  supplierAddressOptions,
) => {
  const addressId = toSafeString(invoice?.supplier_address_id);
  const option = toArray(supplierAddressOptions).find(
    (item) => toSafeString(item?.id) === addressId,
  );

  if (option) {
    return getSupplierAddressPreview(option);
  }

  const supplierAddresses = toArray(supplier?.supplier_addresses);
  const matched =
    supplierAddresses.find(
      (item) => toSafeString(item?.id) === addressId,
    ) || supplierAddresses[0];

  return matched ? getSupplierAddressPreview(matched) : '';
};

const buildApInvoiceViewData = ({
  invoice,
  companyInfo = null,
  supplierOptions = [],
  supplierAddressOptions = [],
  invoiceTypes = [],
  baseCurrencyCode = 'HKD',
  currencyCodeById = {},
  exchangeRateMap = { HKD: 1 },
} = {}) => {
  if (!invoice || !invoice?.id) {
    throw new Error('Please select an AP invoice to print.');
  }

  const resolvedCompanyInfo = resolveCompanyInfo(companyInfo);

  const supplierById = new Map(
    toArray(supplierOptions).map((item) => [toSafeString(item?.id), item]),
  );
  const supplier =
    supplierById.get(toSafeString(invoice?.supplier_id)) || null;
  const supplierName = supplier
    ? getSupplierDisplayName(supplier)
    : toSafeString(invoice?.supplier_id);
  const supplierAddress = resolveSupplierAddress(
    invoice,
    supplier,
    supplierAddressOptions,
  );

  const invoiceTypeLabelByCode = new Map(
    toArray(invoiceTypes).map((item) => [
      toSafeString(item?.code),
      toSafeString(item?.description || item?.code),
    ]),
  );

  const lineItems = toArray(invoice?.ap_invoice_row_details).map(
    (row, index) => {
      const typeCode = toSafeString(row?.ap_invoice_type);
      const typeLabel =
        invoiceTypeLabelByCode.get(typeCode) || typeCode || `ROW-${index + 1}`;
      const currencyCode =
        toSafeString(currencyCodeById[toSafeString(row?.currency_id)]) ||
        toSafeString(row?.currency_id) ||
        '-';

      const detailLines = [
        toSafeString(row?.details),
        toSafeString(row?.remark) ? `Remark: ${toSafeString(row?.remark)}` : '',
      ].filter(Boolean);

      return {
        key: toSafeString(row?.id) || `${index}`,
        typeLabel,
        itemName: toSafeString(row?.description) || `Row ${index + 1}`,
        detailLines,
        currencyCode,
        amount: row?.amount,
      };
    },
  );

  const totals = computeApInvoiceTotals(invoice, {
    baseCurrencyCode,
    currencyCodeById,
    exchangeRateMap,
  });

  const statusId = toSafeString(invoice?.status).toLowerCase();
  const documentNumberLabel =
    AP_NUMBER_LABEL_BY_STATUS[statusId] || DEFAULT_AP_NUMBER_LABEL;

  return {
    invoice,
    logoUrl: resolvedCompanyInfo.logoUrl,
    companyName: resolvedCompanyInfo.companyName,
    companyAddress: resolvedCompanyInfo.companyAddress,
    contactPerson: resolvedCompanyInfo.contactPerson,
    supplierName,
    supplierAddress,
    documentNumber: formatDocumentNumber(
      invoice?.invoice_ref || invoice?.id,
    ),
    documentNumberLabel,
    invoiceDate: invoice?.invoice_date,
    dueDate: invoice?.due_date,
    lineItems,
    baseCurrencyCode,
    totalLabel: totals?.baseCurrencyCode || baseCurrencyCode,
    totalAmount: totals?.totalAmount ?? 0,
    missingCount: totals?.missingCount ?? 0,
    documentTitle: buildDocumentTitle(invoice, supplierName),
  };
};

const ApInvoiceTopBar = ({ logoUrl }) => (
  <div className={styles.topBar}>
    <img className={styles.logo} src={logoUrl} alt="Rivolx" />
    <div className={styles.topBarRight}>
      <div className={styles.docTitle}>AP Invoice</div>
    </div>
  </div>
);

const ApInvoiceHeader = ({ view, pageNumberLabel }) => {
  const showPage =
    toSafeString(pageNumberLabel) && pageNumberLabel !== '1/1';

  return (
    <>
      <div className={styles.divider} />
      <div className={styles.metaGrid}>
        <div className={styles.fromCol}>
          <div className={styles.metaTitle}>AP Invoice From</div>
          <div className={styles.metaHeading}>{view.companyName}</div>
          <div className={styles.metaLine}>{view.companyAddress}</div>
          <div className={styles.metaLine}>
            Contact Person: {view.contactPerson}
          </div>
        </div>

        <div className={styles.forCol}>
          <div className={styles.metaTitle}>Supplier</div>
          <div className={styles.metaHeading}>{view.supplierName || '-'}</div>
          <div className={styles.metaLine}>{view.supplierAddress || '-'}</div>
        </div>

        <div className={styles.detailsCol}>
          <div className={styles.metaTitle}>Details</div>
          <div className={styles.metaLineQuot}>
            <span className={styles.metaLineQuotLabel}>
              {view.documentNumberLabel}
            </span>
            <span className={styles.metaLineQuotValue}>
              {view.documentNumber}
            </span>
          </div>
          <div className={styles.metaLineQuot}>
            <span className={styles.metaLineQuotLabel}>Inv. Date</span>
            <span className={styles.metaLineQuotValue}>
              {formatDateLabel(view.invoiceDate)}
            </span>
          </div>
          <div className={styles.metaLineQuot}>
            <span className={styles.metaLineQuotLabel}>Due Date</span>
            <span className={styles.metaLineQuotValue}>
              {formatDateLabel(view.dueDate)}
            </span>
          </div>
          {showPage ? (
            <div className={styles.metaLineQuot}>
              <span className={styles.metaLineQuotLabel}>Page</span>
              <span className={styles.metaLineQuotValue}>{pageNumberLabel}</span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const ApInvoiceBody = ({ lineItems, lineStartIndex = 0 }) => {
  const isEmpty = lineItems.length === 0;

  return (
    <table className={styles.itemsTable}>
      <thead>
        <tr>
          <th style={{ width: '28px' }}>#</th>
          <th style={{ width: '92px' }}>Type</th>
          <th>Description</th>
          <th className={styles.thNum} style={{ width: '64px' }}>
            Currency
          </th>
          <th className={styles.thNum} style={{ width: '94px' }}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {isEmpty ? (
          <tr>
            <td className={styles.emptyRow} colSpan={5}>
              No selected AP invoice items.
            </td>
          </tr>
        ) : (
          lineItems.map((item, index) => (
            <tr key={item.key}>
              <td className={styles.indexCol}>{lineStartIndex + index + 1}.</td>
              <td style={{ fontSize: '11px', color: '#262626' }}>
                {item.typeLabel}
              </td>
              <td className={styles.itemCol} style={{ width: 'auto' }}>
                <div className={styles.itemTitle}>{item.itemName}</div>
                {item.detailLines.map((line) => (
                  <div key={line} className={styles.itemDetail}>
                    {line}
                  </div>
                ))}
              </td>
              <td className={styles.rateCol}>{item.currencyCode}</td>
              <td className={styles.amountCol}>
                {formatMoney(item.amount)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

const ApInvoiceFooter = ({ view }) => {
  const termsLines = [
    ...AP_TERMS_LINES,
    ...(view.missingCount > 0
      ? [
          `Skipped ${view.missingCount} row(s) due to missing currency or exchange rate.`,
        ]
      : []),
  ];

  return (
    <div className={styles.footer}>
      <div className={styles.terms}>
        <div className={styles.termsTitle}>Terms and Conditions</div>
        <div className={styles.termsLine}>
          {termsLines.map((line, index) => (
            <div key={`${index}-${line}`}>{line}</div>
          ))}
        </div>
      </div>
      <div className={styles.totalBox}>
        <span className={styles.totalLabel}>Total ({view.totalLabel})</span>
        <span className={styles.totalValue}>
          {formatMoney(view.totalAmount)}
        </span>
      </div>
    </div>
  );
};

const ApInvoicePreviewPage = ({
  view,
  lineItems,
  lineStartIndex,
  showFooter,
  pageNumberLabel,
}) => (
  <div className={styles.page} style={PAGE_STYLE}>
    <ApInvoiceTopBar logoUrl={view.logoUrl} />
    <ApInvoiceHeader view={view} pageNumberLabel={pageNumberLabel} />
    <ApInvoiceBody lineItems={lineItems} lineStartIndex={lineStartIndex} />
    {showFooter ? (
      <div className={styles.pageTail}>
        <div className={styles.spacer} />
        <ApInvoiceFooter view={view} />
      </div>
    ) : (
      <div className={styles.pageTailSpacer} />
    )}
  </div>
);

const ApInvoicePreviewDocument = ({ view, pages }) => (
  <div className={styles.document}>
    {pages.map((page, pageIndex) => (
      <ApInvoicePreviewPage
        key={pageIndex}
        view={view}
        lineItems={page.rows}
        lineStartIndex={page.startIndex}
        showFooter={page.includeFooter}
        pageNumberLabel={buildPageNumberLabel(pageIndex, pages.length)}
      />
    ))}
  </div>
);

const estimateApRowUnits = (item) => {
  const text = `${toSafeString(item?.itemName)} ${toArray(item?.detailLines).join(
    ' ',
  )}`;

  let units = 1;
  units += Math.max(0, Math.ceil(text.length / 54) - 1);
  return Math.max(1, units);
};

const AP_PAGE_ROW_BUDGET = 26;
const AP_FOOTER_UNITS = 9;

const buildDocumentShellCss = () => `
  @page {
    size: A4 portrait;
    margin: 0;
  }

  html,
  body {
    width: ${A4_LAYOUT.widthMm}mm;
    height: ${A4_LAYOUT.heightMm}mm;
  }

  body {
    margin: 0;
    background: #ffffff;
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

/**
 * Builds the standalone HTML document used for both the in-app preview iframe
 * and the A4 printout. `previewCss` is the compiled sales `quotationPreview`
 * stylesheet (same hashed class names as `styles`), so the AP invoice shares the
 * standard Rivolx layout (logo header, coral accents, terms + total footer).
 */
export const buildApInvoiceDocumentHtml = (options = {}) => {
  const view = buildApInvoiceViewData(options);

  const pageChunks = paginateRowsWithFooter({
    rows: view.lineItems,
    estimateRowUnits: estimateApRowUnits,
    pageRowBudget: AP_PAGE_ROW_BUDGET,
    footerUnits: AP_FOOTER_UNITS,
  });

  const pages =
    pageChunks.length > 0
      ? pageChunks
      : [{ rows: [], startIndex: 0, includeFooter: true }];

  const markup = renderToStaticMarkup(
    <ApInvoicePreviewDocument view={view} pages={pages} />,
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
    <title>${escapeHtml(view.documentTitle)}</title>
    <style>${buildDocumentShellCss()}</style>
    <style>${previewCss}</style>
  </head>
  <body>
    ${markup}
  </body>
</html>
`;
};
