import { useCallback, useState } from 'react';
import styles from './Main_SalesQuotation.module.css';
import SalesQuotationSavePageContainer from './Container/SalesQuotationSavePageContainer';
import SalesQuotationSidebar from './AllSalesQuotationList/SalesQuotationSidebar';
import Main_SalesBasicInfo from './SalesBasicInfo/Main_SalesBasicInfo';
import Main_SalesShippingDetails from './ShippingDetails/Main_SalesShippingDetails';
import Main_SalesProductDetails from './ProductDetails/Main_SalesProductDetails';
import Main_SalesServiceDetails from './ServiceDetails/Main_SalesServiceDetails';
import { useSalesQuotationContext } from '../../../store/SalesQuotationContext';

const Main_SalesQuotation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    quotations,
    selectedQuotationId,
    setSelectedQuotationId,
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
    getSalesQuotationDryRunData,
  } = useSalesQuotationContext();

  const patchSelectedQuotation = useCallback(
    (patch) => {
      if (!selectedQuotationId) return;

      patchSalesQuotationInContext(patch);
    },
    [patchSalesQuotationInContext, selectedQuotationId],
  );

  const handleSelectQuotation = useCallback(
    (quotation) => {
      setSelectedQuotationId(String(quotation?.id || ''));
    },
    [setSelectedQuotationId],
  );

  const handleCreateQuotation = useCallback(async () => {
    await createSalesQuotation();
  }, [createSalesQuotation]);

  const handleSaveQuotation = useCallback(async () => {
    await saveSelectedQuotation();
  }, [saveSelectedQuotation]);

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
        />

        <div
          className={`${styles.container} ${
            sidebarCollapsed ? styles.fullWidth : ''
          }`}
        >
          <div className={styles.inputSide}>
            {selectedQuotation ? (
              <>
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
