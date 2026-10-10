import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/TextArea/Main_TextArea';
import EditableDataForm from '../../../common/Forms/EditableDataForm';
import { useUserAccount } from '../../../../store/UserAccountContext';
import { useEntityRows } from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import LoginUsers_OperationContainer from '../Container/LoginUsers_OperationContainer';
import styles from './Main_UserRfqs.module.css';

const STATUS_OPTIONS = [
  { id: 'draft', name: 'Draft' },
  { id: 'submitted', name: 'Submitted' },
  { id: 'processing', name: 'Processing' },
  { id: 'quoted', name: 'Quoted' },
  { id: 'closed', name: 'Closed' },
];

const toOptions = (rows = []) =>
  rows.map((item) => ({
    id: String(item?.id ?? ''),
    name: String(item?.label ?? item?.name ?? item?.id ?? ''),
  }));

const Main_UserRfqs = () => {
  const { userRfqs, createRfq, updateRfq, deleteRfq } = useUserAccount();
  const addressRows = useEntityRows('user', 'user_addresses');
  const { currencies = [] } = useMasterContext();

  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const currencyOptions = useMemo(() => toOptions(currencies), [currencies]);
  const addressOptions = useMemo(
    () =>
      (addressRows || []).map((a) => ({
        id: String(a?.id ?? ''),
        name: `${a?.recipient_name || ''} ${a?.address_line_1 || ''}`.trim(),
      })),
    [addressRows],
  );

  const startEditing = useCallback((rfq) => {
    setEditing(
      rfq
        ? {
            ...rfq,
            user_rfq_items: Array.isArray(rfq.user_rfq_items)
              ? rfq.user_rfq_items
              : [],
            user_rfq_attachments: Array.isArray(rfq.user_rfq_attachments)
              ? rfq.user_rfq_attachments
              : [],
          }
        : null,
    );
  }, []);

  const handleSelect = useCallback(
    (rfq) => {
      setSelectedId(rfq?.id);
      startEditing(rfq);
    },
    [startEditing],
  );

  const handleNew = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const id = uuidv4();
      const draft = {
        id,
        status: 'draft',
        buyer_remarks: '',
        user_rfq_items: [],
        user_rfq_attachments: [],
      };
      await createRfq(draft);
      setSelectedId(id);
      startEditing(draft);
    } finally {
      setBusy(false);
    }
  }, [busy, createRfq, startEditing]);

  const setEditingField = useCallback((patch) => {
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const upsertItem = useCallback((row, patch) => {
    setEditing((prev) => {
      const items = Array.isArray(prev?.user_rfq_items)
        ? prev.user_rfq_items
        : [];
      const next = row?.id
        ? items.map((i) =>
            String(i?.id) === String(row.id) ? { ...i, ...patch } : i,
          )
        : [...items, { id: uuidv4(), ...patch }];
      return { ...prev, user_rfq_items: next };
    });
  }, []);

  const removeItem = useCallback((row) => {
    setEditing((prev) => ({
      ...prev,
      user_rfq_items: (prev?.user_rfq_items || []).filter(
        (i) => String(i?.id) !== String(row?.id),
      ),
    }));
  }, []);

  const upsertAttachment = useCallback((row, patch) => {
    setEditing((prev) => {
      const list = Array.isArray(prev?.user_rfq_attachments)
        ? prev.user_rfq_attachments
        : [];
      const next = row?.id
        ? list.map((a) =>
            String(a?.id) === String(row.id) ? { ...a, ...patch } : a,
          )
        : [...list, { id: uuidv4(), ...patch }];
      return { ...prev, user_rfq_attachments: next };
    });
  }, []);

  const removeAttachment = useCallback((row) => {
    setEditing((prev) => ({
      ...prev,
      user_rfq_attachments: (prev?.user_rfq_attachments || []).filter(
        (a) => String(a?.id) !== String(row?.id),
      ),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!editing || busy) return;
    setBusy(true);
    try {
      await updateRfq(editing);
    } finally {
      setBusy(false);
    }
  }, [editing, busy, updateRfq]);

  const handleSubmit = useCallback(async () => {
    if (!editing || busy) return;
    setBusy(true);
    try {
      await updateRfq({ ...editing, status: 'submitted' });
    } finally {
      setBusy(false);
    }
  }, [editing, busy, updateRfq]);

  const handleDelete = useCallback(async () => {
    if (!editing || busy) return;
    if (!window.confirm('Delete this RFQ? This cannot be undone.')) return;
    setBusy(true);
    try {
      await deleteRfq(editing.id);
      setSelectedId(null);
      setEditing(null);
    } finally {
      setBusy(false);
    }
  }, [editing, busy, deleteRfq]);

  const handleBack = useCallback(() => {
    setSelectedId(null);
    setEditing(null);
  }, []);

  const itemColumns = useMemo(
    () => [
      {
        key: 'product_name',
        label: 'Product',
        sortType: 'string',
        maxWidth: '220px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.product_name || ''}
            placeholder="Product name"
            onChange={(ov, nv) => upsertItem(row, { product_name: nv })}
          />
        ),
      },
      {
        key: 'product_id',
        label: 'Product ID',
        sortType: 'string',
        maxWidth: '200px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.product_id || ''}
            placeholder="Product ID"
            onChange={(ov, nv) => upsertItem(row, { product_id: nv })}
          />
        ),
      },
      {
        key: 'target_qty',
        label: 'Qty',
        sortType: 'string',
        nextRow: true,
        maxWidth: '100px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.target_qty != null ? String(row.target_qty) : ''}
            placeholder="Qty"
            onChange={(ov, nv) =>
              upsertItem(row, { target_qty: nv === '' ? null : Number(nv) })
            }
          />
        ),
      },
      {
        key: 'target_price',
        label: 'Target Price',
        sortType: 'string',
        maxWidth: '140px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={
              row.target_price != null ? String(row.target_price) : ''
            }
            placeholder="Price"
            onChange={(ov, nv) =>
              upsertItem(row, { target_price: nv === '' ? null : Number(nv) })
            }
          />
        ),
      },
      {
        key: 'currency_id',
        label: 'Currency',
        sortType: 'string',
        maxWidth: '140px',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={currencyOptions}
            defaultSelectedOption={row.currency_id || ''}
            onChange={(ov, nv) => upsertItem(row, { currency_id: nv })}
          />
        ),
      },
      {
        key: 'customization_notes',
        label: 'Notes',
        sortType: 'string',
        maxWidth: '260px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.customization_notes || ''}
            placeholder="Customization notes"
            onChange={(ov, nv) => upsertItem(row, { customization_notes: nv })}
          />
        ),
      },
    ],
    [currencyOptions, upsertItem],
  );

  const attachmentColumns = useMemo(
    () => [
      {
        key: 'file_name',
        label: 'File Name',
        sortType: 'string',
        maxWidth: '240px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.file_name || ''}
            placeholder="File name"
            onChange={(ov, nv) => upsertAttachment(row, { file_name: nv })}
          />
        ),
      },
      {
        key: 'file_url',
        label: 'File URL',
        sortType: 'string',
        maxWidth: '360px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.file_url || ''}
            placeholder="https://..."
            onChange={(ov, nv) => upsertAttachment(row, { file_url: nv })}
          />
        ),
      },
    ],
    [upsertAttachment],
  );

  if (!editing) {
    return (
      <div className={styles.sectionBody}>
        <Main_InputContainer label="My RFQs">
          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleNew}
              disabled={busy}
            >
              + New RFQ
            </button>
          </div>

          {userRfqs.length === 0 ? (
            <p className={styles.empty}>You have no RFQs yet.</p>
          ) : (
            <ul className={styles.rfqList}>
              {userRfqs.map((rfq) => (
                <li key={rfq.id}>
                  <button
                    type="button"
                    className={`${styles.rfqItem} ${
                      selectedId === rfq.id ? styles.rfqItemActive : ''
                    }`}
                    onClick={() => handleSelect(rfq)}
                  >
                    <span className={styles.rfqNumber}>
                      {rfq.rfq_number || rfq.id}
                    </span>
                    <span className={styles.rfqStatus}>
                      {rfq.status || 'draft'}
                    </span>
                    <span className={styles.rfqDate}>
                      {rfq.created_at
                        ? new Date(rfq.created_at).toLocaleDateString()
                        : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Main_InputContainer>
      </div>
    );
  }

  return (
    <LoginUsers_OperationContainer
      operations={[
        {
          key: 'back',
          label: '← Back',
          side: 'left',
          variant: 'secondary',
          onClick: handleBack,
        },
        {
          key: 'delete',
          label: 'Delete',
          side: 'left',
          variant: 'danger',
          onClick: handleDelete,
          disabled: busy,
        },
        {
          key: 'saveDraft',
          label: 'Save Draft',
          side: 'right',
          variant: 'secondary',
          onClick: handleSave,
          disabled: busy,
        },
        {
          key: 'submit',
          label: 'Submit RFQ',
          side: 'right',
          variant: 'primary',
          onClick: handleSubmit,
          disabled: busy || editing.status === 'submitted',
        },
      ]}
    >
      <div className={styles.sectionBody}>
        <Main_InputContainer label={editing.rfq_number || 'RFQ Draft'}>
          <div className={styles.fieldRow}>
            <Main_InputContainer
              label="Basic Information"
              className={styles.splitRfqWindow}
            >
              <Main_Dropdown
                label={'Status'}
                defaultOptions={STATUS_OPTIONS}
                defaultSelectedOption={editing.status || 'draft'}
                onChange={(ov, nv) => setEditingField({ status: nv })}
              />
              <Main_TextField
                label={'Expected Delivery Date'}
                defaultValue={editing.expected_delivery_date || ''}
                placeholder="YYYY-MM-DD"
                onChange={(ov, nv) =>
                  setEditingField({ expected_delivery_date: nv })
                }
              />
              <Main_Dropdown
                label={'Shipping Address'}
                defaultOptions={addressOptions}
                defaultSelectedOption={editing.shipping_address_id || ''}
                onChange={(ov, nv) =>
                  setEditingField({ shipping_address_id: nv })
                }
              />
            </Main_InputContainer>
            <Main_InputContainer
              label="Remarks"
              className={styles.splitRfqWindow}
            >
              <Main_TextArea
                richText={true}
                defaultValue={editing.buyer_remarks || ''}
                placeholder="Overall requirements / message"
                onChange={(ov, nv) => setEditingField({ buyer_remarks: nv })}
              />
            </Main_InputContainer>
          </div>

          <Main_InputContainer label="Items">
            <EditableDataForm
              rows={editing.user_rfq_items || []}
              columns={itemColumns}
              rowKey="id"
              emptyMessage="No items yet. Click + Add Item."
              onAddRow={() => upsertItem(null, {})}
              addRowText="Add Item"
              onRemoveRow={removeItem}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Attachments">
            <EditableDataForm
              rows={editing.user_rfq_attachments || []}
              columns={attachmentColumns}
              rowKey="id"
              emptyMessage="No attachments yet. Click + Add Attachment."
              onAddRow={() => upsertAttachment(null, {})}
              addRowText="Add Attachment"
              onRemoveRow={removeAttachment}
            />
          </Main_InputContainer>
        </Main_InputContainer>
      </div>
    </LoginUsers_OperationContainer>
  );
};

export default Main_UserRfqs;
