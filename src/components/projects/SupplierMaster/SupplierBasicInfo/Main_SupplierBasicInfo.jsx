import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from '../Main_SupplierMaster.module.css';

const Main_SupplierBasicInfo = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { supplierType } = useMasterContext();

  const supplierTypeOptions = (supplierType || []).map((item) => ({
    id: item.id,
    name: item.label ?? item.name ?? '',
  }));

  return (
    <Main_InputContainer label="Supplier Basic Information">
      <div className={styles.basicInfoGrid}>
        <Main_TextField
          defaultValue={pageData.supplier_code || ''}
          placeholder="Supplier Code"
          onChange={(ov, nv) => {
            upsertSupplierPageData({ supplier_code: nv });
          }}
        />

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

        <Main_Dropdown
          defaultOptions={supplierTypeOptions}
          defaultSelectedOption={pageData.supplier_type_id || ''}
          onChange={(ov, nv) => {
            upsertSupplierPageData({ supplier_type_id: nv });
          }}
        />

        <div className={styles.fullWidthField}>
          <Main_TextArea
            defaultValue={pageData.remark || ''}
            placeholder="Supplier Remark"
            onChange={(ov, nv) => {
              upsertSupplierPageData({ remark: nv });
            }}
          />
        </div>
      </div>
    </Main_InputContainer>
  );
};

export default Main_SupplierBasicInfo;
