import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import EditableDataForm from '../../../common/Forms/EditableDataForm';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_SupplierContacts.module.css';

const Main_SupplierContacts = () => {
  const { contactType } = useMasterContext();
  const supplierId = useEntityField('supplier', 'id');
  const contactRows = useEntityRows('supplier', 'supplier_contacts');

  const contactTypeOptions = useMemo(
    () =>
      (contactType || []).map((item) => ({
        id: item.id,
        label: item.label ?? item.name ?? '',
      })),
    [contactType],
  );

  const upsertContactRow = useCallback(
    (row, patch) => {
      upsertEntityData('supplier', {
        supplier_contacts: [
          {
            id: row?.id || uuidv4(),
            supplier_id: supplierId,
            ...patch,
          },
        ],
      });
    },
    [supplierId],
  );

  const handleAddContactRow = useCallback(() => {
    upsertEntityData('supplier', {
      supplier_contacts: [
        {
          id: uuidv4(),
          supplier_id: supplierId,
          contact_type_id: '',
          contact_name: '',
          contact_number: '',
          contact_email: '',
          remark: '',
        },
      ],
    });
  }, [supplierId]);

  const handleDeleteContactRow = useCallback((row) => {
    if (!row?.id) return;
    upsertEntityData('supplier', {
      supplier_contacts: [{ id: row.id, _delete: true }],
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'contact_type_id',
        label: 'Contact Type',
        sortType: 'string',
        getSortValue: (row) =>
          contactTypeOptions.find((item) => item.id === row.contact_type_id)
            ?.label || '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={contactTypeOptions.map((item) => ({
              id: item.id,
              name: item.label,
            }))}
            defaultSelectedOption={row.contact_type_id || row.type || ''}
            onChange={(ov, nv) => {
              upsertContactRow(row, { contact_type_id: nv });
            }}
          />
        ),
      },
      {
        key: 'contact_name',
        label: 'Contact Name',
        sortType: 'string',
        getSortValue: (row) => row.contact_name || row.name || '',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.contact_name || row.name || ''}
            placeholder="Contact Name"
            onChange={(ov, nv) => {
              upsertContactRow(row, { contact_name: nv });
            }}
          />
        ),
      },
      {
        key: 'contact_number',
        label: 'Contact Number',
        sortType: 'string',
        getSortValue: (row) =>
          row.contact_number || row.contact_value || row.value || '',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={
              row.contact_number || row.contact_value || row.value || ''
            }
            placeholder="Contact Number"
            onChange={(ov, nv) =>
              upsertContactRow(row, {
                contact_number: nv,
                contact_value: nv,
              })
            }
          />
        ),
      },
      {
        key: 'contact_email',
        label: 'Contact Email',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.contact_email || ''}
            placeholder="Contact Email"
            type="email"
            onChange={(ov, nv) => {
              upsertContactRow(row, { contact_email: nv });
            }}
          />
        ),
      },
      {
        key: 'remark',
        label: 'Remark',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.remark || ''}
            placeholder="Remark"
            rows={2}
            onChange={(ov, nv) => {
              upsertContactRow(row, { remark: nv });
            }}
          />
        ),
      },
    ],
    [contactTypeOptions, upsertContactRow],
  );

  return (
    <Main_InputContainer label="Supplier Contacts">
      <div className={styles.tableSection}>
        <EditableDataForm
          rows={contactRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No contacts yet. Click + Add Contact."
          onAddRow={handleAddContactRow}
          addRowText="Add Contact"
          onRemoveRow={handleDeleteContactRow}
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_SupplierContacts;
