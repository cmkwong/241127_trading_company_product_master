import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_SupplierAddresses.module.css';

const Main_SupplierAddresses = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { addressType } = useMasterContext();
  const addressRows = pageData.supplier_addresses || [];

  const addressTypeOptions = useMemo(
    () =>
      (addressType || []).map((item) => ({
        id: item.id,
        label: item.label ?? item.name ?? '',
      })),
    [addressType],
  );

  const upsertAddressRow = useCallback(
    (row, patch) => {
      upsertSupplierPageData({
        supplier_addresses: [
          {
            id: row?.id || uuidv4(),
            supplier_id: pageData.id,
            ...patch,
          },
        ],
      });
    },
    [upsertSupplierPageData, pageData.id],
  );

  const handleAddAddressRow = useCallback(() => {
    upsertSupplierPageData({
      supplier_addresses: [
        {
          id: uuidv4(),
          supplier_id: pageData.id,
          address_type_id: '',
          address_line1: '',
          address_line2: '',
          address_line3: '',
          city: '',
          state: '',
          zip_code: '',
          country: '',
          remark: '',
        },
      ],
    });
  }, [upsertSupplierPageData, pageData.id]);

  const handleDeleteAddressRow = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertSupplierPageData({
        supplier_addresses: [{ id: row.id, _delete: true }],
      });
    },
    [upsertSupplierPageData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'address_type_id',
        label: 'Address Type',
        sortType: 'string',
        getSortValue: (row) =>
          addressTypeOptions.find((item) => item.id === row.address_type_id)
            ?.label || '',
        renderCell: (row) => (
          <select
            className={styles.cellInput}
            value={row.address_type_id || ''}
            onChange={(event) =>
              upsertAddressRow(row, { address_type_id: event.target.value })
            }
          >
            <option value="">Select type</option>
            {addressTypeOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        ),
      },
      {
        key: 'address_line1',
        label: 'Address Line 1',
        sortType: 'string',
        getSortValue: (row) => row.address_line1 || row.address || '',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.address_line1 || row.address || ''}
            onChange={(event) =>
              upsertAddressRow(row, { address_line1: event.target.value })
            }
          />
        ),
      },
      {
        key: 'address_line2',
        label: 'Address Line 2',
        sortType: 'string',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.address_line2 || ''}
            onChange={(event) =>
              upsertAddressRow(row, { address_line2: event.target.value })
            }
          />
        ),
      },
      {
        key: 'address_line3',
        label: 'Address Line 3',
        sortType: 'string',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.address_line3 || ''}
            onChange={(event) =>
              upsertAddressRow(row, { address_line3: event.target.value })
            }
          />
        ),
      },
      {
        key: 'city',
        label: 'City',
        sortType: 'string',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.city || ''}
            onChange={(event) =>
              upsertAddressRow(row, { city: event.target.value })
            }
          />
        ),
      },
      {
        key: 'state',
        label: 'State',
        sortType: 'string',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.state || ''}
            onChange={(event) =>
              upsertAddressRow(row, { state: event.target.value })
            }
          />
        ),
      },
      {
        key: 'zip_code',
        label: 'ZIP',
        sortType: 'string',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.zip_code || ''}
            onChange={(event) =>
              upsertAddressRow(row, { zip_code: event.target.value })
            }
          />
        ),
      },
      {
        key: 'country',
        label: 'Country',
        sortType: 'string',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.country || ''}
            onChange={(event) =>
              upsertAddressRow(row, { country: event.target.value })
            }
          />
        ),
      },
      {
        key: 'remark',
        label: 'Remark',
        sortType: 'string',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.remark || ''}
            onChange={(event) =>
              upsertAddressRow(row, { remark: event.target.value })
            }
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => handleDeleteAddressRow(row)}
          >
            Delete
          </button>
        ),
      },
    ],
    [addressTypeOptions, upsertAddressRow, handleDeleteAddressRow],
  );

  return (
    <Main_InputContainer label="Supplier Addresses">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleAddAddressRow}
          >
            + Add Address
          </button>
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

export default Main_SupplierAddresses;
