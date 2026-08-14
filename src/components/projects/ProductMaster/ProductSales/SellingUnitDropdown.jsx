import { useMemo } from 'react';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';

const SellingUnitDropdown = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { sellingUnitType } = useMasterContext();

  const options = useMemo(
    () =>
      (sellingUnitType || []).map((unit) => ({ id: unit.id, name: unit.name })),
    [sellingUnitType],
  );

  return (
    <Main_Dropdown
      label="Selling Unit"
      defaultOptions={options}
      defaultSelectedOption={
        pageData?.selling_unit_type_id || 'cf5edd88-97b9-11f1-9854-04d9f5f8e870'
      }
      matchParentWidth
      onChange={(ov, nv) =>
        upsertProductPageData({ selling_unit_type_id: nv || '' })
      }
    />
  );
};

export default SellingUnitDropdown;
