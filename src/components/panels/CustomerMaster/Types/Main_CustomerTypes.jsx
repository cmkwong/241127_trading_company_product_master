import { useEffect, useMemo, useState } from 'react';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';

const Main_CustomerTypes = () => {
  const customerId = useEntityField('customer', 'id');
  const customerTypeRows = useEntityRows('customer', 'customer_types');
  const { customerType = [], getMasterTableData } = useMasterContext();

  const customerTypeOptions = useMemo(() => {
    const fallbackRows =
      typeof getMasterTableData === 'function'
        ? getMasterTableData('master_customer_types')
        : [];

    return Array.isArray(customerType) && customerType.length > 0
      ? customerType
      : fallbackRows;
  }, [customerType, getMasterTableData]);

  const [selectedTypeIds, setSelectedTypeIds] = useState(() => {
    return (customerTypeRows || [])
      .map((item) => item?.customer_type_id)
      .filter(Boolean);
  });

  useEffect(() => {
    setSelectedTypeIds(
      (customerTypeRows || [])
        .map((item) => item?.customer_type_id)
        .filter(Boolean),
    );
  }, [customerTypeRows]);

  const handleTypeChange = (ov, nv) => {
    if (nv.length > ov.length) {
      const addedTypeIds = nv.filter((id) => !ov.includes(id));
      addedTypeIds.forEach((typeId) => {
        upsertEntityData('customer', {
          customer_types: [
            {
              customer_id: customerId,
              customer_type_id: typeId,
            },
          ],
        });
      });
    } else if (nv.length < ov.length) {
      const removedTypeIds = ov.filter((id) => !nv.includes(id));
      const relationsToDelete = (customerTypeRows || []).filter((rel) =>
        removedTypeIds.includes(rel.customer_type_id),
      );

      relationsToDelete.forEach((rel) => {
        upsertEntityData('customer', {
          customer_types: [
            {
              id: rel.id,
              customer_id: customerId,
              customer_type_id: rel.customer_type_id,
              _delete: true,
            },
          ],
        });
      });
    }
  };

  return (
    <Main_InputContainer label="Customer Types">
      <Main_TagInputField
        key="customer-type-input"
        defaultOptions={customerTypeOptions}
        defaultSelectedOptions={selectedTypeIds}
        onChange={handleTypeChange}
        canAddNewOptions={false}
      />
    </Main_InputContainer>
  );
};

export default Main_CustomerTypes;
