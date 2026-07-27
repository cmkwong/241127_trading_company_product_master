import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Main_SalesQuotation.module.css';
import SalesQuotationSavePageContainer from './Container/SalesQuotationSavePageContainer';
import SalesQuotationSidebar from './AllSalesQuotationList/SalesQuotationSidebar';
import Main_SalesBasicInfo from './SalesBasicInfo/Main_SalesBasicInfo';
import Main_SalesShippingDetails from './ShippingDetails/Main_SalesShippingDetails';
import Main_SalesProductDetails from './ProductDetails/Main_SalesProductDetails';
import Main_SalesServiceDetails from './ServiceDetails/Main_SalesServiceDetails';
import { useSalesQuotationContext } from '../../../store/SalesQuotationContext';
import { useMasterContext } from '../../../store/MasterContext';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';
import {
  buildBaseCurrencyOptions,
  buildCurrencyCodeById,
  buildExchangeRateMap,
  buildNormalizedCurrencies,
  computeQuotationTotals,
  formatMoney,
  getLatestExchangeRateRow,
  isSelectedFlag,
  toSafeString,
} from './utils/quotationTotals';
import { buildQuotationDocumentA4Html } from './utils/quotationPrint';
import { buildArInvoiceDocumentA4Html } from './utils/arInvoicePrint';

const formatPercent = (value) => {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return `${value.toFixed(2)}%`;
};

