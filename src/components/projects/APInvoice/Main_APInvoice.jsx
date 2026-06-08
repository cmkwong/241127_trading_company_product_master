import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../../utils/crud';
import { useAuthContext } from '../../../store/AuthContext';
import Main_FileUploads from '../../common/InputOptions/FileUploads/Main_FileUploads';
import styles from './Main_APInvoice.module.css';

const AP_API_BASE = 'http://localhost:3001/api/v1/trade_business/ap/data';
const PURCHASE_API_BASE =
  'http://localhost:3001/api/v1/trade_business/purchase/data';
const SUPPLIERS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/suppliers/data/list';
const MASTER_API_BASE = 'http://localhost:3001/api/v1/trade_business/master';

const toSafeString = (value) => String(value || '').trim();
const toArray = (value) => (Array.isArray(value) ? value : []);
const toNumberOrEmpty = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const extractRowsFromResponse = (response, tableName) => {
  if (Array.isArray(response?.structuredData?.data?.[tableName])) {
    return response.structuredData.data[tableName];
  }
  if (Array.isArray(response?.data?.[tableName])) {
    return response.data[tableName];
  }
  if (Array.isArray(response?.[tableName])) {
    return response[tableName];
  }
  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }
  if (Array.isArray(response?.results)) {
    return response.results;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
};

const newId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createNewApInvoice = () => ({
  id: newId(),
  supplier_id: '',
  purchase_request_id: '',
  supplier_address_id: '',
  invoice_ref: '',
  invoice_date: '',
  due_date: '',
  remark: '',
  ap_invoice_files: [],
  api_shipping_details: [],
  api_product_details: [],
  api_service_details: [],
});

