import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_Checkbox from '../../../common/InputOptions/Checkbox/Main_Checkbox';
import EditableDataForm from '../../../common/Forms/EditableDataForm';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_CompanyAddresses.module.css';

const Main_CompanyAddresses = () => {
  const { addressType } = useMasterContext();
  const companyId = useEntityField('company', 'id');
  const addressRows = useEntityRows('company', 'company_address');

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
      upsertEntityData('company', {
        company_address: [
          {
            id: row?.id || uuidv4(),
            company_id: companyId,
            ...patch,
          },
        ],
      });
    },
    [companyId],
  );

  const handleAddAddressRow = useCallback(() => {
    upsertEntityData('company', {
      company_address: [
        {
          id: uuidv4(),
          company_id: companyId,
          contact_name: '',
          phone_number: '',
          address_type_id: '',
          is_default: false,
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
  }, [companyId]);

  const handleDeleteAddressRow = useCallback((row) => {
    if (!row?.id) return;
    upsertEntityData('company', {
      company_address: [{ id: row.id, _delete: true }],
    });
  }, []);

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
        key: 'contact_name',
        label: 'Contact Name',
        sortType: 'string',
        nextRow: true,
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.contact_name || ''}
            placeholder="Contact Name"
            onChange={(ov, nv) => upsertAddressRow(row, { contact_name: nv })}
          />
        ),
      },
      {
        key: 'phone_number',
        label: 'Phone',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.phone_number || ''}
            placeholder="Phone Number"
            onChange={(ov, nv) => upsertAddressRow(row, { phone_number: nv })}
          />
        ),
      },
      {
        key: 'address_line1',
        label: 'Address Line 1',
        sortType: 'string',
        nextRow: true,
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.address_line1 || ''}
            placeholder="Address Line 1"
            onChange={(ov, nv) => upsertAddressRow(row, { address_line1: nv })}
          />
        ),
      },
      {
        key: 'address_line2',
        label: 'Address Line 2',
        sortType: 'string',
        nextRow: true,
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
        nextRow: true,
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
        nextRow: true,
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
        key: 'is_default',
        label: 'Default',
        sortType: 'boolean',
        getSortValue: (row) => (row.is_default ? 1 : 0),
        renderCell: (row) => (
          <Main_Checkbox
            checked={Boolean(row.is_default)}
            label="Default"
            onChange={(checked) =>
              upsertAddressRow(row, { is_default: checked })
            }
          />
        ),
      },
    ],

    [addressTypeOptions, upsertAddressRow],
  );

  return (
    <div className={styles.tableSection}>
      <EditableDataForm
        label="Company Addresses"
        rows={addressRows}
        columns={columns}
        rowKey="id"
        emptyMessage="No addresses yet. Click + Add Address."
        onAddRow={handleAddAddressRow}
        addRowText="Add Address"
        onRemoveRow={handleDeleteAddressRow}
      />
    </div>
  );
};

export default Main_CompanyAddresses;
