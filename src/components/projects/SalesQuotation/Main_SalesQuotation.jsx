import { useCallback, useEffect, useMemo, useState } from 'react';
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
  toSafeString,
} from './utils/quotationTotals';

const Main_SalesQuotation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('HKD');
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

  return (
    <SalesQuotationSavePageContainer
      onSave={handleSaveQuotation}
      dryRunAction={getSalesQuotationDryRunData}
      saveButtonText="Save Sales Quotation"
      successMessage="Sales quotation saved successfully!"
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
                        Shipping (Selected)
                      </span>
                      <span className={styles.totalValue}>
                        {totalsSummary.baseCurrencyCode}{' '}
                        {formatMoney(totalsSummary.shipping)}
                      </span>
                    </div>
                    <div className={styles.totalCard}>
                      <span className={styles.totalLabel}>Product Total</span>
                      <span className={styles.totalValue}>
                        {totalsSummary.baseCurrencyCode}{' '}
                        {formatMoney(totalsSummary.product)}
                      </span>
                    </div>
                    <div className={styles.totalCard}>
                      <span className={styles.totalLabel}>Service Total</span>
                      <span className={styles.totalValue}>
                        {totalsSummary.baseCurrencyCode}{' '}
                        {formatMoney(totalsSummary.service)}
                      </span>
                    </div>
                    <div
                      className={`${styles.totalCard} ${styles.totalCardHighlight}`}
                    >
                      <span className={styles.totalLabel}>Quotation Total</span>
                      <span className={styles.totalValueStrong}>
                        {totalsSummary.baseCurrencyCode}{' '}
                        {formatMoney(totalsSummary.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {totalsSummary.missingCount > 0 ? (
                    <div className={styles.totalWarningText}>
                      {totalsSummary.missingCount} row(s) skipped due to missing
                      currency or exchange rate.
                    </div>
                  ) : null}
                </div>

                <div className={styles.quotationActions}>
                  <DeleteBtn
                    text={isDeleting ? 'Deleting...' : 'Delete Quotation'}
                    onClick={handleDeleteQuotation}
                    disabled={isDeleting}
                    title="Delete selected sales quotation"
                    ariaLabel="Delete selected sales quotation"
                  />
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
    </SalesQuotationSavePageContainer>
  );
};

export default Main_SalesQuotation;
