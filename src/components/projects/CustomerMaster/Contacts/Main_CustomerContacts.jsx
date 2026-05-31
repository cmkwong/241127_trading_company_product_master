import { useCallback, useMemo } from 'react';
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
import styles from './Main_CustomerContacts.module.css';

const Main_CustomerContacts = () => {
  const { pageData, upsertCustomerPageData } = useCustomerContext();
  const { contactType = [] } = useMasterContext();

  const contactRows = pageData.customer_contacts || [];

  const contactTypeOptions = useMemo(
    () =>
      (contactType || []).map((item) => ({
        id: item.id,
        name: item.label ?? item.name ?? item.id,
      })),
    [contactType],
  );

  const upsertContactRow = useCallback(
    (row, patch) => {
      upsertCustomerPageData({
        customer_contacts: [
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

  const handleAddContactRow = useCallback(() => {
    upsertCustomerPageData({
      customer_contacts: [
        {
          id: uuidv4(),
          customer_id: pageData.id,
          contact_type_id: '',
          contact_name: '',
          contact_number: '',
          contact_email: '',
          remark: '',
        },
      ],
    });
  }, [upsertCustomerPageData, pageData.id]);

  const handleDeleteContactRow = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertCustomerPageData({
        customer_contacts: [{ id: row.id, _delete: true }],
      });
    },
    [upsertCustomerPageData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'contact_type_id',
        label: 'Contact Type',
        sortType: 'string',
        getSortValue: (row) =>
          contactTypeOptions.find((item) => item.id === row.contact_type_id)
            ?.name || '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={contactTypeOptions}
            defaultSelectedOption={row.contact_type_id || ''}
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
        getSortValue: (row) => row.contact_name || '',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.contact_name || ''}
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
        getSortValue: (row) => row.contact_number || '',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.contact_number || ''}
            placeholder="Contact Number"
            onChange={(ov, nv) => {
              upsertContactRow(row, { contact_number: nv });
            }}
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
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteContactRow(row)} />
        ),
      },
    ],
    [contactTypeOptions, upsertContactRow, handleDeleteContactRow],
  );

  return (
    <Main_InputContainer label="Customer Contacts">
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

export default Main_CustomerContacts;
