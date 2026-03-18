/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import sharedStyles from '../SupplierMasterShared.module.css';

const AddressRowFields = ({ rowindex, addresses, addressType, onUpsert }) => {
  const row = addresses[rowindex] || {};

  const addressTypeOptions = (addressType || []).map((item) => ({
    id: item.id,
    name: item.label ?? item.name ?? '',
  }));

  return (
    <div className={sharedStyles.rowGridTwo}>
      <Main_Dropdown
        defaultOptions={addressTypeOptions}
        defaultSelectedOption={row.address_type_id || ''}
        onChange={(ov, nv) => {
          onUpsert(row.id, {
            address_type_id: nv,
          });
        }}
      />
      <Main_TextArea
        defaultValue={row.address || row.value || ''}
        onChange={(ov, nv) => {
          onUpsert(row.id, {
            address: nv,
          });
        }}
        placeholder="Address"
      />
    </div>
  );
};

const Main_SupplierAddresses = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { addressType } = useMasterContext();
  const [rowIds, setRowIds] = useState(
    pageData.supplier_addresses?.map((row) => row.id) || [],
  );

  useEffect(() => {
    setRowIds(pageData.supplier_addresses?.map((row) => row.id) || []);
  }, [pageData.supplier_addresses]);

  const handleRowAdd = useCallback(
    (newId) => {
      upsertSupplierPageData({
        supplier_addresses: [
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
        supplier_addresses: [{ id, _delete: true }],
      });
      setRowIds((prev) => prev.filter((rowId) => rowId !== id));
    },
    [upsertSupplierPageData],
  );

  const handleUpsertRow = useCallback(
    (rowId, patch) => {
      upsertSupplierPageData({
        supplier_addresses: [
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
    <Main_InputContainer label="Supplier Addresses">
      <ControlRowBtn
        rowIds={rowIds}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <AddressRowFields
          addresses={pageData.supplier_addresses || []}
          addressType={addressType}
          onUpsert={handleUpsertRow}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_SupplierAddresses;
