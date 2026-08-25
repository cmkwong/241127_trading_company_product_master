import { useEffect, useState } from 'react';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from '../Main_SupplierMaster.module.css';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';

const Main_SupplierBasicInfo = () => {
  const { supplierType } = useMasterContext();
  const supplierId = useEntityField('supplier', 'id');
  const supplierCode = useEntityField('supplier', 'supplier_code');
  const supplierCodeCompat = useEntityField('supplier', 'code');
  const supplierName = useEntityField('supplier', 'name');
  const supplierScore = useEntityField('supplier', 'score');
  const supplierTypeId = useEntityField('supplier', 'supplier_type_id');
  const supplierRemark = useEntityField('supplier', 'remark');
  const supplierTypes = useEntityRows('supplier', 'supplier_types');

  const [selectedSupplierTypeIds, setSelectedSupplierTypeIds] = useState(() => {
    const relationIds =
      supplierTypes?.map((item) => item.supplier_type_id) || [];
    if (relationIds.length > 0) return relationIds;
    return supplierTypeId ? [supplierTypeId] : [];
  });

  useEffect(() => {
    const relationIds =
      supplierTypes?.map((item) => item.supplier_type_id) || [];
    if (relationIds.length > 0) {
      setSelectedSupplierTypeIds(relationIds);
      return;
    }
    setSelectedSupplierTypeIds(supplierTypeId ? [supplierTypeId] : []);
  }, [supplierTypes, supplierTypeId]);

  const handleSupplierTypeChange = (ov, nv) => {
    if (nv.length > ov.length) {
      const addedTypeIds = nv.filter((id) => !ov.includes(id));
      addedTypeIds.forEach((typeId) => {
        upsertEntityData('supplier', {
          supplier_types: [
            {
              supplier_id: supplierId,
              supplier_type_id: typeId,
            },
          ],
        });
      });
    } else if (nv.length < ov.length) {
      const removedTypeIds = ov.filter((id) => !nv.includes(id));
      const relationsToDelete = (supplierTypes || []).filter((rel) =>
        removedTypeIds.includes(rel.supplier_type_id),
      );

      relationsToDelete.forEach((rel) => {
        upsertEntityData('supplier', {
          supplier_types: [
            {
              id: rel.id,
              supplier_id: supplierId,
              supplier_type_id: rel.supplier_type_id,
              _delete: true,
            },
          ],
        });
      });
    }

    // Keep compatibility with existing single-type field where used.
    upsertEntityData('supplier', { supplier_type_id: nv[0] || '' });
  };

  return (
    <SplitLayout>
      <VerticalLayout>
        <Main_InputContainer label="Supplier Code">
          <Main_TextField
            defaultValue={supplierCode || supplierCodeCompat || ''}
            placeholder="Supplier Code"
            onChange={(ov, nv) => {
              upsertEntityData('supplier', { supplier_code: nv, code: nv });
            }}
          />
        </Main_InputContainer>
        <Main_InputContainer label="Supplier Name">
          <Main_TextField
            defaultValue={supplierName || ''}
            placeholder="Supplier Name"
            onChange={(ov, nv) => {
              upsertEntityData('supplier', {
                name: nv,
              });
            }}
          />
        </Main_InputContainer>
        <Main_InputContainer label="Supplier Score">
          <Main_TextField
            defaultValue={String(supplierScore ?? 1)}
            placeholder="1 - 10"
            type="number"
            onChange={(ov, nv) => {
              const parsed = Number.parseFloat(nv);
              const safeValue = Number.isNaN(parsed)
                ? 1
                : Math.min(10, Math.max(1, parsed));
              upsertEntityData('supplier', { score: safeValue });
            }}
          />
        </Main_InputContainer>
        <Main_InputContainer label="Supplier Type">
          <Main_TagInputField
            key="supplier-type-input"
            defaultOptions={supplierType}
            defaultSelectedOptions={selectedSupplierTypeIds}
            onChange={handleSupplierTypeChange}
            canAddNewOptions={false}
            enableHierarchyViewToggle={true}
            hierarchyToggleLabel="Show Hierarchy"
          />
        </Main_InputContainer>
      </VerticalLayout>
      <Main_InputContainer
        label="Company Remark"
        className={styles.companyRemarkContainer}
      >
        <Main_TextArea
          label="Remark"
          defaultValue={supplierRemark || ''}
          placeholder="Supplier Remark"
          onChange={(ov, nv) => {
            upsertEntityData('supplier', { remark: nv });
          }}
        />
      </Main_InputContainer>
    </SplitLayout>
  );
};

export default Main_SupplierBasicInfo;