const Main_APInvoice = () => {
  const { token } = useAuthContext();

  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const supplierMap = useMemo(() => {
    const map = new Map();
    toArray(suppliers).forEach((supplier) => {
      const id = toSafeString(supplier?.id);
      if (!id) return;
      map.set(
        id,
        toSafeString(
          supplier?.supplier_display_name ||
            supplier?.display_name ||
            supplier?.supplier_name ||
            supplier?.name ||
            supplier?.id,
        ),
      );
    });
    return map;
  }, [suppliers]);

  const currencyMap = useMemo(() => {
    const map = new Map();
    toArray(currencies).forEach((currency) => {
      const id = toSafeString(currency?.id);
      if (!id) return;
      map.set(id, toSafeString(currency?.code || currency?.name || id));
    });
    return map;
  }, [currencies]);

  const selectedPurchaseRequest = useMemo(() => {
    return toArray(purchaseRequests).find(
      (row) =>
        toSafeString(row?.id) === toSafeString(draft?.purchase_request_id),
    );
  }, [draft?.purchase_request_id, purchaseRequests]);

  const selectedSupplierAddresses = useMemo(() => {
    const supplier = toArray(suppliers).find(
      (row) => toSafeString(row?.id) === toSafeString(draft?.supplier_id),
    );
    return toArray(supplier?.supplier_addresses);
  }, [draft?.supplier_id, suppliers]);

  const purchaseShippingDetails = useMemo(
    () => toArray(selectedPurchaseRequest?.purchase_shipping_details),
    [selectedPurchaseRequest],
  );
  const purchaseProductDetails = useMemo(
    () => toArray(selectedPurchaseRequest?.purchase_product_details),
    [selectedPurchaseRequest],
  );
  const purchaseServiceDetails = useMemo(
    () => toArray(selectedPurchaseRequest?.purchase_service_details),
    [selectedPurchaseRequest],
  );

  const handleSelectRow = useCallback(
    (id) => {
      setSelectedId(id);
      const selectedRow = toArray(rows).find(
        (row) => toSafeString(row?.id) === toSafeString(id),
      );
      setDraft(selectedRow ? JSON.parse(JSON.stringify(selectedRow)) : null);
    },
    [rows],
  );

  const refreshAll = useCallback(async () => {
    if (!token) {
      setRows([]);
      setDraft(null);
      setSelectedId('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [apRes, purchaseRes, suppliersRes, currenciesRes] =
        await Promise.all([
          apiGet(AP_API_BASE, { token }),
          apiGet(PURCHASE_API_BASE, { token }),
          apiPost(SUPPLIERS_API_BASE, {}, { token }),
          apiGet(`${MASTER_API_BASE}/master_currencies`, { token }),
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

      setRows(apRows);
      setPurchaseRequests(purchaseRows);
      setSuppliers(supplierRows);
      setCurrencies(currencyRows);

      const stillExists = apRows.some(
        (row) => toSafeString(row?.id) === toSafeString(selectedId),
      );
      if (stillExists) {
        const selectedRow = apRows.find(
          (row) => toSafeString(row?.id) === toSafeString(selectedId),
        );
        setDraft(selectedRow ? JSON.parse(JSON.stringify(selectedRow)) : null);
      } else if (apRows.length > 0) {
        setSelectedId(toSafeString(apRows[0]?.id));
        setDraft(JSON.parse(JSON.stringify(apRows[0])));
      } else {
        setSelectedId('');
        setDraft(null);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to load AP invoices');
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const setHeaderField = (key, value) => {
    setDraft((prev) => ({
      ...(prev || createNewApInvoice()),
      [key]: value,
    }));
  };

  const setDetailField = (detailKey, index, field, value) => {
    setDraft((prev) => {
      const base = prev || createNewApInvoice();
      const list = toArray(base[detailKey]).map((row) => ({ ...row }));
      list[index] = { ...(list[index] || {}), [field]: value };
      return { ...base, [detailKey]: list };
    });
  };

  const addDetailRow = (detailKey, rowFactory) => {
    setDraft((prev) => {
      const base = prev || createNewApInvoice();
      const list = toArray(base[detailKey]).map((row) => ({ ...row }));
      list.push(rowFactory(base));
      return { ...base, [detailKey]: list };
    });
  };

  const removeDetailRow = (detailKey, index) => {
    setDraft((prev) => {
      const base = prev || createNewApInvoice();
      const list = toArray(base[detailKey]).filter((_, i) => i !== index);
      return { ...base, [detailKey]: list };
    });
  };

  const handleCreate = () => {
    const fresh = createNewApInvoice();
    setDraft(fresh);
    setSelectedId('');
    setError('');
    setNotice('New AP invoice draft created');
  };

  const buildDefaultUploadFiles = (files, nameField, urlField) => {
    return toArray(files)
      .slice()
      .sort(
        (a, b) => Number(a?.display_order || 0) - Number(b?.display_order || 0),
      )
      .map((file) => ({
        id: file?.id,
        name: file?.[nameField],
        url: file?.[urlField],
        display_order: file?.display_order,
      }));
  };

  const buildFileDiffPayload = (
    oldFiles,
    newFiles,
    { nameField, urlField },
  ) => {
    const oldList = toArray(oldFiles);
    const newList = toArray(newFiles);

    const removedFiles = oldList.filter(
      (oldItem) => !newList.some((newItem) => newItem?.id === oldItem?.id),
    );
    const addedFiles = newList.filter(
      (newItem) => !oldList.some((oldItem) => oldItem?.id === newItem?.id),
    );

    const sameLength = oldList.length === newList.length;
    const sameOrder =
      sameLength && oldList.every((item, i) => item?.id === newList[i]?.id);

    if (removedFiles.length === 0 && addedFiles.length === 0 && sameOrder) {
      return null;
    }

    const addedIds = new Set(addedFiles.map((item) => item?.id));

    return [
      ...removedFiles
        .map((item) => ({ id: item?.id, _delete: true }))
        .filter((item) => item.id),
      ...newList.map((item, fileIndex) => ({
        id: item?.id || newId(),
        display_order: fileIndex + 1,
        ...(addedIds.has(item?.id)
          ? {
              [nameField]: item?.name,
              [urlField]: item?.url,
            }
          : {}),
      })),
    ];
  };

  const handleTopLevelFilesChange = (
    oldFiles,
    newFiles,
    { fileKey, nameField, urlField },
  ) => {
    const nextFiles = buildFileDiffPayload(oldFiles, newFiles, {
      nameField,
      urlField,
    });
    if (!nextFiles) {
      return;
    }
    setHeaderField(fileKey, nextFiles);
  };

  const handleNestedFilesChange = (
    detailKey,
    index,
    fileKey,
    oldFiles,
    newFiles,
    { nameField, urlField },
  ) => {
    const nextFiles = buildFileDiffPayload(oldFiles, newFiles, {
      nameField,
      urlField,
    });
    if (!nextFiles) {
      return;
    }
    setDetailField(detailKey, index, fileKey, nextFiles);
  };

  const buildPayload = () => {
    const working = draft || createNewApInvoice();

    return {
      ...working,
      ap_invoice_files: toArray(working.ap_invoice_files),
      api_shipping_details: toArray(working.api_shipping_details).map(
        (row) => ({
          ...row,
          ap_invoice_id:
            toSafeString(row?.ap_invoice_id) || toSafeString(working.id),
          api_shipping_files: toArray(row?.api_shipping_files),
        }),
      ),
      api_product_details: toArray(working.api_product_details).map((row) => ({
        ...row,
        ap_invoice_id:
          toSafeString(row?.ap_invoice_id) || toSafeString(working.id),
        api_product_files: toArray(row?.api_product_files),
      })),
      api_service_details: toArray(working.api_service_details).map((row) => ({
        ...row,
        ap_invoice_id:
          toSafeString(row?.ap_invoice_id) || toSafeString(working.id),
        api_service_files: toArray(row?.api_service_files),
      })),
    };
  };

  const handleSave = async () => {
    if (!token || !draft) return;
    setIsSaving(true);
    setError('');

    try {
      const payload = buildPayload();
      const exists = rows.some(
        (row) => toSafeString(row?.id) === toSafeString(payload.id),
      );

      if (exists) {
        await apiPatch(
          `${AP_API_BASE}/ids`,
          { data: { ap_invoices: [payload] } },
          { token },
        );
        setNotice('AP invoice updated');
      } else {
        await apiPost(
          AP_API_BASE,
          { data: { ap_invoices: [payload] } },
          { token },
        );
        setNotice('AP invoice created');
      }

      await refreshAll();
      setSelectedId(toSafeString(payload.id));
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to save AP invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
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
      await refreshAll();
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to delete AP invoice');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>AP Invoices</h3>
          <div className={styles.sidebarActions}>
            <button type="button" onClick={refreshAll} disabled={isLoading}>
              Refresh
            </button>
            <button type="button" onClick={handleCreate}>
              New
            </button>
          </div>
        </div>

        <div className={styles.sidebarList}>
          {rows.map((row) => {
            const id = toSafeString(row?.id);
            const isActive = id === toSafeString(selectedId);
            const supplierName =
              supplierMap.get(toSafeString(row?.supplier_id)) ||
              toSafeString(row?.supplier_id) ||
              'Unknown supplier';
            const ref = toSafeString(row?.invoice_ref) || 'No invoice ref';

            return (
              <button
                key={id}
                type="button"
                className={`${styles.sidebarItem} ${
                  isActive ? styles.sidebarItemActive : ''
                }`}
                onClick={() => handleSelectRow(id)}
              >
                <div className={styles.sidebarItemTitle}>{supplierName}</div>
                <div className={styles.sidebarItemMeta}>{ref}</div>
                <div className={styles.sidebarItemMeta}>{id}</div>
              </button>
            );
          })}

          {!isLoading && rows.length === 0 && (
            <div className={styles.empty}>No AP invoices found.</div>
          )}
        </div>
      </aside>

      <section className={styles.editor}>
        <div className={styles.editorHeader}>
          <h2>AP Invoice Editor</h2>
          <div className={styles.editorActions}>
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDelete}
              disabled={!draft?.id || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {error ? <div className={styles.error}>{error}</div> : null}
        {notice ? <div className={styles.notice}>{notice}</div> : null}

        {!draft ? (
          <div className={styles.emptyEditor}>
            Select an AP invoice or click New.
          </div>
        ) : (
          <>
            <div className={styles.grid3}>
              <label className={styles.field}>
                <span>ID</span>
                <input
                  value={toSafeString(draft.id)}
                  onChange={(e) => setHeaderField('id', e.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>Supplier</span>
                <select
                  value={toSafeString(draft.supplier_id)}
                  onChange={(e) =>
                    setHeaderField('supplier_id', e.target.value)
                  }
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => {
                    const id = toSafeString(supplier?.id);
                    const label = supplierMap.get(id) || id;
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className={styles.field}>
                <span>Purchase Request</span>
                <select
                  value={toSafeString(draft.purchase_request_id)}
                  onChange={(e) => {
                    const nextPurchaseRequestId = e.target.value;
                    const linkedRequest = purchaseRequests.find(
                      (row) =>
                        toSafeString(row?.id) ===
                        toSafeString(nextPurchaseRequestId),
                    );

                    setDraft((prev) => ({
                      ...(prev || createNewApInvoice()),
                      purchase_request_id: nextPurchaseRequestId,
                      supplier_id: linkedRequest
                        ? toSafeString(linkedRequest?.supplier_id)
                        : toSafeString(prev?.supplier_id),
                    }));
                  }}
                >
                  <option value="">Select purchase request</option>
                  {purchaseRequests.map((request) => {
                    const id = toSafeString(request?.id);
                    const supplierLabel =
                      supplierMap.get(toSafeString(request?.supplier_id)) ||
                      toSafeString(request?.supplier_id);
                    return (
                      <option key={id} value={id}>
                        {supplierLabel} - {id}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className={styles.field}>
                <span>Supplier Address</span>
                <select
                  value={toSafeString(draft.supplier_address_id)}
                  onChange={(e) =>
                    setHeaderField('supplier_address_id', e.target.value)
                  }
                >
                  <option value="">Select address</option>
                  {selectedSupplierAddresses.map((address) => {
                    const id = toSafeString(address?.id);
                    const label =
                      toSafeString(address?.address_1) ||
                      toSafeString(address?.name) ||
                      id;
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className={styles.field}>
                <span>Invoice Ref</span>
                <input
                  value={toSafeString(draft.invoice_ref)}
                  onChange={(e) =>
                    setHeaderField('invoice_ref', e.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Invoice Date</span>
                <input
                  type="date"
                  value={toSafeString(draft.invoice_date)}
                  onChange={(e) =>
                    setHeaderField('invoice_date', e.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Due Date</span>
                <input
                  type="date"
                  value={toSafeString(draft.due_date)}
                  onChange={(e) => setHeaderField('due_date', e.target.value)}
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Remark</span>
              <textarea
                rows={2}
                value={toSafeString(draft.remark)}
                onChange={(e) => setHeaderField('remark', e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Invoice Files</span>
              <Main_FileUploads
                mode="file"
                compact
                tableCell
                hoverPreview
                compactButtonText="Upload"
                defaultFiles={buildDefaultUploadFiles(
                  draft?.ap_invoice_files,
                  'file_name',
                  'file_url',
                )}
                onChange={(oldFiles, newFiles) =>
                  handleTopLevelFilesChange(oldFiles, newFiles, {
                    fileKey: 'ap_invoice_files',
                    nameField: 'file_name',
                    urlField: 'file_url',
                  })
                }
              />
            </label>

            <section className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <h3>AP Shipping Details</h3>
                <button
                  type="button"
                  onClick={() =>
                    addDetailRow('api_shipping_details', (header) => ({
                      id: newId(),
                      ap_invoice_id: header.id,
                      purchase_shipping_detail_id: '',
                      cost_currency_id: '',
                      cost_price: '',
                      details: '',
                      remark: '',
                      paid: false,
                      api_shipping_files: [],
                    }))
                  }
                >
                  Add Shipping Cost
                </button>
              </div>

              {toArray(draft.api_shipping_details).map((row, index) => (
                <div
                  key={toSafeString(row?.id) || index}
                  className={styles.card}
                >
                  <div className={styles.cardHeader}>
                    <strong>Shipping Cost #{index + 1}</strong>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() =>
                        removeDetailRow('api_shipping_details', index)
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className={styles.grid4}>
                    <label className={styles.field}>
                      <span>ID</span>
                      <input
                        value={toSafeString(row?.id)}
                        onChange={(e) =>
                          setDetailField(
                            'api_shipping_details',
                            index,
                            'id',
                            e.target.value,
                          )
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Purchase Shipping Detail</span>
                      <select
                        value={toSafeString(row?.purchase_shipping_detail_id)}
                        onChange={(e) =>
                          setDetailField(
                            'api_shipping_details',
                            index,
                            'purchase_shipping_detail_id',
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select shipping detail</option>
                        {purchaseShippingDetails.map((detail) => {
                          const id = toSafeString(detail?.id);
                          const label =
                            toSafeString(detail?.details) ||
                            `Qty ${toSafeString(detail?.quantity)}` ||
                            id;
                          return (
                            <option key={id} value={id}>
                              {label} - {id}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Cost Currency</span>
                      <select
                        value={toSafeString(row?.cost_currency_id)}
                        onChange={(e) =>
                          setDetailField(
                            'api_shipping_details',
                            index,
                            'cost_currency_id',
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select currency</option>
                        {currencies.map((currency) => {
                          const id = toSafeString(currency?.id);
                          const label = currencyMap.get(id) || id;
                          return (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Cost Price</span>
                      <input
                        value={toSafeString(row?.cost_price)}
                        onChange={(e) =>
                          setDetailField(
                            'api_shipping_details',
                            index,
                            'cost_price',
                            toNumberOrEmpty(e.target.value),
                          )
                        }
                      />
                    </label>
                    <label className={styles.fieldInline}>
                      <input
                        type="checkbox"
                        checked={Boolean(row?.paid)}
                        onChange={(e) =>
                          setDetailField(
                            'api_shipping_details',
                            index,
                            'paid',
                            e.target.checked,
                          )
                        }
                      />
                      <span>Paid</span>
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span>Details</span>
                    <textarea
                      rows={2}
                      value={toSafeString(row?.details)}
                      onChange={(e) =>
                        setDetailField(
                          'api_shipping_details',
                          index,
                          'details',
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Remark</span>
                    <textarea
                      rows={2}
                      value={toSafeString(row?.remark)}
                      onChange={(e) =>
                        setDetailField(
                          'api_shipping_details',
                          index,
                          'remark',
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Shipping Files</span>
                    <Main_FileUploads
                      mode="file"
                      compact
                      tableCell
                      hoverPreview
                      compactButtonText="Upload"
                      defaultFiles={buildDefaultUploadFiles(
                        row?.api_shipping_files,
                        'file_name',
                        'file_url',
                      )}
                      onChange={(oldFiles, newFiles) =>
                        handleNestedFilesChange(
                          'api_shipping_details',
                          index,
                          'api_shipping_files',
                          oldFiles,
                          newFiles,
                          { nameField: 'file_name', urlField: 'file_url' },
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </section>

            <section className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <h3>AP Product Details</h3>
                <button
                  type="button"
                  onClick={() =>
                    addDetailRow('api_product_details', (header) => ({
                      id: newId(),
                      ap_invoice_id: header.id,
                      purchase_product_detail_id: '',
                      cost_currency_id: '',
                      cost_price: '',
                      details: '',
                      remark: '',
                      paid: false,
                      api_product_files: [],
                    }))
                  }
                >
                  Add Product Cost
                </button>
              </div>

              {toArray(draft.api_product_details).map((row, index) => (
                <div
                  key={toSafeString(row?.id) || index}
                  className={styles.card}
                >
                  <div className={styles.cardHeader}>
                    <strong>Product Cost #{index + 1}</strong>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() =>
                        removeDetailRow('api_product_details', index)
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className={styles.grid4}>
                    <label className={styles.field}>
                      <span>ID</span>
                      <input
                        value={toSafeString(row?.id)}
                        onChange={(e) =>
                          setDetailField(
                            'api_product_details',
                            index,
                            'id',
                            e.target.value,
                          )
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Purchase Product Detail</span>
                      <select
                        value={toSafeString(row?.purchase_product_detail_id)}
                        onChange={(e) =>
                          setDetailField(
                            'api_product_details',
                            index,
                            'purchase_product_detail_id',
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select product detail</option>
                        {purchaseProductDetails.map((detail) => {
                          const id = toSafeString(detail?.id);
                          const label =
                            toSafeString(detail?.details) ||
                            `Qty ${toSafeString(detail?.qty)}` ||
                            id;
                          return (
                            <option key={id} value={id}>
                              {label} - {id}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Cost Currency</span>
                      <select
                        value={toSafeString(row?.cost_currency_id)}
                        onChange={(e) =>
                          setDetailField(
                            'api_product_details',
                            index,
                            'cost_currency_id',
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select currency</option>
                        {currencies.map((currency) => {
                          const id = toSafeString(currency?.id);
                          const label = currencyMap.get(id) || id;
                          return (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Cost Price</span>
                      <input
                        value={toSafeString(row?.cost_price)}
                        onChange={(e) =>
                          setDetailField(
                            'api_product_details',
                            index,
                            'cost_price',
                            toNumberOrEmpty(e.target.value),
                          )
                        }
                      />
                    </label>
                    <label className={styles.fieldInline}>
                      <input
                        type="checkbox"
                        checked={Boolean(row?.paid)}
                        onChange={(e) =>
                          setDetailField(
                            'api_product_details',
                            index,
                            'paid',
                            e.target.checked,
                          )
                        }
                      />
                      <span>Paid</span>
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span>Details</span>
                    <textarea
                      rows={2}
                      value={toSafeString(row?.details)}
                      onChange={(e) =>
                        setDetailField(
                          'api_product_details',
                          index,
                          'details',
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Remark</span>
                    <textarea
                      rows={2}
                      value={toSafeString(row?.remark)}
                      onChange={(e) =>
                        setDetailField(
                          'api_product_details',
                          index,
                          'remark',
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Product Files</span>
                    <Main_FileUploads
                      mode="file"
                      compact
                      tableCell
                      hoverPreview
                      compactButtonText="Upload"
                      defaultFiles={buildDefaultUploadFiles(
                        row?.api_product_files,
                        'file_name',
                        'file_url',
                      )}
                      onChange={(oldFiles, newFiles) =>
                        handleNestedFilesChange(
                          'api_product_details',
                          index,
                          'api_product_files',
                          oldFiles,
                          newFiles,
                          { nameField: 'file_name', urlField: 'file_url' },
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </section>

            <section className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <h3>AP Service Details</h3>
                <button
                  type="button"
                  onClick={() =>
                    addDetailRow('api_service_details', (header) => ({
                      id: newId(),
                      ap_invoice_id: header.id,
                      purchase_service_detail_id: '',
                      cost_currency_id: '',
                      cost_price: '',
                      details: '',
                      remark: '',
                      paid: false,
                      api_service_files: [],
                    }))
                  }
                >
                  Add Service Cost
                </button>
              </div>

              {toArray(draft.api_service_details).map((row, index) => (
                <div
                  key={toSafeString(row?.id) || index}
                  className={styles.card}
                >
                  <div className={styles.cardHeader}>
                    <strong>Service Cost #{index + 1}</strong>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() =>
                        removeDetailRow('api_service_details', index)
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className={styles.grid4}>
                    <label className={styles.field}>
                      <span>ID</span>
                      <input
                        value={toSafeString(row?.id)}
                        onChange={(e) =>
                          setDetailField(
                            'api_service_details',
                            index,
                            'id',
                            e.target.value,
                          )
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Purchase Service Detail</span>
                      <select
                        value={toSafeString(row?.purchase_service_detail_id)}
                        onChange={(e) =>
                          setDetailField(
                            'api_service_details',
                            index,
                            'purchase_service_detail_id',
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select service detail</option>
                        {purchaseServiceDetails.map((detail) => {
                          const id = toSafeString(detail?.id);
                          const label =
                            toSafeString(detail?.details) ||
                            `Qty ${toSafeString(detail?.qty)}` ||
                            id;
                          return (
                            <option key={id} value={id}>
                              {label} - {id}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Cost Currency</span>
                      <select
                        value={toSafeString(row?.cost_currency_id)}
                        onChange={(e) =>
                          setDetailField(
                            'api_service_details',
                            index,
                            'cost_currency_id',
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select currency</option>
                        {currencies.map((currency) => {
                          const id = toSafeString(currency?.id);
                          const label = currencyMap.get(id) || id;
                          return (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Cost Price</span>
                      <input
                        value={toSafeString(row?.cost_price)}
                        onChange={(e) =>
                          setDetailField(
                            'api_service_details',
                            index,
                            'cost_price',
                            toNumberOrEmpty(e.target.value),
                          )
                        }
                      />
                    </label>
                    <label className={styles.fieldInline}>
                      <input
                        type="checkbox"
                        checked={Boolean(row?.paid)}
                        onChange={(e) =>
                          setDetailField(
                            'api_service_details',
                            index,
                            'paid',
                            e.target.checked,
                          )
                        }
                      />
                      <span>Paid</span>
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span>Details</span>
                    <textarea
                      rows={2}
                      value={toSafeString(row?.details)}
                      onChange={(e) =>
                        setDetailField(
                          'api_service_details',
                          index,
                          'details',
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Remark</span>
                    <textarea
                      rows={2}
                      value={toSafeString(row?.remark)}
                      onChange={(e) =>
                        setDetailField(
                          'api_service_details',
                          index,
                          'remark',
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Service Files</span>
                    <Main_FileUploads
                      mode="file"
                      compact
                      tableCell
                      hoverPreview
                      compactButtonText="Upload"
                      defaultFiles={buildDefaultUploadFiles(
                        row?.api_service_files,
                        'file_name',
                        'file_url',
                      )}
                      onChange={(oldFiles, newFiles) =>
                        handleNestedFilesChange(
                          'api_service_details',
                          index,
                          'api_service_files',
                          oldFiles,
                          newFiles,
                          { nameField: 'file_name', urlField: 'file_url' },
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </section>
          </>
        )}
      </section>
    </div>
  );
};

export default Main_APInvoice;
