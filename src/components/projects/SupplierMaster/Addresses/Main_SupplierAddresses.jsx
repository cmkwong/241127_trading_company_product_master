import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
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
          <Main_Dropdown
            defaultOptions={addressTypeOptions.map((item) => ({
              id: item.id,
              name: item.label,
            }))}
            defaultSelectedOption={row.address_type_id || ''}
            onChange={(ov, nv) => {
              upsertAddressRow(row, { address_type_id: nv });
            }}
          />
        ),
      },
      {
        key: 'address_line1',
        label: 'Address Line 1',
        sortType: 'string',
        getSortValue: (row) => row.address_line1 || row.address || '',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.address_line1 || row.address || ''}
            placeholder="Address Line 1"
            onChange={(ov, nv) =>
              upsertAddressRow(row, { address_line1: nv, address: nv })
            }
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
            defaultValue={row.address_line2 || ''}
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
            defaultValue={row.address_line3 || ''}
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
            defaultValue={row.state || ''}
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
            defaultValue={row.zip_code || ''}
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
        key: 'remark',
        label: 'Remark',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.remark || ''}
            placeholder="Remark"
            onChange={(ov, nv) => upsertAddressRow(row, { remark: nv })}
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
    [addressTypeOptions, upsertAddressRow, handleDeleteAddressRow],
  );

  return (
    <Main_InputContainer label="Supplier Addresses">
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

export default Main_SupplierAddresses;
