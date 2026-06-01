import { useCallback, useState } from 'react';
import styles from './Main_SalesQuotation.module.css';
import SalesQuotationSavePageContainer from './Container/SalesQuotationSavePageContainer';
import SalesQuotationSidebar from './AllSalesQuotationList/SalesQuotationSidebar';
import Main_SalesBasicInfo from './SalesBasicInfo/Main_SalesBasicInfo';
import Main_SalesShippingDetails from './ShippingDetails/Main_SalesShippingDetails';
import Main_SalesProductDetails from './ProductDetails/Main_SalesProductDetails';
import Main_SalesServiceDetails from './ServiceDetails/Main_SalesServiceDetails';
import { useSalesQuotationContext } from '../../../store/SalesQuotationContext';
import DeleteBtn from '../../common/Buttons/DeleteBtn';

const Main_SalesQuotation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
