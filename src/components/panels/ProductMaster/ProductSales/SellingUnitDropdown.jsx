import { useMemo } from 'react';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import {
  upsertEntityData,
  useEntityField,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';

const SellingUnitDropdown = () => {
  const { sellingUnitType } = useMasterContext();
  const sellingUnitTypeId = useEntityField('products', 'selling_unit_type_id');

  const options = useMemo(
    () =>
      (sellingUnitType || []).map((unit) => ({ id: unit.id, name: unit.name })),
    [sellingUnitType],
  );

  return (
    <Main_Dropdown
      label="Selling Unit"
      defaultOptions={options}
      size={'M'}
      defaultSelectedOption={
        sellingUnitTypeId || 'cf5edd88-97b9-11f1-9854-04d9f5f8e870'
      }
      onChange={(ov, nv) =>
        upsertEntityData('products', { selling_unit_type_id: nv || '' })
      }
    />
  );
};

export default SellingUnitDropdown;
