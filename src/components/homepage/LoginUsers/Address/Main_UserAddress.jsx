import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import EditableDataForm from '../../../common/Forms/EditableDataForm';
import {
  upsertEntityData,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';

const toOptions = (rows = []) =>
  rows.map((item) => ({
    id: String(item?.id ?? ''),
    name: String(item?.label ?? item?.name ?? item?.id ?? ''),
  }));

const Main_UserAddress = () => {
  const addressRows = useEntityRows('user', 'user_addresses');
  const { addressType = [], getMasterTableData } = useMasterContext();

  const countryRows = useMemo(
    () =>
      typeof getMasterTableData === 'function'
        ? getMasterTableData('master_countries') || []
        : [],
    [getMasterTableData],
  );

  const addressTypeOptions = useMemo(() => toOptions(addressType), [addressType]);
  const countryOptions = useMemo(() => toOptions(countryRows), [countryRows]);

  const upsertRow = useCallback((row, patch) => {
    upsertEntityData('user', {
      user_addresses: [{ id: row?.id || uuidv4(), ...patch }],
    });
  }, []);

  const handleAddAddress = useCallback(() => {
    upsertEntityData('user', {
      user_addresses: [
        {
          id: uuidv4(),
          recipient_name: '',
          address_line_1: '',
          is_default: false,
        },
      ],
    });
  }, []);

  const handleRemoveAddress = useCallback((row) => {
    if (!row?.id) return;
    upsertEntityData('user', { user_addresses: [{ id: row.id, _delete: true }] });
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'recipient_name',
        label: 'Recipient',
        sortType: 'string',
        maxWidth: '200px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.recipient_name || ''}
            placeholder="Recipient"
            onChange={(ov, nv) => upsertRow(row, { recipient_name: nv })}
          />
        ),
      },
      {
        key: 'phone_number',
        label: 'Phone',
        sortType: 'string',
        maxWidth: '180px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.phone_number || ''}
            placeholder="Phone"
            onChange={(ov, nv) => upsertRow(row, { phone_number: nv })}
          />
        ),
      },
      {
        key: 'address_line_1',
        label: 'Address Line 1',
        sortType: 'string',
        nextRow: true,
        maxWidth: '300px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.address_line_1 || ''}
            placeholder="Address line 1"
            onChange={(ov, nv) => upsertRow(row, { address_line_1: nv })}
          />
        ),
      },
      {
        key: 'address_line_2',
        label: 'Address Line 2',
        sortType: 'string',
        maxWidth: '300px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.address_line_2 || ''}
            placeholder="Address line 2"
            onChange={(ov, nv) => upsertRow(row, { address_line_2: nv })}
          />
        ),
      },
      {
        key: 'city',
        label: 'City',
        sortType: 'string',
        nextRow: true,
        maxWidth: '160px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.city || ''}
            placeholder="City"
            onChange={(ov, nv) => upsertRow(row, { city: nv })}
          />
        ),
      },
      {
        key: 'state',
        label: 'State',
        sortType: 'string',
        maxWidth: '160px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.state || ''}
            placeholder="State"
            onChange={(ov, nv) => upsertRow(row, { state: nv })}
          />
        ),
      },
      {
        key: 'postal_code',
        label: 'Postal Code',
        sortType: 'string',
        maxWidth: '140px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.postal_code || ''}
            placeholder="ZIP"
            onChange={(ov, nv) => upsertRow(row, { postal_code: nv })}
          />
        ),
      },
      {
        key: 'country_id',
        label: 'Country',
        sortType: 'string',
        nextRow: true,
        maxWidth: '180px',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={countryOptions}
            defaultSelectedOption={row.country_id || ''}
            onChange={(ov, nv) => upsertRow(row, { country_id: nv })}
          />
        ),
      },
      {
        key: 'address_type_id',
        label: 'Type',
        sortType: 'string',
        maxWidth: '180px',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={addressTypeOptions}
            defaultSelectedOption={row.address_type_id || ''}
            onChange={(ov, nv) => upsertRow(row, { address_type_id: nv })}
          />
        ),
      },
      {
        key: 'is_default',
        label: 'Default',
        sortType: 'string',
        maxWidth: '120px',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={[
              { id: 'false', name: 'No' },
              { id: 'true', name: 'Yes' },
            ]}
            defaultSelectedOption={row.is_default ? 'true' : 'false'}
            onChange={(ov, nv) => upsertRow(row, { is_default: nv === 'true' })}
          />
        ),
      },
    ],
    [upsertRow, addressTypeOptions, countryOptions],
  );

  return (
    <Main_InputContainer label="My Addresses">
      <EditableDataForm
        rows={addressRows}
        columns={columns}
        rowKey="id"
        emptyMessage="No addresses yet. Click + Add Address."
        onAddRow={handleAddAddress}
        addRowText="Add Address"
        onRemoveRow={handleRemoveAddress}
      />
    </Main_InputContainer>
  );
};

export default Main_UserAddress;
