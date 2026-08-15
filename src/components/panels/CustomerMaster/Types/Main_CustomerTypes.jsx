import { useEffect, useMemo, useState } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import { useCustomerContext } from '../../../../store/CustomerContext';
import { useMasterContext } from '../../../../store/MasterContext';

const Main_CustomerTypes = () => {
  const { pageData, upsertCustomerPageData } = useCustomerContext();
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
    return (pageData?.customer_types || [])
      .map((item) => item?.customer_type_id)
      .filter(Boolean);
  });

  useEffect(() => {
    setSelectedTypeIds(
      (pageData?.customer_types || [])
        .map((item) => item?.customer_type_id)
        .filter(Boolean),
    );
  }, [pageData?.customer_types]);

  const handleTypeChange = (ov, nv) => {
    if (nv.length > ov.length) {
      const addedTypeIds = nv.filter((id) => !ov.includes(id));
      addedTypeIds.forEach((typeId) => {
        upsertCustomerPageData({
          customer_types: [
            {
              customer_id: pageData.id,
              customer_type_id: typeId,
            },
          ],
        });
      });
    } else if (nv.length < ov.length) {
      const removedTypeIds = ov.filter((id) => !nv.includes(id));
      const relationsToDelete = (pageData.customer_types || []).filter((rel) =>
        removedTypeIds.includes(rel.customer_type_id),
      );

      relationsToDelete.forEach((rel) => {
        upsertCustomerPageData({
          customer_types: [
            {
              id: rel.id,
              customer_id: pageData.id,
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
