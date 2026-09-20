import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Main_SalesQuotation.module.css';
import SalesQuotationSavePageContainer from './Container/SalesQuotationSavePageContainer';
import SalesSidebar from './AllSalesQuotationList/SalesSidebar';
import Main_SalesBasicInfo from './SalesBasicInfo/Main_SalesBasicInfo';
import Main_SalesShippingDetails from './ShippingDetails/Main_SalesShippingDetails';
import Main_SalesProductDetails from './ProductDetails/Main_SalesProductDetails';
import Main_SalesServiceDetails from './ServiceDetails/Main_SalesServiceDetails';
import Main_SalesPackingItems from './PackingItems/Main_SalesPackingItems';
import SalesQuotationSummaryBar from './SalesQuotationSummaryBar/SalesQuotationSummaryBar';
import Main_DocumentCopy from '../DocumentCopy/Main_DocumentCopy';
import { useSalesQuotationContext } from '../../../store/SalesQuotationContext';
import {
  getEntityRecord,
  useEntityField,
  useEntityRows,
} from '../../../store/GeneralContext';
import { useMasterContext } from '../../../store/MasterContext';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import {
  buildBaseCurrencyOptions,
  buildCurrencyCodeById,
  buildExchangeRateMap,
  buildNormalizedCurrencies,
  getLatestExchangeRateRow,
  toSafeString,
} from './utils/quotationTotals';
import { buildQuotationDocumentA4Html } from './utils/printout/quotationPrint';
import { buildArInvoiceDocumentA4Html } from './utils/printout/arInvoicePrint';
import { buildSalesOrderDocumentA4Html } from './utils/printout/salesOrderPrint';
import { buildArDownpaymentInvoiceDocumentA4Html } from './utils/printout/arDownpaymentInvoicePrint';
import { buildDeliveryNoteDocumentA4Html } from './utils/printout/deliveryNotePrint';
import { buildPackingListDocumentA4Html } from './utils/printout/packingListPrint';
import Label from '../../common/Texts/Label';

