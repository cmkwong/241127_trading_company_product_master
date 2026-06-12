import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../../utils/crud';
import { useAuthContext } from '../../../store/AuthContext';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import bottomBarDeleteStyles from '../../common/Buttons/BottomBarDeleteAction.module.css';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';
import APInvoiceSavePageContainer from './Container/APInvoiceSavePageContainer';
import APInvoiceSidebar from './Sidebar/APInvoiceSidebar';
import APInvoiceBasicInfo from './BasicInfo/APInvoiceBasicInfo';
import APInvoiceRowDetails from './RowDetails/APInvoiceRowDetails';
import {
  AP_API_BASE,
  PURCHASE_API_BASE,
  SUPPLIERS_API_BASE,
  MASTER_API_BASE,
  FILE_SERVER_BASE_URL,
  toArray,
  toSafeString,
  toNumberOrEmpty,
  extractRowsFromResponse,
  newId,
  createNewApInvoice,
  getSupplierDisplayName,
  getSupplierAddressPreview,
  buildDefaultUploadFiles,
  buildFileDiffPayload,
  buildPayloadFromWorking,
  buildPayloadWithBase64,
} from './utils/apInvoiceHelpers';
import {
  buildBaseCurrencyOptions,
  buildCurrencyCodeById,
  buildExchangeRateMap,
  buildNormalizedCurrencies,
  computeApInvoiceTotals,
  formatMoney,
  getLatestExchangeRateRow,
} from './utils/apInvoiceTotals';
import { buildApInvoiceDocumentA4Html } from './utils/apInvoicePrint';
import styles from './Main_APInvoice.module.css';