const Main_SalesQuotation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isSummaryCompact, setIsSummaryCompact] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [previewType, setPreviewType] = useState('quotation');
  const [previewShowTotalPrice, setPreviewShowTotalPrice] = useState(true);
  const [previewPrintArInvoice, setPreviewPrintArInvoice] = useState(false);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('USD');
  const previewIframeRef = useRef(null);
  const {
    quotations,
    selectedQuotationId,
    selectSalesQuotation,
    selectedQuotation,
    isSalesQuotationsLoading,
    customerOptions,
    customerAddressOptions,
    supplierOptions,
    productOptions,
    serviceOptions,
    currencyOptions,
    incotermOptions,
    shippingMethodOptions,
    patchSelectedQuotation: patchSalesQuotationInContext,
    saveSelectedQuotation,
    createSalesQuotation,
    duplicateSelectedSalesQuotation,
    deleteSalesQuotation,
    getSalesQuotationDryRunData,
    refreshReferenceOptions,
  } = useSalesQuotationContext();
  const { companyInfo, currencies, exchangeRateHkd, fetchMasterData } =
    useMasterContext();

  useEffect(() => {
    refreshReferenceOptions();
    fetchMasterData('master_company_info');
    fetchMasterData('master_shipping_method');
    fetchMasterData('master_exchange_rate_hkd');
    fetchMasterData('master_currencies');
  }, [fetchMasterData, refreshReferenceOptions]);

  useEffect(() => {
    const handleWindowFocus = () => {
      refreshReferenceOptions();
      fetchMasterData('master_company_info');
      fetchMasterData('master_shipping_method');
      fetchMasterData('master_exchange_rate_hkd');
      fetchMasterData('master_currencies');
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchMasterData, refreshReferenceOptions]);

  const normalizedCurrencies = useMemo(() => {
    return buildNormalizedCurrencies(currencies);
  }, [currencies]);

  const currencyCodeById = useMemo(() => {
    return buildCurrencyCodeById(normalizedCurrencies);
  }, [normalizedCurrencies]);

  const baseCurrencyOptions = useMemo(() => {
    return buildBaseCurrencyOptions(normalizedCurrencies);
  }, [normalizedCurrencies]);

  useEffect(() => {
    if (baseCurrencyOptions.length === 0) {
      if (baseCurrencyCode !== 'USD') {
        setBaseCurrencyCode('USD');
      }
      return;
    }

    const exists = baseCurrencyOptions.some(
      (item) => toSafeString(item?.id) === toSafeString(baseCurrencyCode),
    );

    if (!exists) {
      setBaseCurrencyCode(toSafeString(baseCurrencyOptions[0]?.id) || 'USD');
    }
  }, [baseCurrencyCode, baseCurrencyOptions]);

  const latestExchangeRateRow = useMemo(() => {
    return getLatestExchangeRateRow(exchangeRateHkd);
  }, [exchangeRateHkd]);

  const exchangeRateMap = useMemo(() => {
    return buildExchangeRateMap(latestExchangeRateRow || {});
  }, [latestExchangeRateRow]);

  const totalsSummary = useMemo(() => {
    return computeQuotationTotals(selectedQuotation, {
      baseCurrencyCode,
      currencyCodeById,
      exchangeRateMap,
    });
  }, [baseCurrencyCode, currencyCodeById, exchangeRateMap, selectedQuotation]);

  const patchSelectedQuotation = useCallback(
    (patch) => {
      if (!selectedQuotationId) return;

      patchSalesQuotationInContext(patch);
    },
    [patchSalesQuotationInContext, selectedQuotationId],
  );

  const handleSelectQuotation = useCallback(
    (quotation) => {
      selectSalesQuotation(String(quotation?.id || ''));
    },
    [selectSalesQuotation],
  );

  const handleCreateQuotation = useCallback(async () => {
    await createSalesQuotation();
  }, [createSalesQuotation]);

  const handleSaveQuotation = useCallback(async () => {
    await saveSelectedQuotation();
  }, [saveSelectedQuotation]);

  const handleDuplicateQuotation = useCallback(async () => {
    if (!selectedQuotation || isDuplicating) {
      return;
    }

    setIsDuplicating(true);
    try {
      await duplicateSelectedSalesQuotation();
    } catch (error) {
      console.error('Failed to duplicate sales quotation:', error);
      alert(error?.message || 'Failed to duplicate sales quotation.');
    } finally {
      setIsDuplicating(false);
    }
  }, [duplicateSelectedSalesQuotation, isDuplicating, selectedQuotation]);

  const handleDeleteQuotation = useCallback(async () => {
    const quotationId = String(selectedQuotation?.id || '').trim();
    if (!quotationId || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      'Delete this sales quotation? This action cannot be undone.',
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSalesQuotation(quotationId);
    } catch (error) {
      console.error('Failed to delete sales quotation:', error);
      alert(error?.message || 'Failed to delete sales quotation.');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteSalesQuotation, isDeleting, selectedQuotation]);

  const handlePreviewQuotation = useCallback(() => {
    if (!selectedQuotation || isPreparingPreview) {
      return;
    }

    try {
      setIsPreparingPreview(true);
      setPreviewPrintArInvoice(false);
      const html = buildQuotationDocumentA4Html({
        quotation: selectedQuotation,
        companyInfo: Array.isArray(companyInfo) ? companyInfo[0] : null,
        customerOptions,
        customerAddressOptions,
        shippingMethodOptions,
        productOptions,
        serviceOptions,
        currencyCodeById,
        baseCurrencyCode,
        exchangeRateMap,
        showTotalPrice: previewShowTotalPrice,
      });

      setPreviewType('quotation');
      setPreviewHtml(html);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Failed to prepare quotation preview:', error);
      alert(error?.message || 'Failed to prepare quotation preview.');
    } finally {
      setIsPreparingPreview(false);
    }
  }, [
    baseCurrencyCode,
    companyInfo,
    currencyCodeById,
    customerAddressOptions,
    customerOptions,
    exchangeRateMap,
    isPreparingPreview,
    previewShowTotalPrice,
    productOptions,
    selectedQuotation,
    serviceOptions,
    shippingMethodOptions,
  ]);

  useEffect(() => {
    if (!isPreviewOpen || !selectedQuotation) {
      return;
    }

    try {
      const previewOptions = {
        quotation: selectedQuotation,
        companyInfo: Array.isArray(companyInfo) ? companyInfo[0] : null,
        customerOptions,
        customerAddressOptions,
        shippingMethodOptions,
        productOptions,
        serviceOptions,
        currencyCodeById,
        baseCurrencyCode,
        exchangeRateMap,
      };
      const html = previewPrintArInvoice
        ? buildArInvoiceDocumentA4Html(previewOptions)
        : buildQuotationDocumentA4Html({
            ...previewOptions,
            showTotalPrice: previewShowTotalPrice,
          });
      setPreviewHtml(html);
    } catch (error) {
      console.error('Failed to refresh quotation preview:', error);
    }
  }, [
    baseCurrencyCode,
    companyInfo,
    currencyCodeById,
    customerAddressOptions,
    customerOptions,
    exchangeRateMap,
    isPreviewOpen,
    previewPrintArInvoice,
    previewShowTotalPrice,
    productOptions,
    selectedQuotation,
    serviceOptions,
    shippingMethodOptions,
  ]);

  const hasSelectedArInvoiceRows = useCallback(() => {
    const shippingRows = Array.isArray(selectedQuotation?.sales_shipping_prices)
      ? selectedQuotation.sales_shipping_prices
      : [];
    const productRows = Array.isArray(selectedQuotation?.sales_product_details)
      ? selectedQuotation.sales_product_details
      : [];
    const serviceRows = Array.isArray(selectedQuotation?.sales_service_details)
      ? selectedQuotation.sales_service_details
      : [];

    const hasSelectedArRows =
      shippingRows.some((row) => isSelectedFlag(row?.ari_selected, true)) ||
      productRows.some((row) => isSelectedFlag(row?.ari_selected, true)) ||
      serviceRows.some((row) => isSelectedFlag(row?.ari_selected, true));

    return hasSelectedArRows;
  }, [selectedQuotation]);

  const handlePreviewArInvoiceChange = useCallback(
    (event) => {
      const shouldPrintArInvoice = event.target.checked;

      if (shouldPrintArInvoice && !hasSelectedArInvoiceRows()) {
        alert(
          'No rows are selected for AR invoice preview. Tick AR Invoice on at least one row.',
        );
        return;
      }

      setPreviewPrintArInvoice(shouldPrintArInvoice);
      setPreviewType(shouldPrintArInvoice ? 'ar-invoice' : 'quotation');
    },
    [hasSelectedArInvoiceRows],
  );

  const handlePrintFromPreview = useCallback(() => {
    const iframe = previewIframeRef.current;
    const iframeWindow = iframe?.contentWindow;

    if (!iframeWindow) {
      alert('Preview is not ready yet. Please try again.');
      return;
    }

    const titleMatch = String(previewHtml || '').match(
      /<title>([^<]+)<\/title>/i,
    );
    const desiredTitle = String(titleMatch?.[1] || '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    const originalTitle = document.title;
    if (desiredTitle) {
      document.title = desiredTitle;
      try {
        iframeWindow.document.title = desiredTitle;
      } catch (error) {
        console.warn('Unable to set iframe print title:', error);
      }
    }

    let restored = false;
    const restoreTitle = () => {
      if (restored) return;
      restored = true;
      document.title = originalTitle;
    };

    window.addEventListener('afterprint', restoreTitle, { once: true });
    setTimeout(restoreTitle, 2000);

    iframeWindow.focus();
    iframeWindow.print();
  }, [previewHtml]);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const handleInputScroll = useCallback((event) => {
    const nextCompact = Number(event?.currentTarget?.scrollTop || 0) > 8;
    setIsSummaryCompact((previous) => {
      if (previous === nextCompact) {
        return previous;
      }

      return nextCompact;
    });
  }, []);

  return (
    <SalesQuotationSavePageContainer
      onSave={handleSaveQuotation}
      dryRunAction={getSalesQuotationDryRunData}
      saveButtonText="Save Sales Quotation"
      successMessage="Sales quotation saved successfully!"
      onCreate={handleCreateQuotation}
      createButtonText="Add Quotation"
      showCreateButton
      onPrint={handlePreviewQuotation}
      isPrinting={isPreparingPreview}
      showPrintButton
      leftBottomAction={
        <div className={styles.bottomActionGroup}>
          <DeleteBtn
            text={isDeleting ? 'Deleting...' : 'Delete Quotation'}
            onClick={handleDeleteQuotation}
            disabled={!selectedQuotation || isDeleting}
            title="Delete selected sales quotation"
            ariaLabel="Delete selected sales quotation"
          />
          <button
            type="button"
            className={styles.duplicateBottomButton}
            onClick={handleDuplicateQuotation}
            disabled={!selectedQuotation || isDuplicating}
            title="Duplicate selected sales quotation"
            aria-label="Duplicate selected sales quotation"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="5.5" y="5.5" width="7" height="7" rx="1" />
              <path d="M10.5 5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1H5" />
            </svg>
            {isDuplicating ? 'Duplicating...' : 'Duplicate Quotation'}
          </button>
        </div>
      }
    >
      <div className={styles.masterContainer}>
        <SalesQuotationSidebar
          quotations={quotations}
          selectedQuotationId={selectedQuotationId}
          onSelectQuotation={handleSelectQuotation}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
          customerOptions={customerOptions}
          productOptions={productOptions}
          baseCurrencyCode={baseCurrencyCode}
          currencyCodeById={currencyCodeById}
          exchangeRateMap={exchangeRateMap}
        />

        <div
          className={`${styles.container} ${
            sidebarCollapsed ? styles.fullWidth : ''
          }`}
        >
          <div className={styles.inputSide} onScroll={handleInputScroll}>
            {selectedQuotation ? (
              <>
                <div
                  className={`${styles.currencySummaryBar} ${
                    isSummaryCompact ? styles.currencySummaryBarCompact : ''
                  }`}
                >
                  {!isSummaryCompact ? (
                    <div className={styles.baseCurrencyPicker}>
                      <span className={styles.baseCurrencyLabel}>
                        Base Currency
                      </span>
                      <Main_Dropdown
                        defaultOptions={baseCurrencyOptions}
                        defaultSelectedOption={baseCurrencyCode}
                        onChange={(ov, nv) =>
                          setBaseCurrencyCode(
                            toSafeString(nv).toUpperCase() || 'USD',
                          )
                        }
                        size="S"
                      />
                      <span className={styles.rateMetaText}>
                        Rate Date:{' '}
                        {toSafeString(latestExchangeRateRow?.Date) || '-'}
                      </span>
                    </div>
                  ) : null}

                  <div
                    className={`${styles.totalsSummaryGrid} ${
                      isSummaryCompact ? styles.totalsSummaryGridCompact : ''
                    }`}
                  >
                    {isSummaryCompact ? (
                      <>
                        <div className={styles.totalCard}>
                          <span className={styles.totalLabel}>Total Cost</span>
                          <span className={styles.totalValue}>
                            {totalsSummary.baseCurrencyCode}{' '}
                            {formatMoney(totalsSummary.costGrandTotal)}
                          </span>
                        </div>
                        <div className={styles.totalCard}>
                          <span className={styles.totalLabel}>Profit</span>
                          <span className={styles.totalValue}>
                            {totalsSummary.baseCurrencyCode}{' '}
                            {formatMoney(totalsSummary.profitAmount)}
                          </span>
                        </div>
                        <div className={styles.totalCard}>
                          <span className={styles.totalLabel}>
                            Profit % (vs Cost)
                          </span>
                          <span className={styles.totalValue}>
                            {formatPercent(totalsSummary.profitPercent)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.totalCard}>
                          <span className={styles.totalLabel}>
                            Shipping Sales (Selected)
                          </span>
                          <span className={styles.totalValue}>
                            {totalsSummary.baseCurrencyCode}{' '}
                            {formatMoney(totalsSummary.shipping)}
                          </span>
                        </div>
                        <div className={styles.totalCard}>
                          <span className={styles.totalLabel}>
                            Product Sales (Selected)
                          </span>
                          <span className={styles.totalValue}>
                            {totalsSummary.baseCurrencyCode}{' '}
                            {formatMoney(totalsSummary.product)}
                          </span>
                        </div>
                        <div className={styles.totalCard}>
                          <span className={styles.totalLabel}>
                            Service Sales (Selected)
                          </span>
                          <span className={styles.totalValue}>
                            {totalsSummary.baseCurrencyCode}{' '}
                            {formatMoney(totalsSummary.service)}
                          </span>
                        </div>
                        <div
                          className={`${styles.totalCard} ${styles.totalCardHighlight}`}
                        >
                          <span className={styles.totalLabel}>Total Sales</span>
                          <span className={styles.totalValueStrong}>
                            {totalsSummary.baseCurrencyCode}{' '}
                            {formatMoney(totalsSummary.grandTotal)}
                          </span>
                        </div>
                        <div className={styles.totalCard}>
                          <span className={styles.totalLabel}>Total Cost</span>
                          <span className={styles.totalValue}>
                            {totalsSummary.baseCurrencyCode}{' '}
                            {formatMoney(totalsSummary.costGrandTotal)}
                          </span>
                        </div>
                        <div className={styles.totalCard}>
                          <span className={styles.totalLabel}>Profit</span>
                          <span className={styles.totalValue}>
                            {totalsSummary.baseCurrencyCode}{' '}
                            {formatMoney(totalsSummary.profitAmount)}
                          </span>
                        </div>
                        <div className={styles.totalCard}>
                          <span className={styles.totalLabel}>
                            Profit % (vs Cost)
                          </span>
                          <span className={styles.totalValue}>
                            {formatPercent(totalsSummary.profitPercent)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {!isSummaryCompact && totalsSummary.missingCount > 0 ? (
                    <div className={styles.totalWarningText}>
                      Sales skipped: {totalsSummary.salesMissingCount} row(s),
                      Cost skipped: {totalsSummary.costMissingCount} row(s) due
                      to missing currency or exchange rate.
                    </div>
                  ) : null}
                </div>

                <Main_SalesBasicInfo
                  quotation={selectedQuotation}
                  customerOptions={customerOptions}
                  customerAddressOptions={customerAddressOptions}
                  onPatchQuotation={patchSelectedQuotation}
                  onRefreshReferenceOptions={refreshReferenceOptions}
                />

                <Main_SalesShippingDetails
                  quotation={selectedQuotation}
                  customerAddressOptions={customerAddressOptions}
                  supplierOptions={supplierOptions}
                  shippingMethodOptions={shippingMethodOptions}
                  currencyOptions={currencyOptions}
                  incotermOptions={incotermOptions}
                  onPatchQuotation={patchSelectedQuotation}
                  onRefreshReferenceOptions={refreshReferenceOptions}
                />

                <Main_SalesProductDetails
                  quotation={selectedQuotation}
                  productOptions={productOptions}
                  currencyOptions={currencyOptions}
                  onPatchQuotation={patchSelectedQuotation}
                />

                <Main_SalesServiceDetails
                  quotation={selectedQuotation}
                  supplierOptions={supplierOptions}
                  serviceOptions={serviceOptions}
                  currencyOptions={currencyOptions}
                  onPatchQuotation={patchSelectedQuotation}
                />
              </>
            ) : (
              <div className={styles.emptyState}>
                {isSalesQuotationsLoading
                  ? 'Loading sales quotations...'
                  : 'No sales quotation selected. Create a new one from the sidebar.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {isPreviewOpen ? (
        <div
          className={styles.previewModalBackdrop}
          onClick={handleClosePreview}
        >
          <div
            className={styles.previewModalWindow}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.previewModalHeader}>
              <div className={styles.previewModalTitle}>
                {previewType === 'ar-invoice'
                  ? 'AR Invoice A4 Preview'
                  : 'Quotation A4 Preview'}
              </div>
              <div className={styles.previewModalActions}>
                <label className={styles.previewOptionToggle}>
                  <input
                    type="checkbox"
                    checked={previewShowTotalPrice}
                    onChange={(event) =>
                      setPreviewShowTotalPrice(event.target.checked)
                    }
                  />
                  <span>Show Total Price</span>
                </label>
                <label className={styles.previewOptionToggle}>
                  <input
                    type="checkbox"
                    checked={previewPrintArInvoice}
                    onChange={handlePreviewArInvoiceChange}
                  />
                  <span>Print AR Invoice</span>
                </label>
                <button
                  type="button"
                  className={styles.previewActionBtn}
                  onClick={handlePrintFromPreview}
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  className={styles.previewCloseBtn}
                  onClick={handleClosePreview}
                >
                  Close
                </button>
              </div>
            </div>

            <div className={styles.previewFrameWrap}>
              <iframe
                ref={previewIframeRef}
                title={
                  previewType === 'ar-invoice'
                    ? 'AR Invoice Preview'
                    : 'Quotation Preview'
                }
                className={styles.previewFrame}
                srcDoc={previewHtml}
              />
            </div>
          </div>
        </div>
      ) : null}
    </SalesQuotationSavePageContainer>
  );
};

export default Main_SalesQuotation;
