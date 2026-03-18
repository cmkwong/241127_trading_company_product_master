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

const ContactRowFields = ({ rowindex, contacts, contactType, onUpsert }) => {
  const row = contacts[rowindex] || {};

  const contactTypeOptions = (contactType || []).map((item) => ({
    id: item.id,
    name: item.label ?? item.name ?? '',
  }));

  return (
    <div className={sharedStyles.sectionStack}>
      <div className={sharedStyles.rowGrid}>
        <Main_Dropdown
          defaultOptions={contactTypeOptions}
          defaultSelectedOption={row.contact_type_id || row.type || ''}
          onChange={(ov, nv) => {
            onUpsert(row.id, { contact_type_id: nv });
          }}
        />
        <Main_TextField
          defaultValue={row.contact_name || row.name || ''}
          placeholder="Contact Name"
          onChange={(ov, nv) => {
            onUpsert(row.id, { contact_name: nv });
          }}
        />
        <Main_TextField
          defaultValue={row.contact_value || row.value || ''}
          placeholder="Contact Value"
          onChange={(ov, nv) => {
            onUpsert(row.id, { contact_value: nv });
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

const Main_SupplierContacts = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { contactType } = useMasterContext();
  const [rowIds, setRowIds] = useState(
    pageData.supplier_contacts?.map((row) => row.id) || [],
  );

  useEffect(() => {
    setRowIds(pageData.supplier_contacts?.map((row) => row.id) || []);
  }, [pageData.supplier_contacts]);

  const handleRowAdd = useCallback(
    (newId) => {
      upsertSupplierPageData({
        supplier_contacts: [
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
        supplier_contacts: [{ id, _delete: true }],
      });
      setRowIds((prev) => prev.filter((rowId) => rowId !== id));
    },
    [upsertSupplierPageData],
  );

  const handleUpsertRow = useCallback(
    (rowId, patch) => {
      upsertSupplierPageData({
        supplier_contacts: [
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
    <Main_InputContainer label="Supplier Contacts">
      <ControlRowBtn
        rowIds={rowIds}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <ContactRowFields
          contacts={pageData.supplier_contacts || []}
          contactType={contactType}
          onUpsert={handleUpsertRow}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_SupplierContacts;
