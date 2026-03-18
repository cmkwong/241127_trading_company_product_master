/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import styles from './Main_SupplierMaster.module.css';
import SupplierMasterSavePageContainer from './Container/SupplierMasterSavePageContainer';
import Main_SupplierAddresses from './Addresses/Main_SupplierAddresses';
import Main_SupplierContacts from './Contacts/Main_SupplierContacts';
import Main_SupplierLinks from './Links/Main_SupplierLinks';
import Main_SupplierServices from './Services/Main_SupplierServices';
import SupplierSidebar from './AllSupplierList/SupplierSidebar';
import Main_SupplierBasicInfo from './SupplierBasicInfo/Main_SupplierBasicInfo';

const SupplierMasterContent = ({ onSelectSupplier }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={styles.masterContainer}>
      <SupplierSidebar
        onSelectSupplier={onSelectSupplier}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />

      <div
        className={`${styles.container} ${
          sidebarCollapsed ? styles.fullWidth : ''
        }`}
      >
        <div className={styles.inputSide}>
          <Main_SupplierBasicInfo />

          <Main_SupplierAddresses />
          <Main_SupplierContacts />
          <Main_SupplierLinks />
          <Main_SupplierServices />
        </div>
      </div>
    </div>
  );
};

const Main_SupplierMaster = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const onSaveSupplier = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  return (
    <SupplierMasterSavePageContainer
      onSave={onSaveSupplier}
      saveButtonText="Save Supplier"
      successMessage="Supplier saved successfully!"
      initialData={
        selectedSupplier || {
          id: null,
          code: '',
          name: '',
          company_name: '',
          supplier_type_id: '',
          remark: '',
          supplier_addresses: [],
          supplier_contacts: [],
          supplier_links: [],
          supplier_services: [],
        }
      }
    >
      <SupplierMasterContent onSelectSupplier={setSelectedSupplier} />
    </SupplierMasterSavePageContainer>
  );
};

export default Main_SupplierMaster;
