import { useEffect, useState } from 'react';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from '../Main_SupplierMaster.module.css';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';

const Main_SupplierBasicInfo = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { supplierType } = useMasterContext();

  const [selectedSupplierTypeIds, setSelectedSupplierTypeIds] = useState(() => {
    const relationIds =
      pageData.supplier_types?.map((item) => item.supplier_type_id) || [];
    if (relationIds.length > 0) return relationIds;
    return pageData.supplier_type_id ? [pageData.supplier_type_id] : [];
  });

  useEffect(() => {
    const relationIds =
      pageData.supplier_types?.map((item) => item.supplier_type_id) || [];
    if (relationIds.length > 0) {
      setSelectedSupplierTypeIds(relationIds);
      return;
    }
    setSelectedSupplierTypeIds(
      pageData.supplier_type_id ? [pageData.supplier_type_id] : [],
    );
  }, [pageData, pageData.supplier_types, pageData.supplier_type_id]);

  const handleSupplierTypeChange = (ov, nv) => {
    if (nv.length > ov.length) {
      const addedTypeIds = nv.filter((id) => !ov.includes(id));
      addedTypeIds.forEach((typeId) => {
        upsertSupplierPageData({
          supplier_types: [
            {
              supplier_id: pageData.id,
              supplier_type_id: typeId,
            },
          ],
        });
      });
    } else if (nv.length < ov.length) {
      const removedTypeIds = ov.filter((id) => !nv.includes(id));
      const relationsToDelete = (pageData.supplier_types || []).filter((rel) =>
        removedTypeIds.includes(rel.supplier_type_id),
      );

      relationsToDelete.forEach((rel) => {
        upsertSupplierPageData({
          supplier_types: [
            {
              id: rel.id,
              supplier_id: pageData.id,
              supplier_type_id: rel.supplier_type_id,
              _delete: true,
            },
          ],
        });
      });
    }

    // Keep compatibility with existing single-type field where used.
    upsertSupplierPageData({ supplier_type_id: nv[0] || '' });
  };

  return (
    <SplitLayout>
      <VerticalLayout>
        <Main_InputContainer label="Supplier Code">
          <Main_TextField
            defaultValue={pageData.supplier_code || pageData.code || ''}
            placeholder="Supplier Code"
            onChange={(ov, nv) => {
              upsertSupplierPageData({ supplier_code: nv, code: nv });
            }}
          />
        </Main_InputContainer>
        <Main_InputContainer label="Supplier Name">
          <Main_TextField
            defaultValue={pageData.name || ''}
            placeholder="Supplier Name"
            onChange={(ov, nv) => {
              upsertSupplierPageData({
                name: nv,
                company_name: nv,
              });
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
          defaultValue={pageData.remark || ''}
          placeholder="Supplier Remark"
          onChange={(ov, nv) => {
            upsertSupplierPageData({ remark: nv });
          }}
        />
      </Main_InputContainer>
    </SplitLayout>
  );
};

export default Main_SupplierBasicInfo;
