import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useCustomerContext } from '../../../../store/CustomerContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_CustomerAddresses.module.css';

const Main_CustomerAddresses = () => {
  const { pageData, upsertCustomerPageData } = useCustomerContext();
  const { addressType = [] } = useMasterContext();

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
    [addressTypeOptions, upsertAddressRow, handleDeleteAddressRow],
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
