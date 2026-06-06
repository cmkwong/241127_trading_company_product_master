import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useCustomerContext } from '../../../../store/CustomerContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_CustomerAddresses.module.css';

const normalizeAddressInput = (value) =>
  String(value || '')
    .replace(/[\r\n]+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

const parseDetailedAddress = (value) => {
  const normalizedValue = normalizeAddressInput(value);

  if (!normalizedValue) {
    return null;
  }

  const parts = normalizedValue
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  const mutableParts = [...parts];
  const country = mutableParts.length > 0 ? mutableParts.pop() : '';

  let zipCode = '';
  if (mutableParts.length > 0) {
    const lastPart = mutableParts[mutableParts.length - 1];
    if (/\d/.test(lastPart)) {
      zipCode = mutableParts.pop();
    }
  }

  const state = mutableParts.length > 0 ? mutableParts.pop() : '';
  const city = mutableParts.length > 0 ? mutableParts.pop() : '';

  const addressLine1 = mutableParts[0] || '';
  const addressLine2 = mutableParts[1] || '';
  const addressLine3 = mutableParts.slice(2).join(', ');

  return {
    address_line1: addressLine1,
    address_line2: addressLine2,
    address_line3: addressLine3,
    city,
    state,
    zip_code: zipCode,
    country,
  };
};

const buildStandardAddressPreview = (row) => {
  const addressLine1 = String(row?.address_line1 || '').trim();
  const addressLine2 = String(row?.address_line2 || '').trim();
  const addressLine3 = String(row?.address_line3 || '').trim();

  const city = String(row?.city || '').trim();
  const state = String(row?.state || '').trim();
  const zipCode = String(row?.zip_code || '').trim();
  const country = String(row?.country || '').trim();

  return [
    addressLine1,
    addressLine2,
    addressLine3,
    city,
    state,
    zipCode,
    country,
  ]
    .filter(Boolean)
    .join(', ');
};

const Main_CustomerAddresses = () => {
  const { pageData, upsertCustomerPageData } = useCustomerContext();
  const { addressType = [] } = useMasterContext();
  const [detailedAddressDrafts, setDetailedAddressDrafts] = useState({});
  const [copiedRowId, setCopiedRowId] = useState('');

  const addressRows = pageData.customer_addresses || [];

  const addressTypeOptions = useMemo(
    () =>
      (addressType || []).map((item) => ({
        id: item.id,
        name: item.label ?? item.name ?? item.id,
      })),
    [addressType],
  );

  const upsertAddressRow = useCallback(
    (row, patch) => {
      upsertCustomerPageData({
        customer_addresses: [
          {
            id: row?.id || uuidv4(),
            customer_id: pageData.id,
            ...patch,
          },
        ],
      });
    },
    [upsertCustomerPageData, pageData.id],
  );

  const handleAddAddressRow = useCallback(() => {
    upsertCustomerPageData({
      customer_addresses: [
        {
          id: uuidv4(),
          customer_id: pageData.id,
          address_type_id: '',
          address_line1: '',
          address_line2: '',
          address_line3: '',
          city: '',
          state: '',
          zip_code: '',
          country: '',
        },
      ],
    });
  }, [upsertCustomerPageData, pageData.id]);

  const handleDeleteAddressRow = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertCustomerPageData({
        customer_addresses: [{ id: row.id, _delete: true }],
      });
    },
    [upsertCustomerPageData],
  );

  const setDetailedAddressDraft = useCallback((rowId, value) => {
    setDetailedAddressDrafts((prev) => ({
      ...prev,
      [rowId]: value,
    }));
  }, []);

  const handleParseDetailedAddress = useCallback(
    (row) => {
      const rowId = row?.id;
      if (!rowId) return;

      const parsedAddress = parseDetailedAddress(detailedAddressDrafts[rowId]);
      if (!parsedAddress) return;

      upsertAddressRow(row, parsedAddress);
    },
    [detailedAddressDrafts, upsertAddressRow],
  );

  const handleCopyStandardAddress = useCallback(async (row) => {
    const rowId = String(row?.id || '');
    if (!rowId) return;

    const preview = buildStandardAddressPreview(row);
    if (!preview) return;

    try {
      await navigator.clipboard.writeText(preview);
      setCopiedRowId(rowId);
      setTimeout(() => {
        setCopiedRowId('');
      }, 1200);
    } catch (error) {
      console.error('Failed to copy standard address preview:', error);
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'address_type_id',
        label: 'Address Type',
        sortType: 'string',
        getSortValue: (row) =>
          addressTypeOptions.find((item) => item.id === row.address_type_id)
            ?.name || '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={addressTypeOptions}
            defaultSelectedOption={row.address_type_id || ''}
            onChange={(ov, nv) => {
              upsertAddressRow(row, { address_type_id: nv });
            }}
          />
        ),
      },
      {
        key: 'detailed_address_input',
        label: 'Detailed Address Paste',
        sortable: false,
        renderCell: (row) => {
          const standardPreview = buildStandardAddressPreview(row);

          return (
            <div className={styles.detailedAddressInlineRow}>
              <div className={styles.inlineTextareaWrap}>
                <Main_TextArea
                  defaultValue={detailedAddressDrafts[row.id] || ''}
                  placeholder="Paste full address"
                  rows={1}
                  resize="none"
                  onChange={(ov, nv) => {
                    setDetailedAddressDraft(row.id, nv);
                  }}
                />
              </div>
              <button
                type="button"
                className={styles.parseButton}
                onClick={() => handleParseDetailedAddress(row)}
              >
                Fill Fields
              </button>
              <div className={styles.inlineTextareaWrap}>
                <Main_TextArea
                  defaultValue={standardPreview}
                  placeholder="Standard address preview"
                  rows={1}
                  resize="none"
                  readOnly
                />
              </div>
              <button
                type="button"
                className={styles.copyButton}
                onClick={() => handleCopyStandardAddress(row)}
              >
                {copiedRowId === String(row?.id || '')
                  ? 'Copied'
                  : 'Copy Standard'}
              </button>
            </div>
          );
        },
      },
      {
        key: 'address_line1',
        label: 'Address Line 1',
        sortType: 'string',
        getSortValue: (row) =>
          row.address_line1 || row.address || row.line1 || '',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.address_line1 || row.address || row.line1 || ''}
            placeholder="Address Line 1"
            onChange={(ov, nv) => {
              upsertAddressRow(row, { address_line1: nv });
            }}
          />
        ),
      },
      {
        key: 'address_line2',
        label: 'Address Line 2',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.address_line2 || row.line2 || ''}
            placeholder="Address Line 2"
            onChange={(ov, nv) => upsertAddressRow(row, { address_line2: nv })}
          />
        ),
      },
      {
        key: 'address_line3',
        label: 'Address Line 3',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.address_line3 || row.line3 || ''}
            placeholder="Address Line 3"
            onChange={(ov, nv) => upsertAddressRow(row, { address_line3: nv })}
          />
        ),
      },
      {
        key: 'city',
        label: 'City',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.city || ''}
            placeholder="City"
            onChange={(ov, nv) => upsertAddressRow(row, { city: nv })}
          />
        ),
      },
      {
        key: 'state',
        label: 'State',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.state || row.province || ''}
            placeholder="State"
            onChange={(ov, nv) => upsertAddressRow(row, { state: nv })}
          />
        ),
      },
      {
        key: 'zip_code',
        label: 'ZIP',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.zip_code || row.postal_code || ''}
            placeholder="ZIP"
            onChange={(ov, nv) => upsertAddressRow(row, { zip_code: nv })}
          />
        ),
      },
      {
        key: 'country',
        label: 'Country',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.country || ''}
            placeholder="Country"
            onChange={(ov, nv) => upsertAddressRow(row, { country: nv })}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteAddressRow(row)} />
        ),
      },
    ],
    [
      addressTypeOptions,
      detailedAddressDrafts,
      upsertAddressRow,
      handleDeleteAddressRow,
      handleParseDetailedAddress,
      handleCopyStandardAddress,
      setDetailedAddressDraft,
      copiedRowId,
    ],
  );

  return (
    <Main_InputContainer label="Customer Addresses">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddAddressRow}
            text="Add Address"
            ariaLabel="Add new address"
            title="Add Address"
          />
        </div>

        <EditableDataTable
          rows={addressRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No addresses yet. Click + Add Address."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_CustomerAddresses;
