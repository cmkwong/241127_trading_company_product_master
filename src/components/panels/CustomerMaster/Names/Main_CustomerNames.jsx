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
import styles from './Main_CustomerNames.module.css';

const Main_CustomerNames = () => {
  const { pageData, upsertCustomerPageData } = useCustomerContext();
  const { customerNameType = [], getMasterTableData } = useMasterContext();

  const nameRows = useMemo(() => pageData.customer_names || [], [pageData]);

  const customerNameTypeOptions = useMemo(() => {
    const fallbackRows =
      typeof getMasterTableData === 'function'
        ? getMasterTableData('master_customer_name_types')
        : [];

    const sourceRows =
      Array.isArray(customerNameType) && customerNameType.length > 0
        ? customerNameType
        : fallbackRows;

    return (sourceRows || []).map((item) => ({
      id: item.id,
      name: item.label || item.name || item.id,
    }));
  }, [customerNameType, getMasterTableData]);

  const getRowNameTypeId = useCallback(
    (row) => row?.name_type_id || row?.customer_name_type_id || '',
    [],
  );

  const upsertNameRow = useCallback(
    (row, patch) => {
      upsertCustomerPageData({
        customer_names: [
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

  const handleAddNameRow = useCallback(() => {
    upsertCustomerPageData({
      customer_names: [
        {
          id: uuidv4(),
          customer_id: pageData.id,
          name_type_id: '',
          name: '',
          remark: '',
        },
      ],
    });
  }, [upsertCustomerPageData, pageData.id, nameRows]);

  const handleDeleteNameRow = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertCustomerPageData({
        customer_names: [{ id: row.id, _delete: true }],
      });
    },
    [upsertCustomerPageData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name_type_id',
        label: 'Name Type',
        sortType: 'string',
        getSortValue: (row) =>
          customerNameTypeOptions.find(
            (item) => item.id === getRowNameTypeId(row),
          )?.name || '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={customerNameTypeOptions}
            defaultSelectedOption={getRowNameTypeId(row)}
            onChange={(ov, nv) => {
              upsertNameRow(row, { name_type_id: nv });
            }}
          />
        ),
      },
      {
        key: 'name',
        label: 'Name',
        sortType: 'string',
        getSortValue: (row) => row.name || '',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.name || ''}
            placeholder="Customer Name"
            onChange={(ov, nv) => {
              upsertNameRow(row, { name: nv });
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
              upsertNameRow(row, { remark: nv });
            }}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteNameRow(row)} />
        ),
      },
    ],
    [
      customerNameTypeOptions,
      getRowNameTypeId,
      upsertNameRow,
      handleDeleteNameRow,
    ],
  );

  return (
    <Main_InputContainer label="Customer Names">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddNameRow}
            text="Add Name"
            ariaLabel="Add new name"
            title="Add Name"
          />
        </div>

        <EditableDataTable
          rows={nameRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No names yet. Click + Add Name."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_CustomerNames;
