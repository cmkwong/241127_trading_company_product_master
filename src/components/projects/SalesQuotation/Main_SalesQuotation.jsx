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
import bottomBarDeleteStyles from '../../common/Buttons/BottomBarDeleteAction.module.css';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';
import {
  buildBaseCurrencyOptions,
  buildCurrencyCodeById,
  buildExchangeRateMap,
  buildNormalizedCurrencies,
  computeQuotationTotals,
  formatMoney,
  getLatestExchangeRateRow,
  toSafeString,
} from './utils/quotationTotals';
import { buildQuotationDocumentA4Html } from './utils/quotationPrint';

const formatPercent = (value) => {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return `${value.toFixed(2)}%`;
};

const Main_SalesQuotation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('HKD');
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
    patchSelectedQuotation: patchSalesQuotationInContext,
    saveSelectedQuotation,
    createSalesQuotation,
    deleteSalesQuotation,
    getSalesQuotationDryRunData,
    refreshReferenceOptions,
  } = useSalesQuotationContext();
  const { currencies, exchangeRateHkd, fetchMasterData } = useMasterContext();

  useEffect(() => {
    refreshReferenceOptions();
    fetchMasterData('master_exchange_rate_hkd');
    fetchMasterData('master_currencies');
  }, [fetchMasterData, refreshReferenceOptions]);

  useEffect(() => {
    const handleWindowFocus = () => {
      refreshReferenceOptions();
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
      if (baseCurrencyCode !== 'HKD') {
        setBaseCurrencyCode('HKD');
      }
      return;
    }

    const exists = baseCurrencyOptions.some(
      (item) => toSafeString(item?.id) === toSafeString(baseCurrencyCode),
    );

    if (!exists) {
      setBaseCurrencyCode(toSafeString(baseCurrencyOptions[0]?.id) || 'HKD');
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
      const html = buildQuotationDocumentA4Html({
        quotation: selectedQuotation,
        customerOptions,
        customerAddressOptions,
        supplierOptions,
        productOptions,
        serviceOptions,
        currencyCodeById,
        baseCurrencyCode,
        exchangeRateMap,
      });

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
    currencyCodeById,
    customerAddressOptions,
    customerOptions,
    exchangeRateMap,
    isPreparingPreview,
    productOptions,
    selectedQuotation,
    serviceOptions,
    supplierOptions,
  ]);

  const handlePrintFromPreview = useCallback(() => {
    const iframe = previewIframeRef.current;
    const iframeWindow = iframe?.contentWindow;

    if (!iframeWindow) {
      alert('Preview is not ready yet. Please try again.');
      return;
    }

    iframeWindow.focus();
    iframeWindow.print();
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return (
    <SalesQuotationSavePageContainer
      onSave={handleSaveQuotation}
      dryRunAction={getSalesQuotationDryRunData}
      saveButtonText="Save Sales Quotation"
      successMessage="Sales quotation saved successfully!"
      leftBottomAction={
        <DeleteBtn
          text={isDeleting ? 'Deleting...' : 'Delete Quotation'}
          onClick={handleDeleteQuotation}
          disabled={!selectedQuotation || isDeleting}
          title="Delete selected sales quotation"
          ariaLabel="Delete selected sales quotation"
          className={bottomBarDeleteStyles.bottomBarDeleteAction}
        />
      }
    >
      <div className={styles.masterContainer}>
        <SalesQuotationSidebar
          quotations={quotations}
          selectedQuotationId={selectedQuotationId}
          onSelectQuotation={handleSelectQuotation}
          onCreateQuotation={handleCreateQuotation}
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
          <div className={styles.inputSide}>
            {selectedQuotation ? (
              <>
                <div className={styles.quotationActions}>
                  <button
                    type="button"
                    className={styles.printButton}
                    onClick={handlePreviewQuotation}
                    disabled={isPreparingPreview}
                  >
                    {isPreparingPreview
                      ? 'Preparing Preview...'
                      : 'Preview / Print Quotation (A4 PDF)'}
                  </button>
                </div>

                <div className={styles.currencySummaryBar}>
                  <div className={styles.baseCurrencyPicker}>
                    <span className={styles.baseCurrencyLabel}>
                      Base Currency
                    </span>
                    <Main_Dropdown
                      defaultOptions={baseCurrencyOptions}
                      defaultSelectedOption={baseCurrencyCode}
                      onChange={(ov, nv) =>
                        setBaseCurrencyCode(
                          toSafeString(nv).toUpperCase() || 'HKD',
                        )
                      }
                      size="S"
                    />
                    <span className={styles.rateMetaText}>
                      Rate Date:{' '}
                      {toSafeString(latestExchangeRateRow?.Date) || '-'}
                    </span>
                  </div>

                  <div className={styles.totalsSummaryGrid}>
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
                  </div>

                  {totalsSummary.missingCount > 0 ? (
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
                />

                <Main_SalesShippingDetails
                  quotation={selectedQuotation}
                  customerAddressOptions={customerAddressOptions}
                  supplierOptions={supplierOptions}
                  currencyOptions={currencyOptions}
                  incotermOptions={incotermOptions}
                  onPatchQuotation={patchSelectedQuotation}
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
                Quotation A4 Preview
              </div>
              <div className={styles.previewModalActions}>
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
                title="Quotation Preview"
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
