/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import sharedStyles from '../SupplierMasterShared.module.css';

const LinkRowFields = ({ rowindex, links, supplierLinkType, onUpsert }) => {
  const row = links[rowindex] || {};

  const linkTypeOptions = (supplierLinkType || []).map((item) => ({
    id: item.id,
    name: item.label ?? item.name ?? '',
  }));

  return (
    <div className={sharedStyles.sectionStack}>
      <div className={sharedStyles.rowGrid}>
        <Main_Dropdown
          defaultOptions={linkTypeOptions}
          defaultSelectedOption={row.link_type_id || row.type || ''}
          onChange={(ov, nv) => {
            onUpsert(row.id, { link_type_id: nv });
          }}
        />
        <Main_TextField
          defaultValue={row.link || row.url || ''}
          placeholder="Link URL"
          type="url"
          onChange={(ov, nv) => {
            onUpsert(row.id, { link: nv });
          }}
        />
      </div>
      <Main_TextArea
        defaultValue={row.remark || ''}
        placeholder="Remark"
        onChange={(ov, nv) => {
          onUpsert(row.id, { remark: nv });
        }}
      />
    </div>
  );
};

const Main_SupplierLinks = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { supplierLinkType } = useMasterContext();
  const [rowIds, setRowIds] = useState(
    pageData.supplier_links?.map((row) => row.id) || [],
  );

  useEffect(() => {
    setRowIds(pageData.supplier_links?.map((row) => row.id) || []);
  }, [pageData.supplier_links]);

  const handleRowAdd = useCallback(
    (newId) => {
      upsertSupplierPageData({
        supplier_links: [
          {
            id: newId,
            supplier_id: pageData.id,
          },
        ],
      });
      setRowIds((prev) => [...prev, newId]);
    },
    [pageData.id, upsertSupplierPageData],
  );

  const handleRowRemove = useCallback(
    (id) => {
      upsertSupplierPageData({
        supplier_links: [{ id, _delete: true }],
      });
      setRowIds((prev) => prev.filter((rowId) => rowId !== id));
    },
    [upsertSupplierPageData],
  );

  const handleUpsertRow = useCallback(
    (rowId, patch) => {
      upsertSupplierPageData({
        supplier_links: [
          {
            id: rowId || uuidv4(),
            supplier_id: pageData.id,
            ...patch,
          },
        ],
      });
    },
    [upsertSupplierPageData, pageData.id],
  );

  return (
    <Main_InputContainer label="Supplier Links">
      <ControlRowBtn
        rowIds={rowIds}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <LinkRowFields
          links={pageData.supplier_links || []}
          supplierLinkType={supplierLinkType}
          onUpsert={handleUpsertRow}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_SupplierLinks;
