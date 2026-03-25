import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_SupplierLinks.module.css';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';

const Main_SupplierLinks = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { supplierLinkType } = useMasterContext();
  const linkRows = pageData.supplier_links || [];

  const linkTypeOptions = useMemo(
    () =>
      (supplierLinkType || []).map((item) => ({
        id: item.id,
        label: item.label ?? item.name ?? '',
      })),
    [supplierLinkType],
  );

  const upsertLinkRow = useCallback(
    (row, patch) => {
      upsertSupplierPageData({
        supplier_links: [
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

  const handleAddLinkRow = useCallback(() => {
    upsertSupplierPageData({
      supplier_links: [
        {
          id: uuidv4(),
          supplier_id: pageData.id,
          link_type_id: '',
          link: '',
          remark: '',
        },
      ],
    });
  }, [upsertSupplierPageData, pageData.id]);

  const handleDeleteLinkRow = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertSupplierPageData({
        supplier_links: [{ id: row.id, _delete: true }],
      });
    },
    [upsertSupplierPageData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'link_type_id',
        label: 'Link Type',
        sortType: 'string',
        getSortValue: (row) =>
          linkTypeOptions.find((item) => item.id === row.link_type_id)?.label ||
          '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={linkTypeOptions.map((item) => ({
              id: item.id,
              name: item.label,
            }))}
            defaultSelectedOption={row.link_type_id || row.type || ''}
            onChange={(ov, nv) => {
              upsertLinkRow(row, { link_type_id: nv });
            }}
          />
        ),
      },
      {
        key: 'link',
        label: 'Link',
        sortType: 'string',
        getSortValue: (row) => row.link || row.url || '',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.link || row.url || ''}
            placeholder="https://example.com"
            type="link"
            onChange={(ov, nv) => {
              upsertLinkRow(row, { link: nv });
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
              upsertLinkRow(row, { remark: nv });
            }}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteLinkRow(row)} />
        ),
      },
    ],
    [linkTypeOptions, upsertLinkRow, handleDeleteLinkRow],
  );

  return (
    <Main_InputContainer label="Supplier Links">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddLinkRow}
            ariaLabel="Add new link"
            title="Add New Link"
          />
        </div>

        <EditableDataTable
          rows={linkRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No links yet. Click + Add Link."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_SupplierLinks;