const Main_APInvoice = () => {
  const { token } = useAuthContext();

  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRateHkd, setExchangeRateHkd] = useState([]);
  const [invoiceTypes, setInvoiceTypes] = useState([]);

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('HKD');
  const previewIframeRef = useRef(null);

  const supplierNameById = useMemo(() => {
    const map = new Map();
    toArray(suppliers).forEach((supplier) => {
      const id = toSafeString(supplier?.id);
      if (!id) return;
      map.set(id, getSupplierDisplayName(supplier));
    });
    return map;
  }, [suppliers]);

  const selectedSupplierOption = useMemo(() => {
    const supplierId = toSafeString(draft?.supplier_id);
    if (!supplierId) return null;

    const supplier = toArray(suppliers).find(
      (item) => toSafeString(item?.id) === supplierId,
    );
    if (!supplier) return null;

    const label = getSupplierDisplayName(supplier);
    return {
      id: supplierId,
      name: label || supplierId,
      searchText: [label, supplierId].filter(Boolean).join(' '),
      supplier,
    };
  }, [draft?.supplier_id, suppliers]);

  const selectedPurchaseRequestOption = useMemo(() => {
    const purchaseRequestId = toSafeString(draft?.purchase_request_id);
    if (!purchaseRequestId) return null;

    const request = toArray(purchaseRequests).find(
      (item) => toSafeString(item?.id) === purchaseRequestId,
    );
    if (!request) return null;

    const supplierName =
      supplierNameById.get(toSafeString(request?.supplier_id)) ||
      toSafeString(request?.supplier_id);

    return {
      id: purchaseRequestId,
      name: `${supplierName} - ${purchaseRequestId}`,
      searchText: [purchaseRequestId, supplierName, request?.remark]
        .map((value) => toSafeString(value))
        .filter(Boolean)
        .join(' '),
      request,
    };
  }, [draft?.purchase_request_id, purchaseRequests, supplierNameById]);

  const supplierSuggestionOptions = useMemo(
    () =>
      toArray(suppliers).map((supplier) => {
        const id = toSafeString(supplier?.id);
        const label = getSupplierDisplayName(supplier);

        return {
          id,
          name: label || id,
          searchText: [
            label,
            supplier?.supplier_code,
            supplier?.id,
            supplier?.remark,
          ]
            .map((value) => toSafeString(value))
            .filter(Boolean)
            .join(' '),
          supplier,
        };
      }),
    [suppliers],
  );

  const purchaseRequestSuggestionOptions = useMemo(() => {
    return toArray(purchaseRequests).map((request) => {
      const id = toSafeString(request?.id);
      const supplierName =
        supplierNameById.get(toSafeString(request?.supplier_id)) ||
        toSafeString(request?.supplier_id);

      return {
        id,
        name: `${supplierName} - ${id}`,
        searchText: [id, supplierName, request?.remark]
          .map((value) => toSafeString(value))
          .filter(Boolean)
          .join(' '),
        request,
      };
    });
  }, [purchaseRequests, supplierNameById]);

  const supplierAddressSuggestionOptions = useMemo(() => {
    const supplier = toArray(suppliers).find(
      (item) => toSafeString(item?.id) === toSafeString(draft?.supplier_id),
    );

    return toArray(supplier?.supplier_addresses).map((address) => {
      const id = toSafeString(address?.id);
      const label = getSupplierAddressPreview(address);

      return {
        id,
        name: label || id,
        searchText: [label, id, address?.address_type_id]
          .map((value) => toSafeString(value))
          .filter(Boolean)
          .join(' '),
      };
    });
  }, [draft?.supplier_id, suppliers]);

  const selectedSupplierAddressOption = useMemo(() => {
    const addressId = toSafeString(draft?.supplier_address_id);
    if (!addressId) return null;

    return (
      supplierAddressSuggestionOptions.find(
        (option) => toSafeString(option?.id) === addressId,
      ) || null
    );
  }, [draft?.supplier_address_id, supplierAddressSuggestionOptions]);

  const invoiceTypeOptions = useMemo(() => {
    return toArray(invoiceTypes).map((item) => ({
      id: toSafeString(item?.code),
      name: toSafeString(item?.description || item?.code),
    }));
  }, [invoiceTypes]);

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

  const currencyOptions = useMemo(() => {
    return toArray(currencies).map((item) => ({
      id: toSafeString(item?.id),
      code: toSafeString(item?.code),
      name: toSafeString(item?.name || item?.code || item?.id),
    }));
  }, [currencies]);

  const rowDetailSummary = useMemo(() => {
    const detailRows = toArray(draft?.ap_invoice_row_details);
    const totalAmount = detailRows.reduce((sum, row) => {
      const amount = Number(row?.amount || 0);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

    const imageCount = detailRows.reduce(
      (sum, row) => sum + toArray(row?.ap_invoice_row_detail_images).length,
      0,
    );
    const fileCount = detailRows.reduce(
      (sum, row) => sum + toArray(row?.ap_invoice_row_detail_files).length,
      0,
    );

    return {
      rowCount: detailRows.length,
      totalAmount,
      imageCount,
      fileCount,
    };
  }, [draft?.ap_invoice_row_details]);

  const totalsSummary = useMemo(() => {
    return computeApInvoiceTotals(draft, {
      baseCurrencyCode,
      currencyCodeById,
      exchangeRateMap,
    });
  }, [baseCurrencyCode, currencyCodeById, draft, exchangeRateMap]);

  const handleSelectRow = useCallback(
    (id) => {
      const normalizedId = toSafeString(id);
      setSelectedId(normalizedId);
      const selectedRow = toArray(rows).find(
        (row) => toSafeString(row?.id) === normalizedId,
      );
      setDraft(selectedRow ? JSON.parse(JSON.stringify(selectedRow)) : null);
    },
    [rows],
  );

  const refreshAll = useCallback(
    async (preferId = '') => {
      if (!token) {
        setRows([]);
        setSelectedId('');
        setDraft(null);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const [
          apRes,
          purchaseRes,
          suppliersRes,
          currenciesRes,
          exchangeRateRes,
          invoiceTypesRes,
        ] = await Promise.all([
          apiGet(AP_API_BASE, { token, cache: 'no-store' }),
          apiGet(PURCHASE_API_BASE, { token, cache: 'no-store' }),
          apiPost(SUPPLIERS_API_BASE, {}, { token, cache: 'no-store' }),
          apiGet(`${MASTER_API_BASE}/master_currencies`, {
            token,
            cache: 'no-store',
          }),
          apiGet(`${MASTER_API_BASE}/master_exchange_rate_hkd`, {
            token,
            cache: 'no-store',
          }),
          apiGet(`${MASTER_API_BASE}/master_invoice_types`, {
            token,
            cache: 'no-store',
          }),
        ]);

        const apRows = extractRowsFromResponse(apRes, 'ap_invoices');
        const purchaseRows = extractRowsFromResponse(
          purchaseRes,
          'purchase_requests',
        );
        const supplierRows = extractRowsFromResponse(suppliersRes, 'suppliers');
        const currencyRows = extractRowsFromResponse(
          currenciesRes,
          'master_currencies',
        );
        const exchangeRateRows = extractRowsFromResponse(
          exchangeRateRes,
          'master_exchange_rate_hkd',
        );
        const invoiceTypeRows = extractRowsFromResponse(
          invoiceTypesRes,
          'master_invoice_types',
        );

        setRows(apRows);
        setPurchaseRequests(purchaseRows);
        setSuppliers(supplierRows);
        setCurrencies(currencyRows);
        setExchangeRateHkd(exchangeRateRows);
        setInvoiceTypes(invoiceTypeRows);

        const desiredId = toSafeString(preferId || selectedId);
        const desiredExists = toArray(apRows).some(
          (row) => toSafeString(row?.id) === desiredId,
        );

        if (desiredExists) {
          const nextRow = toArray(apRows).find(
            (row) => toSafeString(row?.id) === desiredId,
          );
          setSelectedId(desiredId);
          setDraft(nextRow ? JSON.parse(JSON.stringify(nextRow)) : null);
          return;
        }

        if (apRows.length > 0) {
          const firstId = toSafeString(apRows[0]?.id);
          setSelectedId(firstId);
          setDraft(JSON.parse(JSON.stringify(apRows[0])));
          return;
        }

        setSelectedId('');
        setDraft(createNewApInvoice());
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Failed to load AP invoices');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedId, token],
  );

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const setHeaderField = useCallback((field, value) => {
    setDraft((prev) => ({
      ...(prev || createNewApInvoice()),
      [field]: value,
    }));
  }, []);

  const setRowDetailField = useCallback((row, patch) => {
    const targetId = toSafeString(row?.id);
    if (!targetId) return;

    setDraft((prev) => {
      const base = prev || createNewApInvoice();
      const nextRows = toArray(base?.ap_invoice_row_details).map(
        (detailRow) => {
          if (toSafeString(detailRow?.id) !== targetId) {
            return detailRow;
          }

          const nextPatch = { ...patch };
          if (Object.prototype.hasOwnProperty.call(nextPatch, 'amount')) {
            nextPatch.amount = toNumberOrEmpty(nextPatch.amount);
          }

          return {
            ...detailRow,
            ...nextPatch,
          };
        },
      );

      return {
        ...base,
        ap_invoice_row_details: nextRows,
      };
    });
  }, []);

  const handleCreate = useCallback(() => {
    const fresh = createNewApInvoice();
    setDraft(fresh);
    setSelectedId('');
    setError('');
    setNotice('New AP invoice draft created');
  }, []);

  const handleDelete = useCallback(async () => {
    if (!token || !draft?.id || isDeleting) return;

    const confirmed = window.confirm(
      'Delete this AP invoice? This action cannot be undone.',
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError('');

    try {
      await apiDelete(`${AP_API_BASE}/ids`, {
        token,
        body: { data: { ap_invoices: [{ id: draft.id }] } },
      });
      setNotice('AP invoice deleted');
      await refreshAll('');
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to delete AP invoice');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [draft?.id, isDeleting, refreshAll, token]);

  const handleAddRowDetail = useCallback(() => {
    setDraft((prev) => {
      const base = prev || createNewApInvoice();
      return {
        ...base,
        ap_invoice_row_details: [
          ...toArray(base?.ap_invoice_row_details),
          {
            id: newId(),
            ap_invoice_id: toSafeString(base?.id),
            ap_invoice_type: '',
            description: '',
            amount: '',
            currency_id: '',
            details: '',
            remark: '',
            ap_invoice_row_detail_images: [],
            ap_invoice_row_detail_files: [],
          },
        ],
      };
    });
  }, []);

  const handleDeleteRowDetail = useCallback((row) => {
    const targetId = toSafeString(row?.id);
    if (!targetId) return;

    setDraft((prev) => {
      const base = prev || createNewApInvoice();
      return {
        ...base,
        ap_invoice_row_details: toArray(base?.ap_invoice_row_details).filter(
          (item) => toSafeString(item?.id) !== targetId,
        ),
      };
    });
  }, []);

  const handleRowImagesChange = useCallback(
    (row, oldFiles, newFiles) => {
      const targetId = toSafeString(row?.id);
      if (!targetId) return;

      const nextFiles = buildFileDiffPayload(oldFiles, newFiles, {
        nameField: 'image_name',
        urlField: 'image_url',
        descriptionField: null,
        typeField: null,
      });

      if (!nextFiles) {
        return;
      }

      setRowDetailField(row, { ap_invoice_row_detail_images: nextFiles });
    },
    [setRowDetailField],
  );

  const handleRowFilesChange = useCallback(
    (row, oldFiles, newFiles) => {
      const targetId = toSafeString(row?.id);
      if (!targetId) return;

      const nextFiles = buildFileDiffPayload(oldFiles, newFiles, {
        nameField: 'file_name',
        urlField: 'file_url',
        descriptionField: 'description',
        typeField: 'file_type',
      });

      if (!nextFiles) {
        return;
      }

      setRowDetailField(row, { ap_invoice_row_detail_files: nextFiles });
    },
    [setRowDetailField],
  );

  const handleSupplierChange = useCallback((suggestion) => {
    const supplierId = toSafeString(suggestion?.id);

    setDraft((prev) => {
      const base = prev || createNewApInvoice();
      if (!supplierId) {
        return {
          ...base,
          supplier_id: '',
          supplier_address_id: '',
        };
      }

      const supplier = suggestion?.supplier;
      const addresses = toArray(supplier?.supplier_addresses);
      const currentAddressId = toSafeString(base?.supplier_address_id);
      const hasCurrentAddress = addresses.some(
        (address) => toSafeString(address?.id) === currentAddressId,
      );

      return {
        ...base,
        supplier_id: supplierId,
        supplier_address_id: hasCurrentAddress ? currentAddressId : '',
      };
    });
  }, []);

  const handlePurchaseRequestChange = useCallback((suggestion) => {
    const requestId = toSafeString(suggestion?.id);

    setDraft((prev) => {
      const base = prev || createNewApInvoice();
      if (!requestId) {
        return {
          ...base,
          purchase_request_id: '',
        };
      }

      const request = suggestion?.request;
      const requestSupplierId = toSafeString(request?.supplier_id);

      const shouldSyncSupplier =
        requestSupplierId &&
        requestSupplierId !== toSafeString(base?.supplier_id);

      return {
        ...base,
        purchase_request_id: requestId,
        supplier_id: shouldSyncSupplier
          ? requestSupplierId
          : toSafeString(base?.supplier_id),
        supplier_address_id: shouldSyncSupplier
          ? ''
          : toSafeString(base?.supplier_address_id),
      };
    });
  }, []);

  const handleSupplierAddressChange = useCallback(
    (suggestion) => {
      setHeaderField('supplier_address_id', toSafeString(suggestion?.id));
    },
    [setHeaderField],
  );

  const getApInvoiceDryRunData = useCallback(async () => {
    if (!draft) {
      return {
        endpoint: AP_API_BASE,
        method: 'POST / PATCH',
        create: {},
        update: {},
        delete: {},
        message: 'No AP invoice selected',
      };
    }

    const normalizedPayload = buildPayloadFromWorking(draft);
    const payloadId = toSafeString(normalizedPayload?.id);
    const existing = toArray(rows).find(
      (row) => toSafeString(row?.id) === payloadId,
    );
    const exists = Boolean(existing);

    if (exists) {
      const normalizedExisting = buildPayloadFromWorking(existing);
      const noChanges =
        JSON.stringify(normalizedExisting) ===
        JSON.stringify(normalizedPayload);

      if (noChanges) {
        return {
          endpoint: `${AP_API_BASE}/ids`,
          method: 'PATCH',
          create: {},
          update: {},
          delete: {},
          message: 'No changes detected',
        };
      }
    }

    const payload = await buildPayloadWithBase64(normalizedPayload);

    return {
      endpoint: exists ? `${AP_API_BASE}/ids` : AP_API_BASE,
      method: exists ? 'PATCH' : 'POST',
      create: exists ? {} : { ap_invoices: [payload] },
      update: exists ? { ap_invoices: [payload] } : {},
      delete: {},
      payload: {
        data: {
          ap_invoices: [payload],
        },
      },
    };
  }, [draft, rows]);

  const handleSave = useCallback(async () => {
    if (!token || !draft) return;

    setError('');

    try {
      const payload = await buildPayloadWithBase64(draft);
      const payloadId = toSafeString(payload?.id);
      const exists = toArray(rows).some(
        (row) => toSafeString(row?.id) === payloadId,
      );

      if (exists) {
        await apiPatch(
          `${AP_API_BASE}/ids`,
          { data: { ap_invoices: [payload] } },
          { token },
        );
      } else {
        await apiPost(
          AP_API_BASE,
          { data: { ap_invoices: [payload] } },
          { token },
        );
      }

      setNotice('AP invoice saved');
      await refreshAll(payloadId);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to save AP invoice');
      throw err;
    }
  }, [draft, refreshAll, rows, token]);

  const handlePreview = useCallback(() => {
    if (!draft || isPreparingPreview) {
      return;
    }

    try {
      setIsPreparingPreview(true);
      const html = buildApInvoiceDocumentA4Html({
        invoice: draft,
        supplierOptions: suppliers,
        purchaseRequests,
        currencies,
        invoiceTypes,
        baseCurrencyCode,
        currencyCodeById,
        exchangeRateMap,
      });

      setPreviewHtml(html);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to prepare AP invoice preview.');
    } finally {
      setIsPreparingPreview(false);
    }
  }, [
    baseCurrencyCode,
    currencies,
    currencyCodeById,
    draft,
    exchangeRateMap,
    invoiceTypes,
    isPreparingPreview,
    purchaseRequests,
    suppliers,
  ]);

  const handlePrintFromPreview = useCallback(() => {
    const iframeWindow = previewIframeRef.current?.contentWindow;
    if (!iframeWindow) {
      setError('Preview is not ready yet. Please try again.');
      return;
    }

    iframeWindow.focus();
    iframeWindow.print();
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return (
    <APInvoiceSavePageContainer
      onSave={handleSave}
      dryRunAction={getApInvoiceDryRunData}
      saveButtonText="Save AP Invoice"
      successMessage="AP invoice saved successfully!"
      leftOfDryRunAction={
        <button
          type="button"
          className={styles.previewButton}
          onClick={handlePreview}
          disabled={!draft || isPreparingPreview}
        >
          {isPreparingPreview
            ? 'Preparing Preview...'
            : 'Preview / Print AP Invoice (A4 PDF)'}
        </button>
      }
      leftBottomAction={
        <DeleteBtn
          text={isDeleting ? 'Deleting...' : 'Delete AP Invoice'}
          onClick={handleDelete}
          disabled={!draft?.id || isDeleting}
          title="Delete selected AP invoice"
          ariaLabel="Delete selected AP invoice"
          className={bottomBarDeleteStyles.bottomBarDeleteAction}
        />
      }
    >
      <div className={styles.masterContainer}>
        <APInvoiceSidebar
          rows={rows}
          selectedId={selectedId}
          searchValue={sidebarSearch}
          onSearchChange={setSidebarSearch}
          onSelectRow={handleSelectRow}
          onCreate={handleCreate}
          supplierNameById={supplierNameById}
        />

        <div className={styles.container}>
          <div className={styles.inputSide}>
            {error ? <div className={styles.emptyState}>{error}</div> : null}
            {notice ? <div className={styles.emptyState}>{notice}</div> : null}

            {!draft ? (
              <div className={styles.emptyState}>
                {isLoading
                  ? 'Loading AP invoices...'
                  : 'No AP invoice selected. Create a new one from the sidebar.'}
              </div>
            ) : (
              <>
                <div className={styles.summaryBar}>
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

                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                      <span className={styles.summaryLabel}>Row Details</span>
                      <span className={styles.summaryValue}>
                        {rowDetailSummary.rowCount}
                      </span>
                    </div>
                    <div className={styles.summaryCard}>
                      <span className={styles.summaryLabel}>
                        Total Amount (Selected)
                      </span>
                      <span className={styles.summaryValueStrong}>
                        {totalsSummary.baseCurrencyCode}{' '}
                        {formatMoney(totalsSummary.totalAmount)}
                      </span>
                    </div>
                    <div className={styles.summaryCard}>
                      <span className={styles.summaryLabel}>Raw Sum</span>
                      <span className={styles.summaryValue}>
                        {formatMoney(rowDetailSummary.totalAmount)}
                      </span>
                    </div>
                    <div className={styles.summaryCard}>
                      <span className={styles.summaryLabel}>Images</span>
                      <span className={styles.summaryValue}>
                        {rowDetailSummary.imageCount}
                      </span>
                    </div>
                    <div className={styles.summaryCard}>
                      <span className={styles.summaryLabel}>Files</span>
                      <span className={styles.summaryValue}>
                        {rowDetailSummary.fileCount}
                      </span>
                    </div>
                  </div>

                  {totalsSummary.missingCount > 0 ? (
                    <div className={styles.summaryWarningText}>
                      Total skipped {totalsSummary.missingCount} row(s) due to
                      missing currency or exchange rate.
                    </div>
                  ) : null}
                </div>

                <APInvoiceBasicInfo
                  draft={draft}
                  supplierSuggestionOptions={supplierSuggestionOptions}
                  selectedSupplierOption={selectedSupplierOption}
                  purchaseRequestSuggestionOptions={
                    purchaseRequestSuggestionOptions
                  }
                  selectedPurchaseRequestOption={selectedPurchaseRequestOption}
                  supplierAddressSuggestionOptions={
                    supplierAddressSuggestionOptions
                  }
                  selectedSupplierAddressOption={selectedSupplierAddressOption}
                  onIdChange={(value) => setHeaderField('id', value)}
                  onSupplierChange={handleSupplierChange}
                  onPurchaseRequestChange={handlePurchaseRequestChange}
                  onSupplierAddressChange={handleSupplierAddressChange}
                  onInvoiceRefChange={(value) =>
                    setHeaderField('invoice_ref', value)
                  }
                  onInvoiceDateChange={(value) =>
                    setHeaderField('invoice_date', value)
                  }
                  onDueDateChange={(value) => setHeaderField('due_date', value)}
                  onRemarkChange={(value) => setHeaderField('remark', value)}
                />

                <APInvoiceRowDetails
                  rowDetails={toArray(draft?.ap_invoice_row_details)}
                  currencyOptions={currencyOptions}
                  invoiceTypeOptions={invoiceTypeOptions}
                  fileUrlBase={FILE_SERVER_BASE_URL}
                  onAddRow={handleAddRowDetail}
                  onDeleteRow={handleDeleteRowDetail}
                  onPatchRow={setRowDetailField}
                  onChangeImages={handleRowImagesChange}
                  onChangeFiles={handleRowFilesChange}
                  buildDefaultUploadFiles={buildDefaultUploadFiles}
                />
              </>
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
                AP Invoice A4 Preview
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
                title="AP Invoice Preview"
                className={styles.previewFrame}
                srcDoc={previewHtml}
              />
            </div>
          </div>
        </div>
      ) : null}
    </APInvoiceSavePageContainer>
  );
};

export default Main_APInvoice;