const Main_SalesDocument = ({
  docTypeName = 'Sales Quotation',
  routePath = '/panel/sales',
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSummaryCompact, setIsSummaryCompact] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [previewType, setPreviewType] = useState('quotation');
  const [previewShowTotalPrice, setPreviewShowTotalPrice] = useState(true);
  const [previewPrintArInvoice, setPreviewPrintArInvoice] = useState(false);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('USD');
  const previewIframeRef = useRef(null);
  const handledQuotationIdRef = useRef(null);
  const navigate = useNavigate();
  const { quotation_id } = useParams();
  const {
    quotations,
    selectedQuotationId,
    selectSalesQuotation,
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
    createSalesDocument,
    duplicateSelectedSalesQuotation,
    copySelectedSalesQuotation,
    deleteSalesQuotation,
    getSalesQuotationDryRunData,
    refreshReferenceOptions,
    purchaseCosts,
  } = useSalesQuotationContext();
  const currentQuotationId = useEntityField('sales_quotations', 'id');
  const currentDocTypeId = useEntityField('sales_quotations', 'doc_type');
  const productDetailRows = useEntityRows(
    'sales_quotations',
    'sales_product_details',
  );
  const serviceDetailRows = useEntityRows(
    'sales_quotations',
    'sales_service_details',
  );
  const shippingDetailRows = useEntityRows(
    'sales_quotations',
    'sales_shipping_details',
  );
  const shippingPriceRows = useEntityRows(
    'sales_quotations',
    'sales_shipping_prices',
  );

  const selectSalesQuotationRef = useRef(selectSalesQuotation);
  const {
    companyInfo,
    currencies,
    exchangeRateHkd,
    fetchMasterData,
    getDocTypeTargetsByBaseId,
    getDocTypeIdByName,
    docType,
  } = useMasterContext();

  const docTypeId = useMemo(
    () => getDocTypeIdByName(docTypeName),
    [getDocTypeIdByName, docTypeName],
  );
  const isSalesQuotationDoc = docTypeName === 'Sales Quotation';
  const isSalesOrderDoc = docTypeName === 'Sales Order';
  const isArInvoiceDoc = docTypeName === 'AR Invoice';
  const isArDownpaymentDoc = docTypeName === 'AR Downpayment Invoice';
  const isDeliveryNoteDoc = docTypeName === 'Delivery Note';
  const isPackingListDoc = docTypeName === 'Packing List';

  const scopedQuotations = useMemo(() => {
    if (!docTypeId) return quotations || [];
    return (quotations || []).filter(
      (item) => toSafeString(item?.doc_type) === docTypeId,
    );
  }, [docTypeId, quotations]);

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

  const patchSelectedQuotation = useCallback(
    (patch) => {
      if (!selectedQuotationId) return;

      patchSalesQuotationInContext(patch);
    },
    [patchSalesQuotationInContext, selectedQuotationId],
  );

  const handleSelectQuotation = useCallback(
    (quotation) => {
      const id = String(quotation?.id || '');
      const selected = selectSalesQuotation(id);
      if (selected) {
        navigate(`${routePath}/${id}`, { replace: true });
      }
    },
    [selectSalesQuotation, navigate, routePath],
  );

  useEffect(() => {
    selectSalesQuotationRef.current = selectSalesQuotation;
  }, [selectSalesQuotation]);

  useEffect(() => {
    const routeId = String(quotation_id || '').trim();

    if (!routeId) {
      const selectedIsInScope = (scopedQuotations || []).some(
        (item) =>
          String(item?.id || '').trim() ===
          String(selectedQuotationId || '').trim(),
      );

      if (!selectedIsInScope && (scopedQuotations || []).length > 0) {
        const firstId = String(scopedQuotations[0]?.id || '').trim();
        if (firstId) {
          handledQuotationIdRef.current = firstId;
          selectSalesQuotationRef.current(firstId);
        }
      } else {
        handledQuotationIdRef.current = '';
      }
      return;
    }

    if (String(selectedQuotationId || '').trim() === routeId) {
      handledQuotationIdRef.current = routeId;
      return;
    }

    if (handledQuotationIdRef.current === routeId) {
      return;
    }

    const exists = (scopedQuotations || []).some(
      (item) => String(item?.id || '').trim() === routeId,
    );
    if (!exists) return;

    handledQuotationIdRef.current = routeId;
    selectSalesQuotationRef.current(routeId);
  }, [
    quotation_id,
    scopedQuotations,
    selectedQuotationId,
    selectSalesQuotation,
  ]);

  const handleCreateQuotation = useCallback(async () => {
    const created = await createSalesDocument(docTypeName);
    if (created?.id) {
      navigate(`${routePath}/${created.id}`, { replace: true });
    }
  }, [createSalesDocument, docTypeName, navigate, routePath]);

  const handleSaveQuotation = useCallback(async () => {
    await saveSelectedQuotation();
  }, [saveSelectedQuotation]);

  const handleDuplicateQuotation = useCallback(async () => {
    const selectedQuotation = getEntityRecord('sales_quotations');
    console.log('selectedQuotation: ', selectedQuotation);
    if (
      !selectedQuotation ||
      !toSafeString(selectedQuotation?.id) ||
      isDuplicating
    ) {
      return;
    }

    setIsDuplicating(true);
    try {
      const duplicated = await duplicateSelectedSalesQuotation();
      if (duplicated?.id) {
        navigate(`${routePath}/${duplicated.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to duplicate sales quotation:', error);
      alert(error?.message || 'Failed to duplicate sales quotation.');
    } finally {
      setIsDuplicating(false);
    }
  }, [duplicateSelectedSalesQuotation, isDuplicating, navigate, routePath]);

  const productNameById = useMemo(() => {
    const map = new Map();
    (productOptions || []).forEach((item) => {
      const id = toSafeString(item?.id);
      if (id) map.set(id, toSafeString(item?.name) || id);
    });
    return map;
  }, [productOptions]);

  const serviceNameById = useMemo(() => {
    const map = new Map();
    (serviceOptions || []).forEach((item) => {
      const id = toSafeString(item?.id);
      if (id) map.set(id, toSafeString(item?.name) || id);
    });
    return map;
  }, [serviceOptions]);

  const supplierNameById = useMemo(() => {
    const map = new Map();
    (supplierOptions || []).forEach((item) => {
      const id = toSafeString(item?.id);
      if (id) map.set(id, toSafeString(item?.name) || id);
    });
    return map;
  }, [supplierOptions]);

  const shippingMethodNameById = useMemo(() => {
    const map = new Map();
    (shippingMethodOptions || []).forEach((item) => {
      const id = toSafeString(item?.id);
      if (id) map.set(id, toSafeString(item?.name) || id);
    });
    return map;
  }, [shippingMethodOptions]);

  const documentCopyTargetOptions = useMemo(
    () => getDocTypeTargetsByBaseId(currentDocTypeId),
    [getDocTypeTargetsByBaseId, currentDocTypeId],
  );

  const documentCopyItems = useMemo(() => {
    const amountOf = (price, qty, discount) =>
      (Number(price) || 0) *
      (Number(qty) || 0) *
      (1 - (Number(discount) || 0) / 100);

    const isSelectedFlag = (value) =>
      value === true || value === 1 || value === '1';

    const shippingPriceByDetailId = new Map();
    (Array.isArray(shippingPriceRows) ? shippingPriceRows : []).forEach(
      (priceRow) => {
        const detailId = toSafeString(priceRow?.sales_shipping_detail_id);
        if (!detailId) return;
        const existing = shippingPriceByDetailId.get(detailId);
        if (
          !existing ||
          (isSelectedFlag(priceRow?.selected) &&
            !isSelectedFlag(existing?.selected))
        ) {
          shippingPriceByDetailId.set(detailId, priceRow);
        }
      },
    );

    const toItem = (row, sourceType, title, detailLines = []) => {
      const qty = Number(row?.qty ?? row?.quantity) || 0;
      return {
        key: `${sourceType}:${toSafeString(row?.id)}`,
        id: toSafeString(row?.id),
        sourceType,
        title: title || toSafeString(row?.id),
        subtitle: toSafeString(row?.details),
        meta: '',
        detailLines,
        qty,
        unitRate: row?.price != null ? Number(row?.price) : null,
        discountPercent:
          row?.discount_percent != null ? Number(row?.discount_percent) : null,
        amount: amountOf(row?.price, qty, row?.discount_percent),
      };
    };

    const items = [];

    (Array.isArray(shippingDetailRows) ? shippingDetailRows : []).forEach(
      (row, index) => {
        const priceRow = shippingPriceByDetailId.get(toSafeString(row?.id));
        const supplierName =
          supplierNameById.get(toSafeString(priceRow?.supplier_id)) || '';
        const methodName =
          toSafeString(priceRow?.override_shipping_method_name) ||
          shippingMethodNameById.get(
            toSafeString(priceRow?.shipping_method_id),
          ) ||
          '';

        const qty = Number(row?.qty ?? row?.quantity) || 0;
        const dims = [row?.width, row?.length, row?.height].filter(
          (value) => value != null && value !== '',
        );
        const dimText = dims.length > 0 ? `${dims.join(' \u00d7 ')} cm` : '';

        const cartonParts = [];
        if (dimText) cartonParts.push(dimText);
        if (qty > 0) cartonParts.push(`Qty ${qty}`);
        if (row?.weight != null && row?.weight !== '') {
          cartonParts.push(`${Number(row.weight)} kg/carton`);
        }

        const detailLines = [];
        if (supplierName) detailLines.push(`Supplier: ${supplierName}`);
        if (methodName) detailLines.push(`Shipping Method: ${methodName}`);
        if (cartonParts.length > 0) {
          detailLines.push(`Carton: ${cartonParts.join(' \u00b7 ')}`);
        }

        const shippingRow = {
          ...(row || {}),
          price: priceRow?.price,
          discount_percent: priceRow?.discount_percent,
        };

        items.push(
          toItem(shippingRow, 'shipping', `Shipping ${index + 1}`, detailLines),
        );
      },
    );

    (Array.isArray(productDetailRows) ? productDetailRows : []).forEach(
      (row, index) =>
        items.push(
          toItem(
            row,
            'product',
            productNameById.get(toSafeString(row?.product_id)) ||
              `Product ${index + 1}`,
          ),
        ),
    );
    (Array.isArray(serviceDetailRows) ? serviceDetailRows : []).forEach(
      (row, index) =>
        items.push(
          toItem(
            row,
            'service',
            serviceNameById.get(toSafeString(row?.service_id)) ||
              `Service ${index + 1}`,
          ),
        ),
    );
    return items;
  }, [
    shippingDetailRows,
    shippingPriceRows,
    productDetailRows,
    serviceDetailRows,
    productNameById,
    serviceNameById,
    supplierNameById,
    shippingMethodNameById,
  ]);

  const handleOpenCopy = useCallback(() => {
    if (!toSafeString(currentQuotationId || selectedQuotationId)) return;
    setIsCopyOpen(true);
  }, [currentQuotationId, selectedQuotationId]);

  const handleCopyConfirm = useCallback(
    async ({ selectedItems, targetDocTypeId }) => {
      if (isCopying) return;
      setIsCopying(true);
      try {
        const duplicated = await copySelectedSalesQuotation({
          selectedItems,
          targetDocTypeId,
        });
        setIsCopyOpen(false);
        if (duplicated?.id) {
          navigate(`${routePath}/${duplicated.id}`, {
            replace: true,
          });
        }
      } catch (error) {
        console.error('Failed to copy document:', error);
        alert(error?.message || 'Failed to copy document.');
      } finally {
        setIsCopying(false);
      }
    },
    [copySelectedSalesQuotation, isCopying, navigate, routePath],
  );

  const handleDeleteQuotation = useCallback(async () => {
    const selectedQuotation = getEntityRecord('sales_quotations');
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
      navigate(routePath, { replace: true });
    } catch (error) {
      console.error('Failed to delete sales quotation:', error);
      alert(error?.message || 'Failed to delete sales quotation.');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteSalesQuotation, isDeleting, navigate, routePath]);

  const handlePreviewQuotation = useCallback(() => {
    const selectedQuotation = getEntityRecord('sales_quotations');
    if (!selectedQuotation || isPreparingPreview) {
      return;
    }

    try {
      setIsPreparingPreview(true);
      setPreviewPrintArInvoice(false);
      const previewOptions = {
        quotation: selectedQuotation,
        allDocuments: quotations,
        docTypeOptions: docType,
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
      };
      const html = isPackingListDoc
        ? buildPackingListDocumentA4Html(previewOptions)
        : isSalesOrderDoc
          ? buildSalesOrderDocumentA4Html(previewOptions)
          : isArInvoiceDoc
            ? buildArInvoiceDocumentA4Html(previewOptions)
            : isArDownpaymentDoc
              ? buildArDownpaymentInvoiceDocumentA4Html(previewOptions)
              : isDeliveryNoteDoc
                ? buildDeliveryNoteDocumentA4Html(previewOptions)
                : buildQuotationDocumentA4Html(previewOptions);

      setPreviewType(
        isPackingListDoc
          ? 'packing-list'
          : isSalesOrderDoc
            ? 'sales-order'
            : isArInvoiceDoc
              ? 'ar-invoice'
              : isArDownpaymentDoc
                ? 'ar-downpayment-invoice'
                : isDeliveryNoteDoc
                  ? 'delivery-note'
                  : 'quotation',
      );
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
    docType,
    exchangeRateMap,
    isArInvoiceDoc,
    isArDownpaymentDoc,
    isDeliveryNoteDoc,
    isPackingListDoc,
    isPreparingPreview,
    isSalesOrderDoc,
    previewShowTotalPrice,
    productOptions,
    quotations,
    serviceOptions,
    shippingMethodOptions,
  ]);

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    const selectedQuotation = getEntityRecord('sales_quotations');
    if (!selectedQuotation || !toSafeString(selectedQuotation?.id)) {
      return;
    }

    try {
      const previewOptions = {
        quotation: selectedQuotation,
        allDocuments: quotations,
        docTypeOptions: docType,
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
      const html = isPackingListDoc
        ? buildPackingListDocumentA4Html(previewOptions)
        : isSalesOrderDoc
          ? buildSalesOrderDocumentA4Html({
              ...previewOptions,
              showTotalPrice: previewShowTotalPrice,
            })
          : isArInvoiceDoc
            ? buildArInvoiceDocumentA4Html({
                ...previewOptions,
                showTotalPrice: previewShowTotalPrice,
              })
            : isArDownpaymentDoc
              ? buildArDownpaymentInvoiceDocumentA4Html({
                  ...previewOptions,
                  showTotalPrice: previewShowTotalPrice,
                })
              : isDeliveryNoteDoc
                ? buildDeliveryNoteDocumentA4Html(previewOptions)
                : previewPrintArInvoice && isSalesQuotationDoc
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
    docType,
    exchangeRateMap,
    isArInvoiceDoc,
    isArDownpaymentDoc,
    isDeliveryNoteDoc,
    isPackingListDoc,
    isSalesOrderDoc,
    isSalesQuotationDoc,
    isPreviewOpen,
    previewPrintArInvoice,
    previewShowTotalPrice,
    productOptions,
    quotations,
    serviceOptions,
    shippingMethodOptions,
  ]);

  const handlePreviewArInvoiceChange = useCallback((event) => {
    const shouldPrintArInvoice = event.target.checked;

    setPreviewPrintArInvoice(shouldPrintArInvoice);
    setPreviewType(shouldPrintArInvoice ? 'ar-invoice' : 'quotation');
  }, []);

  const handlePrintFromPreview = useCallback(async () => {
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

    try {
      const iframeDocument = iframeWindow.document;
      if (iframeDocument?.fonts?.ready) {
        await iframeDocument.fonts.ready;
      }

      const images = Array.from(iframeDocument?.images || []);
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          if (typeof img.decode === 'function') {
            return img.decode().catch(() => undefined);
          }

          return new Promise((resolve) => {
            const cleanup = () => {
              img.removeEventListener('load', cleanup);
              img.removeEventListener('error', cleanup);
              resolve();
            };
            img.addEventListener('load', cleanup, { once: true });
            img.addEventListener('error', cleanup, { once: true });
          });
        }),
      );
    } catch (error) {
      console.warn('Print assets readiness check failed:', error);
    }

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

  const hasSelectedQuotation = Boolean(
    toSafeString(currentQuotationId || selectedQuotationId),
  );

  return (
    <SalesQuotationSavePageContainer
      onSave={handleSaveQuotation}
      dryRunAction={getSalesQuotationDryRunData}
      saveButtonText={`Save ${docTypeName}`}
      successMessage={`${docTypeName} saved successfully!`}
      onCreate={handleCreateQuotation}
      createButtonText={`Add ${docTypeName}`}
      showCreateButton
      onPrint={handlePreviewQuotation}
      isPrinting={isPreparingPreview}
      showPrintButton
      onCopyDocument={handleOpenCopy}
      isCopying={isCopying}
      showCopyDocumentButton
      leftBottomAction={
        <div className={styles.bottomActionGroup}>
          <DeleteBtn
            text={isDeleting ? 'Deleting...' : `Delete ${docTypeName}`}
            onClick={handleDeleteQuotation}
            disabled={!hasSelectedQuotation || isDeleting}
            title="Delete selected sales quotation"
            ariaLabel="Delete selected sales quotation"
          />
          <button
            type="button"
            className={styles.duplicateBottomButton}
            onClick={handleDuplicateQuotation}
            disabled={!hasSelectedQuotation || isDuplicating}
            title="Duplicate selected sales quotation"
            aria-label="Duplicate selected sales quotation"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="5.5" y="5.5" width="7" height="7" rx="1" />
              <path d="M10.5 5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1H5" />
            </svg>
            {isDuplicating ? 'Duplicating...' : `Duplicate ${docTypeName}`}
          </button>
        </div>
      }
    >
      <div className={styles.masterContainer}>
        <SalesSidebar
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
          docTypeOptions={docType}
          purchaseCosts={purchaseCosts}
          searchPlaceholder="Search sales documents..."
          noResultsMessage="No sales documents found"
          sidebarTitle="Sales List"
          exportFileName="sales_documents_filtered_list"
          exportSheetName="Sales Documents"
        />

        <div
          className={`${styles.container} ${
            sidebarCollapsed ? styles.fullWidth : ''
          }`}
        >
          <div className={styles.inputSide} onScroll={handleInputScroll}>
            {hasSelectedQuotation ? (
              <>
                <SalesQuotationSummaryBar
                  baseCurrencyCode={baseCurrencyCode}
                  onBaseCurrencyChange={setBaseCurrencyCode}
                  baseCurrencyOptions={baseCurrencyOptions}
                  latestExchangeRateRow={latestExchangeRateRow}
                  currencyCodeById={currencyCodeById}
                  exchangeRateMap={exchangeRateMap}
                  isCompact={isSummaryCompact}
                  purchaseCosts={purchaseCosts}
                  showBalances={!isPackingListDoc}
                />

                <Main_SalesBasicInfo
                  customerOptions={customerOptions}
                  customerAddressOptions={customerAddressOptions}
                  onPatchQuotation={patchSelectedQuotation}
                  onRefreshReferenceOptions={refreshReferenceOptions}
                  baseCurrencyCode={baseCurrencyCode}
                  currencyCodeById={currencyCodeById}
                  exchangeRateMap={exchangeRateMap}
                />

                {isPackingListDoc ? (
                  <Main_SalesPackingItems
                    productOptions={productOptions}
                    onPatchQuotation={patchSelectedQuotation}
                  />
                ) : (
                  <>
                    <Main_SalesShippingDetails
                      customerAddressOptions={customerAddressOptions}
                      supplierOptions={supplierOptions}
                      shippingMethodOptions={shippingMethodOptions}
                      currencyOptions={currencyOptions}
                      incotermOptions={incotermOptions}
                      onPatchQuotation={patchSelectedQuotation}
                      onRefreshReferenceOptions={refreshReferenceOptions}
                    />

                    <Main_SalesProductDetails
                      productOptions={productOptions}
                      currencyOptions={currencyOptions}
                      onPatchQuotation={patchSelectedQuotation}
                    />

                    <Main_SalesServiceDetails
                      supplierOptions={supplierOptions}
                      serviceOptions={serviceOptions}
                      currencyOptions={currencyOptions}
                      onPatchQuotation={patchSelectedQuotation}
                    />
                  </>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                {isSalesQuotationsLoading
                  ? 'Loading sales quotations...'
                  : `No ${docTypeName.toLowerCase()} selected. Create a new one from the sidebar.`}
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
                  : previewType === 'sales-order'
                    ? 'Sales Order A4 Preview'
                    : previewType === 'ar-downpayment-invoice'
                      ? 'AR Downpayment Invoice A4 Preview'
                      : previewType === 'delivery-note'
                        ? 'Delivery Note A4 Preview'
                        : previewType === 'packing-list'
                          ? 'Packing List A4 Preview'
                          : 'Quotation A4 Preview'}
              </div>
              <div className={styles.previewModalActions}>
                {previewType !== 'delivery-note' &&
                previewType !== 'packing-list' ? (
                  <Label className={styles.previewOptionToggle}>
                    <input
                      type="checkbox"
                      checked={previewShowTotalPrice}
                      onChange={(event) =>
                        setPreviewShowTotalPrice(event.target.checked)
                      }
                    />
                    <span>Show Total Price</span>
                  </Label>
                ) : null}
                {isSalesQuotationDoc ? (
                  <Label className={styles.previewOptionToggle}>
                    <input
                      type="checkbox"
                      checked={previewPrintArInvoice}
                      onChange={handlePreviewArInvoiceChange}
                    />
                    <span>Print AR Invoice</span>
                  </Label>
                ) : null}
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
                    : previewType === 'ar-downpayment-invoice'
                      ? 'AR Downpayment Invoice Preview'
                      : previewType === 'delivery-note'
                        ? 'Delivery Note Preview'
                        : previewType === 'packing-list'
                          ? 'Packing List Preview'
                          : 'Quotation Preview'
                }
                className={styles.previewFrame}
                srcDoc={previewHtml}
              />
            </div>
          </div>
        </div>
      ) : null}

      <Main_DocumentCopy
        open={isCopyOpen}
        onClose={() => setIsCopyOpen(false)}
        items={documentCopyItems}
        currencyCode={baseCurrencyCode}
        targetOptions={documentCopyTargetOptions}
        isSubmitting={isCopying}
        onConfirm={handleCopyConfirm}
      />
    </SalesQuotationSavePageContainer>
  );
};

export default Main_SalesDocument;
