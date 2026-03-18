import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_SupplierContacts.module.css';

const Main_SupplierContacts = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { contactType } = useMasterContext();
  const contactRows = pageData.supplier_contacts || [];

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
      upsertSupplierPageData({
        supplier_contacts: [
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

  const handleAddContactRow = useCallback(() => {
    upsertSupplierPageData({
      supplier_contacts: [
        {
          id: uuidv4(),
          supplier_id: pageData.id,
          contact_type_id: '',
          contact_name: '',
          contact_number: '',
          contact_email: '',
          remark: '',
        },
      ],
    });
  }, [upsertSupplierPageData, pageData.id]);

  const handleDeleteContactRow = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertSupplierPageData({
        supplier_contacts: [{ id: row.id, _delete: true }],
      });
    },
    [upsertSupplierPageData],
  );

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
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.remark || ''}
            placeholder="Remark"
            onChange={(ov, nv) => {
              upsertContactRow(row, { remark: nv });
            }}
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
            onClick={() => handleDeleteContactRow(row)}
          >
            Delete
          </button>
        ),
      },
    ],
    [contactTypeOptions, upsertContactRow, handleDeleteContactRow],
  );

  return (
    <Main_InputContainer label="Supplier Contacts">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddContactRow}
            text="Add Contact"
            ariaLabel="Add new contact"
            title="Add Contact"
          />
        </div>

        <EditableDataTable
          rows={contactRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No contacts yet. Click + Add Contact."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_SupplierContacts;
